// app/new/NewClient.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const VAT_RATE_DEFAULT = 18;
const currency = (n) => Number(n || 0).toFixed(2);

const parseOptions = (optStr) => {
  if (!optStr) return [];
  const cleaned = optStr.replace(/^.*?:\s*/, '').trim();
  return cleaned.split('|').map((s) => s.trim()).filter(Boolean);
};

async function getNextProposalNumber() {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${yyyy}${mm}`;
  if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
  const { data, error } = await supabase
    .from('proposal')
    .select('proposal_number')
    .like('proposal_number', `${prefix}%`);
  if (error) throw error;
  let maxSeq = 0;
  for (const row of (data || [])) {
    const seq = Number((row.proposal_number || '').slice(6));
    if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }
  const next = String(maxSeq + 1).padStart(5, '0');
  return `${prefix}${next}`;
}

export default function NewClient() {
  const router = useRouter();

  const [editId, setEditId] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = new URLSearchParams(window.location.search).get('id');
      setEditId(id || null);
    }
  }, []);

  const [settings, setSettings] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState(null);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ name:'', phone:'', email:'', address:'' });

  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
        const [{ data: st, error: e1 }, { data: cust, error: e2 }, { data: prods, error: e3 }] = await Promise.all([
          supabase.from('settings').select('*').limit(1).maybeSingle(),
          supabase.from('customer').select('id, name, phone, email, address').order('name'),
          supabase.from('product').select('id, category, name, unit_label, base_price, notes, options').order('category').order('name')
        ]);
        if (e1) throw e1;
        if (e2) throw e2;
        if (e3) throw e3;
        setSettings(st ?? { vat_rate: VAT_RATE_DEFAULT, default_payment_terms: 'מזומן / המחאה / העברה בנקאית / שוטף +30' });
        setPaymentTerms((st?.default_payment_terms) || 'מזומן / המחאה / העברה בנקאית / שוטף +30');
        setCustomers(cust || []);
        setProducts(prods || []);
      } catch (err) {
        setError(err.message || String(err));
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!editId) return;
    const loadExisting = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
        const { data: p, error: e1 } = await supabase
          .from('proposal')
          .select('id, customer_id, payment_terms, notes, discount_value, subtotal, vat_rate')
          .eq('id', editId)
          .maybeSingle();
        if (e1) throw e1;
        if (!p) throw new Error('הצעה לא נמצאה לעריכה');

        setCustomerId(p.customer_id || null);
        setPaymentTerms(p.payment_terms || '');
        setNotes(p.notes || '');
        const pct = p.subtotal ? (Number(p.discount_value || 0) / Number(p.subtotal)) * 100 : 0;
        setDiscountPct(Number(pct.toFixed(2)));

        const { data: it, error: e2 } = await supabase
          .from('proposal_item')
          .select('id, product_id, product_name, custom_name, qty, unit_price, line_total, notes')
          .eq('proposal_id', editId)
          .order('created_at', { ascending: true });
        if (e2) throw e2;

        const mapped = (it || []).map((row) => ({
          id: row.id,
          isCustom: !row.product_id,
          product_id: row.product_id || null,
          name: row.custom_name || row.product_name || 'פריט',
          qty: Number(row.qty || 1),
          unit_price: Number(row.unit_price || 0),
          notes: row.notes || '',
          selectedOptions: [] // אם תרצה לפענח אופציות מה־notes אפשר להוסיף כאן
        }));
        setItems(mapped);
      } catch (err) {
        setError(err.message || String(err));
      }
    };
    loadExisting();
  }, [editId]);

  const vatRate = Number(settings?.vat_rate ?? 18);
  const vatFactor = 1 + (vatRate / 100);

  const grossSubtotal = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.qty || 0) * Number(it.unit_price || 0), 0),
    [items]
  );
  const netSubtotal = useMemo(() => grossSubtotal / vatFactor, [grossSubtotal, vatFactor]);
  const discountValue = useMemo(() => netSubtotal * (Number(discountPct || 0) / 100), [netSubtotal, discountPct]);
  const netAfterDiscount = useMemo(() => Math.max(0, netSubtotal - discountValue), [netSubtotal, discountValue]);
  const vatAmount = useMemo(() => netAfterDiscount * (vatRate / 100), [netAfterDiscount, vatRate]);
  const total = useMemo(() => netAfterDiscount + vatAmount, [netAfterDiscount, vatAmount]);

  const addCustomItem = () => {
    setItems((prev) => [...prev, { isCustom: true, product_id: null, name: 'פריט כללי', qty: 1, unit_price: 0, notes: '' }]);
  };
  const addProduct = (p) => {
    setItems((prev) => [...prev, { isCustom: false, product_id: p.id, name: p.name, qty: 1, unit_price: Number(p.base_price || 0), notes: '' }]);
    setShowCatalogPicker(false);
    setCatalogSearch('');
  };
  const updateItem = (idx, patch) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const saveQuote = async () => {
    try {
      if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
      setSaving(true);
      setError(null);
      if (!customerId) throw new Error('בחר לקוח');

      let proposalId = editId;
      let proposalNumber = null;
      if (!proposalId) {
        proposalNumber = await getNextProposalNumber();
      }

      const payload = {
        proposal_number: proposalNumber || undefined,
        customer_id: customerId,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        subtotal: netSubtotal,
        discount_value: discountValue,
        include_discount_row: discountValue > 0,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total: total
      };

      if (!proposalId) {
        const { data: p, error: e1 } = await supabase.from('proposal').insert(payload).select('id').maybeSingle();
        if (e1) throw e1;
        proposalId = p.id;
      } else {
        const { error: e2 } = await supabase.from('proposal').update(payload).eq('id', proposalId);
        if (e2) throw e2;
        const { error: e3 } = await supabase.from('proposal_item').delete().eq('proposal_id', proposalId);
        if (e3) throw e3;
      }

      const rows = items.map((it) => ({
        proposal_id: proposalId,
        product_id: it.isCustom ? null : it.product_id,
        product_name: it.isCustom ? null : it.name,
        custom_name: it.isCustom ? it.name : null,
        qty: Number(it.qty || 0),
        unit_price: Number(it.unit_price || 0),
        line_total: Number(it.qty || 0) * Number(it.unit_price || 0),
        notes: it.notes || null
      }));

      if (rows.length) {
        const { error: e4 } = await supabase.from('proposal_item').insert(rows);
        if (e4) throw e4;
      }

      router.push(`/quote/${proposalId}`);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const visibleProducts = useMemo(() => {
    const q = (catalogSearch || '').trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [products, catalogSearch]);

  return (
    <main dir="rtl" style={{ maxWidth: 1100, margin: '0 auto', padding: 16, fontFamily: 'system-ui, Arial' }}>
      <h1 style={{ marginTop: 0 }}>{editId ? 'עריכת הצעת מחיר' : 'הצעת מחיר חדשה'}</h1>
      {error && <div style={{ background:'#ffe8e8', border:'1px solid #f5b5b5', padding:8, borderRadius:8, marginBottom:8 }}>שגיאה: {error}</div>}

      <section style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <label style={{ fontWeight: 700 }}>לקוח</label>
        <div style={{ display:'flex', gap:8 }}>
          <select value={customerId || ''} onChange={e => setCustomerId(e.target.value || null)} style={{ flex:1, padding: 8, borderRadius: 8, border: '1px solid #ddd' }}>
            <option value="">בחר לקוח…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button onClick={() => setShowNewCustomer(true)} style={{ padding:'8px 12px', fontWeight:700 }}>➕ לקוח חדש</button>
        </div>
      </section>

      {showNewCustomer && (
        <div style={{ border:'1px solid #ddd', borderRadius:10, padding:12, marginBottom:12, background:'#fcfcfc' }}>
          <div style={{ fontWeight:700, marginBottom:8 }}>לקוח חדש</div>
          <div style={{ display:'grid', gap:8 }}>
            <input placeholder="שם לקוח *" value={newCust.name} onChange={e=>setNewCust(s=>({ ...s, name:e.target.value }))} style={{ padding:8, borderRadius:8, border:'1px solid #ddd' }}/>
            <input placeholder="טלפון" value={newCust.phone} onChange={e=>setNewCust(s=>({ ...s, phone:e.target.value }))} style={{ padding:8, borderRadius:8, border:'1px solid #ddd' }}/>
            <input placeholder="אימייל" value={newCust.email} onChange={e=>setNewCust(s=>({ ...s, email:e.target.value }))} style={{ padding:8, borderRadius:8, border:'1px solid #ddd' }}/>
            <input placeholder="כתובת" value={newCust.address} onChange={e=>setNewCust(s=>({ ...s, address:e.target.value }))} style={{ padding:8, borderRadius:8, border:'1px solid #ddd' }}/>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={async () => {
              try {
                if (!newCust.name.trim()) throw new Error('שם לקוח חובה');
                const { data, error } = await supabase.from('customer').insert({
                  name: newCust.name.trim(),
                  phone: newCust.phone?.trim() || null,
                  email: newCust.email?.trim() || null,
                  address: newCust.address?.trim() || null
                }).select('id, name').maybeSingle();
                if (error) throw error;
                setCustomers((prev)=>[...prev, data]);
                setCustomerId(data.id);
                setShowNewCustomer(false);
                setNewCust({ name:'', phone:'', email:'', address:'' });
              } catch (e) {
                alert(e.message || String(e));
              }
            }} style={{ padding:'8px 12px', fontWeight:700 }}>שמור לקוח</button>
            <button onClick={()=>setShowNewCustomer(false)} style={{ padding:'8px 12px', border:'1px solid #ddd', borderRadius:8 }}>ביטול</button>
          </div>
        </div>
      )}

      <section style={{ border:'1px solid #eee', borderRadius:10, padding:12, marginBottom:12 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
          <button onClick={() => setShowCatalogPicker(true)} style={{ padding:'8px 12px', fontWeight:700 }}>➕ פריט מהקטלוג</button>
          <button onClick={addCustomItem} style={{ padding:'8px 12px', fontWeight:700 }}>➕ פריט כללי</button>
        </div>

        {showCatalogPicker && (
          <div style={{ border:'1px solid #ddd', borderRadius:10, padding:10, marginBottom:12, background:'#fafafa' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
              <input
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                placeholder="חיפוש מהיר (שם/קטגוריה)…"
                style={{ flex:1, padding:8, borderRadius:8, border:'1px solid #ddd' }}
              />
              <button onClick={()=>{ setShowCatalogPicker(false); setCatalogSearch(''); }} style={{ padding:'8px 12px' }}>סגור</button>
            </div>
            <div style={{ maxHeight: 260, overflow:'auto' }}>
              {visibleProducts.length === 0 && <div style={{ color:'#666' }}>לא נמצאו מוצרים.</div>}
              {visibleProducts.map((p) => (
                <div key={p.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:8, alignItems:'center', padding:'6px 0', borderBottom:'1px dashed #eee' }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:'#666' }}>
                      {p.category} {p.unit_label ? `· ${p.unit_label}` : ''} · {currency(p.base_price)} ₪
                    </div>
                    {p.options && <div style={{ fontSize:12, color:'#888' }}>{p.options}</div>}
                  </div>
                  <div style={{ fontWeight:700 }}>{currency(p.base_price)} ₪</div>
                  <button onClick={() => addProduct(p)} style={{ padding:'6px 10px' }}>בחר</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign:'right', borderBottom:'1px solid #ddd', padding:8 }}>פריט</th>
              <th style={{ textAlign:'center', borderBottom:'1px solid #ddd', padding:8, width:80 }}>כמות</th>
              <th style={{ textAlign:'center', borderBottom:'1px solid #ddd', padding:8, width:140 }}>מחיר יח׳ (₪, כולל מע״מ)</th>
              <th style={{ textAlign:'right', borderBottom:'1px solid #ddd', padding:8 }}>הערות</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #ddd', padding:8, width:120 }}>סה״כ שורה (₪)</th>
              <th style={{ borderBottom:'1px solid #ddd', padding:8, width:60 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8 }}>
                  {it.isCustom ? (
                    <input
                      value={it.name}
                      onChange={e => updateItem(idx, { name: e.target.value })}
                      style={{ width:'100%', padding:6, borderRadius:6, border:'1px solid #ddd' }}
                      placeholder="שם פריט…"
                    />
                  ) : (
                    <div style={{ fontWeight:700 }}>{it.name}</div>
                  )}
                </td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'center' }}>
                  <input
                    type="number" min={0}
                    value={it.qty}
                    onChange={e => updateItem(idx, { qty: Number(e.target.value || 0) })}
                    style={{ width:70, padding:6, borderRadius:6, border:'1px solid #ddd', textAlign:'center' }}
                  />
                </td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'center' }}>
                  <input
                    type="number" step="0.01" min={0}
                    value={it.unit_price}
                    onChange={e => updateItem(idx, { unit_price: Number(e.target.value || 0) })}
                    style={{ width:140, padding:6, borderRadius:6, border:'1px solid #ddd', textAlign:'center' }}
                  />
                </td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8 }}>
                  <input
                    value={it.notes || ''}
                    onChange={e => updateItem(idx, { notes: e.target.value })}
                    style={{ width:'100%', padding:6, borderRadius:6, border:'1px solid #ddd' }}
                    placeholder="הערות…"
                  />
                </td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'left', fontWeight:700 }}>
                  {currency(Number(it.qty || 0) * Number(it.unit_price || 0))} ₪
                </td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'center' }}>
                  <button onClick={() => removeItem(idx)} style={{ padding:'6px 10px' }}>מחיקה</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding:12, color:'#666' }}>לא נבחרו פריטים עדיין.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section style={{ display:'grid', gap:8, justifyContent:'end', marginBottom:12 }}>
        <div style={{ textAlign:'left' }}>ביניים (לפני מע״מ): <b>{currency(netSubtotal)} ₪</b></div>
        <div style={{ textAlign:'left' }}>
          הנחה (%):
          <input
            type="number" min={0} max={100}
            value={discountPct}
            onChange={e => setDiscountPct(Number(e.target.value || 0))}
            style={{ width:80, marginInlineStart:8, padding:6, borderRadius:6, border:'1px solid #ddd', textAlign:'center' }}
          />
          {discountPct > 0 && <span style={{ marginInlineStart:8 }}>(-{currency(discountValue)} ₪)</span>}
        </div>
        <div style={{ textAlign:'left' }}>מע״מ ({vatRate}%): <b>{currency(vatAmount)} ₪</b></div>
        <div style={{ textAlign:'left', fontSize:18 }}>סה״כ לתשלום: <b>{currency(total)} ₪</b></div>
      </section>

      <section style={{ display:'grid', gap:8, marginBottom:16 }}>
        <div>
          <div style={{ fontWeight:700, marginBottom:4 }}>תנאי תשלום</div>
          <textarea rows={2} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} style={{ width:'100%', padding:8, borderRadius:8, border:'1px solid #ddd' }} placeholder="מזומן / המחאה / העברה בנקאית / שוטף +30" />
        </div>
        <div>
          <div style={{ fontWeight:700, marginBottom:4 }}>הערות</div>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} style={{ width:'100%', padding:8, borderRadius:8, border:'1px solid #ddd' }} placeholder="הערות להצעה…" />
        </div>
      </section>

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={saveQuote} disabled={saving} style={{ padding:'10px 14px', fontWeight:700 }}>
          {saving ? 'שומר…' : 'שמור הצעה'}
        </button>
        <a href="/quotes" style={{ padding:'10px 14px', border:'1px solid #ddd', borderRadius:8, textDecoration:'none' }}>
          חזרה לרשימת הצעות
        </a>
      </div>
    </main>
  );
}
