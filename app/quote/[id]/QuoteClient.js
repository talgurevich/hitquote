'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

const currency = (n) => Number(n || 0).toFixed(2);

export default function QuoteClient({ id }) {
  const [settings, setSettings] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');

        const [{ data: st, error: e1 }, { data: p, error: e2 }] = await Promise.all([
          supabase.from('settings').select('*').limit(1).maybeSingle(),
          supabase
            .from('proposal')
            .select('id, proposal_number, customer_id, payment_terms, notes, subtotal, discount_value, include_discount_row, vat_rate, vat_amount, total, created_at, customer:customer (name, phone, email, address)')
            .eq('id', id)
            .maybeSingle()
        ]);
        if (e1) throw e1;
        if (e2) throw e2;
        setSettings(st || {});
        setProposal(p);

        const { data: it, error: e3 } = await supabase
          .from('proposal_item')
          .select('id, product_id, product_name, custom_name, qty, unit_price, line_total, notes')
          .eq('proposal_id', id)
          .order('created_at', { ascending: true });
        if (e3) throw e3;
        setItems(it || []);
      } catch (err) {
        setError(err.message || String(err));
      }
    };
    load();
  }, [id]);

  const shareMail = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.location.href = `mailto:?subject=${encodeURIComponent('הצעת מחיר')}&body=${encodeURIComponent(url)}`;
  };
  const shareWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  };

  if (error) {
    return <main dir="rtl" style={{ padding:16 }}><div style={{ background:'#ffe8e8', border:'1px solid #f5b5b5', padding:8, borderRadius:8 }}>שגיאה: {error}</div></main>;
  }
  if (!proposal) {
    return <main dir="rtl" style={{ padding:16 }}>טוען…</main>;
  }

  const vatRate = Number(proposal.vat_rate || settings?.vat_rate || 18);

  return (
    <main dir="rtl" style={{ maxWidth: 900, margin:'0 auto', padding:16, fontFamily:'system-ui, Arial' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800 }}>הצעת מחיר</div>
          <div>מס׳ הצעה: <b>{proposal.proposal_number || proposal.id.slice(0,8)}</b></div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={shareMail} style={{ padding:'8px 12px' }}>שליחה במייל</button>
          <button onClick={shareWhatsApp} style={{ padding:'8px 12px' }}>שיתוף וואטסאפ</button>
          <Link href={`/new?id=${proposal.id}`} style={{ padding:'8px 12px', border:'1px solid #ddd', borderRadius:8, textDecoration:'none' }}>
            עריכה
          </Link>
        </div>
      </div>

      <section style={{ border:'1px solid #eee', borderRadius:10, padding:12, marginBottom:12 }}>
        <div style={{ fontWeight:700, marginBottom:4 }}>לכבוד:</div>
        <div>{proposal.customer?.name}</div>
        {proposal.customer?.phone && <div>טלפון: {proposal.customer.phone}</div>}
        {proposal.customer?.email && <div>אימייל: {proposal.customer.email}</div>}
        {proposal.customer?.address && <div>כתובת: {proposal.customer.address}</div>}
      </section>

      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead>
          <tr>
            <th style={{ textAlign:'right', borderBottom:'1px solid #ddd', padding:8 }}>פריט</th>
            <th style={{ textAlign:'center', borderBottom:'1px solid #ddd', padding:8, width:80 }}>כמות</th>
            <th style={{ textAlign:'center', borderBottom:'1px solid #ddd', padding:8, width:140 }}>מחיר יח׳ (₪)</th>
            <th style={{ textAlign:'right', borderBottom:'1px solid #ddd', padding:8 }}>הערות / מילויים</th>
            <th style={{ textAlign:'left', borderBottom:'1px solid #ddd', padding:8, width:120 }}>סה״כ שורה</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const name = it.custom_name || it.product_name || 'פריט';
            return (
              <tr key={it.id}>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, fontWeight:700 }}>{name}</td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'center' }}>{it.qty}</td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'center' }}>{currency(it.unit_price)} ₪</td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8 }}>{it.notes || '—'}</td>
                <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'left', fontWeight:700 }}>
                  {currency(it.line_total)} ₪
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={5} style={{ padding:12, color:'#666' }}>אין שורות להצגה.</td></tr>
          )}
        </tbody>
      </table>

      <section style={{ display:'grid', gap:6, justifyContent:'end', marginBottom:16 }}>
        <div>ביניים (לפני מע״מ): <b>{currency(proposal.subtotal)} ₪</b></div>
        {proposal.include_discount_row && (
          <div>הנחה: <b>-{currency(proposal.discount_value)} ₪</b></div>
        )}
        <div>מע״מ ({vatRate}%): <b>{currency(proposal.vat_amount)} ₪</b></div>
        <div style={{ fontSize:18 }}>סה״כ לתשלום: <b>{currency(proposal.total)} ₪</b></div>
      </section>

      <section style={{ display:'grid', gap:6, marginBottom:16 }}>
        {proposal.payment_terms && (
          <div><b>תנאי תשלום:</b> {proposal.payment_terms}</div>
        )}
        {proposal.notes && (
          <div><b>הערות:</b> {proposal.notes}</div>
        )}
      </section>

      <div style={{ display:'flex', gap:8 }}>
        <Link href="/quotes" style={{ padding:'10px 14px', border:'1px solid #ddd', borderRadius:8, textDecoration:'none' }}>
          חזרה לרשימת הצעות
        </Link>
      </div>
    </main>
  );
}
