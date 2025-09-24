// app/new/NewClient.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import HamburgerMenu from '../components/HamburgerMenu';
import { useSession } from 'next-auth/react';
import { validateSessionAndGetBusinessUserId } from '../../lib/businessUserUtils';

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
  const { data: session } = useSession();

  const [editId, setEditId] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = new URLSearchParams(window.location.search).get('id');
      setEditId(id || null);
    }
  }, []);

  const [userId, setUserId] = useState(null);
  const [settings, setSettings] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState(null);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'absolute'
  const [discountAmount, setDiscountAmount] = useState(0);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ name:'', phone:'', email:'', address:'' });

  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
        if (!session?.user?.id) return;
        
        // Get properly converted user ID
        const businessUserId = await validateSessionAndGetBusinessUserId(session);
        setUserId(businessUserId);
        
        const [{ data: stResult, error: e1 }, { data: custResult, error: e2 }, { data: prodsResult, error: e3 }] = await Promise.all([
          supabase.from('settings').select('*').eq('user_id', businessUserId).limit(1).maybeSingle(),
          supabase.from('customer').select('id, name, phone, email, address').eq('user_id', businessUserId).order('name'),
          supabase.from('product').select('id, category, name, unit_label, base_price, notes, options').eq('user_id', businessUserId).order('category').order('name')
        ]);
        
        if (e1) throw e1;
        if (e2) throw e2;
        if (e3) throw e3;
        
        let st = stResult;
        let cust = custResult || [];
        let prods = prodsResult || [];
        setSettings(st ?? { vat_rate: VAT_RATE_DEFAULT, default_payment_terms: 'מזומן / המחאה / העברה בנקאית / שוטף +30' });
        setPaymentTerms((st?.default_payment_terms) || 'מזומן / המחאה / העברה בנקאית / שוטף +30');
        setCustomers(cust || []);
        setProducts(prods || []);
      } catch (err) {
        setError(err.message || String(err));
      }
    };
    if (session?.user?.id) {
      load();
    }
  }, [session]);

  useEffect(() => {
    if (!editId) return;
    const loadExisting = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
        const { data: p, error: e1 } = await supabase
          .from('proposal')
          .select('id, customer_id, payment_terms, notes, delivery_date, discount_value, subtotal, vat_rate')
          .eq('id', editId)
          .maybeSingle();
        if (e1) throw e1;
        if (!p) throw new Error('הצעה לא נמצאה לעריכה');

        setCustomerId(p.customer_id || null);
        setPaymentTerms(p.payment_terms || '');
        setNotes(p.notes || '');
        setDeliveryDate(p.delivery_date || '');
        const discountVal = Number(p.discount_value || 0);
        if (discountVal > 0) {
          // Check if discount is likely percentage-based (less than subtotal)
          const pct = p.subtotal ? (discountVal / Number(p.subtotal)) * 100 : 0;
          if (pct <= 100) {
            setDiscountType('percentage');
            setDiscountPct(Number(pct.toFixed(2)));
          } else {
            setDiscountType('absolute');
            setDiscountAmount(discountVal);
          }
        }

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
  const discountValue = useMemo(() => {
    if (discountType === 'percentage') {
      return netSubtotal * (Number(discountPct || 0) / 100);
    } else {
      return Number(discountAmount || 0);
    }
  }, [netSubtotal, discountPct, discountType, discountAmount]);
  const netAfterDiscount = useMemo(() => Math.max(0, netSubtotal - discountValue), [netSubtotal, discountValue]);
  const vatAmount = useMemo(() => netAfterDiscount * (vatRate / 100), [netAfterDiscount, vatRate]);
  const total = useMemo(() => netAfterDiscount + vatAmount, [netAfterDiscount, vatAmount]);

  const addCustomItem = () => {
    setItems((prev) => [...prev, { isCustom: true, product_id: null, name: 'פריט כללי', qty: 1, unit_price: 0, notes: '' }]);
  };
  const addProduct = (p) => {
    // Check if product has options
    const availableOptions = parseOptions(p.options);
    if (availableOptions.length > 0) {
      // Show options modal for selection
      setSelectedProduct(p);
      setSelectedOptions([]);
      setShowOptionsModal(true);
    } else {
      // Add product directly without options
      addProductWithOptions(p, []);
    }
  };

  const addProductWithOptions = (p, selectedOpts) => {
    const optionsText = selectedOpts.length > 0 ? selectedOpts.join(', ') : '';
    setItems((prev) => [...prev, { 
      isCustom: false, 
      product_id: p.id, 
      name: p.name, 
      qty: 1, 
      unit_price: Number(p.base_price || 0), 
      notes: optionsText ? `אפשרויות: ${optionsText}` : '',
      selectedOptions: selectedOpts
    }]);
    setShowCatalogPicker(false);
    setShowOptionsModal(false);
    setCatalogSearch('');
    setSelectedProduct(null);
    setSelectedOptions([]);
  };
  const updateItem = (idx, patch) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const saveQuote = async () => {
    try {
      if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
      setSaving(true);
      setError(null);
      if (!customerId) throw new Error('בחר לקוח');
      if (!deliveryDate) throw new Error('בחר תאריך משלוח');

      // Use the already fetched user ID from state
      if (!userId) throw new Error('User ID not found');

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
        delivery_date: deliveryDate || null,
        subtotal: netSubtotal,
        discount_value: discountValue,
        include_discount_row: discountValue > 0,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total: total,
        user_id: userId
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
        notes: it.notes || null,
        user_id: userId
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
    <>
      <HamburgerMenu />
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-header {
            flex-direction: column !important;
            text-align: center !important;
            padding: 15px !important;
          }
          .mobile-buttons {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .mobile-totals {
            max-width: 100% !important;
          }
          .mobile-content {
            padding: 15px !important;
          }
          .desktop-table {
            display: none !important;
          }
          .mobile-items {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-items {
            display: none !important;
          }
          .desktop-table {
            display: block !important;
          }
        }
      `}</style>
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fdfdff 0%, #c6c5b9 100%)',
        padding: '10px 10px 10px 80px', // Extra padding on right for hamburger menu
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="mobile-header" style={{
          background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
          color: '#fdfdff',
          padding: '40px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {settings?.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="לוגו העסק" 
                style={{ height: '50px', width: 'auto' }}
              />
            )}
            <div>
              <h1 style={{ 
                margin: '0 0 5px 0', 
                fontSize: '32px', 
                fontWeight: 'bold' 
              }}>
                {editId ? 'עריכת הצעת מחיר' : 'הצעת מחיר חדשה'}
              </h1>
              <p style={{ 
                margin: 0, 
                opacity: 0.9, 
                fontSize: '16px' 
              }}>
                {editId ? 'עדכון פרטי הצעה קיימת' : 'יצירת הצעת מחיר חדשה'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {error && (
            <div style={{
              background: '#fdfdff',
              border: '1px solid #c6c5b9',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              color: '#393d3f',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              &#x26A0; <strong>שגיאה:</strong> {error}
            </div>
          )}

          {/* Customer Selection */}
          <section style={{
            background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
            border: '1px solid #c6c5b9',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <label style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#393d3f',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              &#x1F464; בחירת לקוח
            </label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                value={customerId || ''} 
                onChange={e => setCustomerId(e.target.value || null)} 
                style={{
                  flex: '1',
                  minWidth: '250px',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '2px solid #c6c5b9',
                  fontSize: '16px',
                  background: 'white',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#62929e'}
                onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
              >
                <option value="">בחר לקוח מהרשימה...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setShowNewCustomer(true)} 
                style={{
                  background: 'linear-gradient(45deg, #62929e, #62929e)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(1, 112, 185, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(1, 112, 185, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(1, 112, 185, 0.3)';
                }}
              >
                &#x2795; לקוח חדש
              </button>
            </div>
          </section>

          {/* New Customer Form */}
          {showNewCustomer && (
            <div style={{
              background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
              border: '1px solid #c6c5b9',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '25px',
              boxShadow: '0 5px 20px rgba(1, 112, 185, 0.1)'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: '#393d3f',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                &#x2728; הוספת לקוח חדש
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <input 
                  placeholder="שם לקוח *" 
                  value={newCust.name} 
                  onChange={e=>setNewCust(s=>({ ...s, name:e.target.value }))} 
                  style={{
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#62929e'}
                  onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                />
                <input 
                  placeholder="טלפון" 
                  value={newCust.phone} 
                  onChange={e=>setNewCust(s=>({ ...s, phone:e.target.value }))} 
                  style={{
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#62929e'}
                  onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                />
                <input 
                  placeholder="אימייל" 
                  value={newCust.email} 
                  onChange={e=>setNewCust(s=>({ ...s, email:e.target.value }))} 
                  style={{
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#62929e'}
                  onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                />
                <input 
                  placeholder="כתובת" 
                  value={newCust.address} 
                  onChange={e=>setNewCust(s=>({ ...s, address:e.target.value }))} 
                  style={{
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#62929e'}
                  onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={async () => {
                    try {
                      if (!newCust.name.trim()) throw new Error('שם לקוח חובה');
                      const { data, error } = await supabase.from('customer').insert({
                        name: newCust.name.trim(),
                        phone: newCust.phone?.trim() || null,
                        email: newCust.email?.trim() || null,
                        address: newCust.address?.trim() || null,
                        user_id: userId
                      }).select('id, name').maybeSingle();
                      if (error) throw error;
                      setCustomers((prev)=>[...prev, data]);
                      setCustomerId(data.id);
                      setShowNewCustomer(false);
                      setNewCust({ name:'', phone:'', email:'', address:'' });
                    } catch (e) {
                      alert(e.message || String(e));
                    }
                  }} 
                  style={{
                    background: 'linear-gradient(45deg, #62929e, #62929e)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(1, 112, 185, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(1, 112, 185, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(1, 112, 185, 0.3)';
                  }}
                >
                  &#x1F4BE; שמור לקוח
                </button>
                <button 
                  onClick={() => setShowNewCustomer(false)} 
                  style={{
                    background: '#fdfdff',
                    color: '#546a7b',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#c6c5b9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fdfdff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  &#x274C; ביטול
                </button>
              </div>
            </div>
          )}

          {/* Items Section */}
          <section style={{
            background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
            border: '1px solid #c6c5b9',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#393d3f',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              &#x1F4CB; פריטי ההצעה
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowCatalogPicker(true)} 
                style={{
                  background: '#62929e',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(1, 112, 185, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(1, 112, 185, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(1, 112, 185, 0.3)';
                }}
              >
                &#x1F4C1; פריט מהקטלוג
              </button>
              <button 
                onClick={addCustomItem} 
                style={{
                  background: '#62929e',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                &#x270F; פריט כללי
              </button>
            </div>

            {/* Catalog Picker */}
            {showCatalogPicker && (
              <div style={{
                background: 'linear-gradient(135deg, #c6c5b9 0%, #fdfdff 100%)',
                border: '2px solid #62929e',
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 5px 20px rgba(79, 172, 254, 0.1)'
              }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                  <input
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    placeholder="חיפוש מהיר (שם/קטגוריה)…"
                    style={{
                      flex: 1,
                      padding: '12px 15px',
                      borderRadius: '10px',
                      border: '2px solid #c6c5b9',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#62929e'}
                    onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                  />
                  <button 
                    onClick={() => { setShowCatalogPicker(false); setCatalogSearch(''); }} 
                    style={{
                      background: '#fdfdff',
                      color: '#546a7b',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: '2px solid #c6c5b9',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#c6c5b9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fdfdff';
                    }}
                  >
                    &#x274C; סגור
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {visibleProducts.length === 0 && (
                    <div style={{ 
                      color: '#546a7b', 
                      textAlign: 'center', 
                      padding: '20px',
                      fontSize: '16px'
                    }}>
                      &#x1F50D; לא נמצאו מוצרים
                    </div>
                  )}
                  {visibleProducts.map((p) => (
                    <div 
                      key={p.id} 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: '15px',
                        alignItems: 'center',
                        padding: '15px',
                        marginBottom: '10px',
                        background: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#393d3f', marginBottom: '5px' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#546a7b', marginBottom: '3px' }}>
                          &#x1F4C2; {p.category} {p.unit_label ? `• ${p.unit_label}` : ''}
                        </div>
                        {p.options && (
                          <div style={{ fontSize: '12px', color: '#546a7b' }}>
                            {p.options}
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '18px', 
                        color: '#62929e' 
                      }}>
                        ₪{currency(p.base_price)}
                      </div>
                      <button 
                        onClick={() => addProduct(p)} 
                        style={{
                          background: 'linear-gradient(45deg, #62929e, #62929e)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        &#x2705; בחר
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options Selection Modal */}
            {showOptionsModal && selectedProduct && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  maxWidth: '500px',
                  width: '90%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                  <div style={{
                    marginBottom: '25px',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#62929e',
                      margin: '0 0 10px 0'
                    }}>
                      בחר אפשרויות
                    </h3>
                    <div style={{
                      fontSize: '18px',
                      color: '#393d3f',
                      fontWeight: 'bold',
                      marginBottom: '5px'
                    }}>
                      {selectedProduct.name}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#62929e',
                      fontWeight: 'bold'
                    }}>
                      ₪{currency(selectedProduct.base_price)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#393d3f',
                      marginBottom: '15px'
                    }}>
                      אפשרויות זמינות:
                    </div>
                    
                    {parseOptions(selectedProduct.options).map((option, index) => (
                      <label 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 15px',
                          marginBottom: '8px',
                          background: selectedOptions.includes(option) ? '#c6c5b9' : '#fdfdff',
                          borderRadius: '10px',
                          border: selectedOptions.includes(option) ? '2px solid #62929e' : '2px solid #c6c5b9',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedOptions.includes(option)) {
                            e.currentTarget.style.backgroundColor = '#c6c5b9';
                            e.currentTarget.style.borderColor = '#c6c5b9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedOptions.includes(option)) {
                            e.currentTarget.style.backgroundColor = '#fdfdff';
                            e.currentTarget.style.borderColor = '#c6c5b9';
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOptions(prev => [...prev, option]);
                            } else {
                              setSelectedOptions(prev => prev.filter(opt => opt !== option));
                            }
                          }}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#62929e'
                          }}
                        />
                        <span style={{
                          fontSize: '16px',
                          color: '#393d3f',
                          fontWeight: selectedOptions.includes(option) ? 'bold' : 'normal'
                        }}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => {
                        setShowOptionsModal(false);
                        setSelectedProduct(null);
                        setSelectedOptions([]);
                      }}
                      style={{
                        background: '#fdfdff',
                        color: '#393d3f',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: '2px solid #c6c5b9',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c6c5b9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fdfdff';
                      }}
                    >
                      &#x274C; ביטול
                    </button>
                    <button
                      onClick={() => addProductWithOptions(selectedProduct, selectedOptions)}
                      style={{
                        background: '#62929e',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 3px 10px rgba(1, 112, 185, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#546a7b';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(1, 112, 185, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#62929e';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(1, 112, 185, 0.3)';
                      }}
                    >
                      &#x2705; הוסף למסמך
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Items Table */}
            <div className="desktop-table" style={{
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)', color: 'white' }}>
                    <th style={{ textAlign: 'right', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>פריט</th>
                    <th style={{ textAlign: 'center', padding: '15px', width: '100px', fontSize: '16px', fontWeight: 'bold' }}>כמות</th>
                    <th style={{ textAlign: 'center', padding: '15px', width: '160px', fontSize: '16px', fontWeight: 'bold' }}>מחיר יח׳ (₪)</th>
                    <th style={{ textAlign: 'right', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>הערות</th>
                    <th style={{ textAlign: 'left', padding: '15px', width: '120px', fontSize: '16px', fontWeight: 'bold' }}>סה״כ שורה</th>
                    <th style={{ padding: '15px', width: '80px', fontSize: '16px', fontWeight: 'bold' }}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr 
                      key={idx} 
                      style={{
                        background: idx % 2 === 0 ? '#ffffff' : '#fdfdff',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c6c5b9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fdfdff';
                      }}
                    >
                      <td style={{ padding: '15px' }}>
                        {it.isCustom ? (
                          <input
                            value={it.name}
                            onChange={e => updateItem(idx, { name: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '2px solid #c6c5b9',
                              fontSize: '14px',
                              transition: 'border-color 0.2s ease'
                            }}
                            placeholder="שם פריט…"
                            onFocus={(e) => e.target.style.borderColor = '#62929e'}
                            onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                          />
                        ) : (
                          <div style={{ fontWeight: '600', color: '#393d3f', fontSize: '15px' }}>
                            {it.name}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <input
                          type="number" min={0}
                          value={it.qty}
                          onChange={e => updateItem(idx, { qty: Number(e.target.value || 0) })}
                          style={{
                            width: '80px',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '2px solid #c6c5b9',
                            textAlign: 'center',
                            fontSize: '14px',
                            transition: 'border-color 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#62929e'}
                          onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                        />
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <input
                          type="number" step="0.01" min={0}
                          value={it.unit_price}
                          onChange={e => updateItem(idx, { unit_price: Number(e.target.value || 0) })}
                          style={{
                            width: '140px',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '2px solid #c6c5b9',
                            textAlign: 'center',
                            fontSize: '14px',
                            transition: 'border-color 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#62929e'}
                          onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                        />
                      </td>
                      <td style={{ padding: '15px' }}>
                        <input
                          value={it.notes || ''}
                          onChange={e => updateItem(idx, { notes: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '2px solid #c6c5b9',
                            fontSize: '14px',
                            transition: 'border-color 0.2s ease'
                          }}
                          placeholder="הערות…"
                          onFocus={(e) => e.target.style.borderColor = '#62929e'}
                          onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                        />
                      </td>
                      <td style={{ 
                        padding: '15px', 
                        textAlign: 'left', 
                        fontWeight: 'bold', 
                        color: '#62929e',
                        fontSize: '16px'
                      }}>
                        ₪{currency(Number(it.qty || 0) * Number(it.unit_price || 0))}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button 
                          onClick={() => removeItem(idx)} 
                          style={{
                            background: 'linear-gradient(45deg, #4B4F58, #4B4F58)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          &#x1F5D1; מחק
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td 
                        colSpan={6} 
                        style={{ 
                          padding: '40px', 
                          color: '#546a7b', 
                          textAlign: 'center',
                          fontSize: '16px'
                        }}
                      >
                        &#x1F4DD; לא נבחרו פריטים עדיין
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Items Cards */}
            <div className="mobile-items" style={{ display: 'none' }}>
              {items.length === 0 ? (
                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '30px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }}>&#x1F4DD;</div>
                  <h3 style={{ color: '#546a7b', marginBottom: '10px' }}>אין פריטים עדיין</h3>
                  <p style={{ color: '#546a7b', fontSize: '14px' }}>הוסף פריטים מהקטלוג או צור פריט חדש</p>
                </div>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '15px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #c6c5b9'
                  }}>
                    {/* Item Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '15px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #c6c5b9'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#393d3f',
                          marginBottom: '5px'
                        }}>
                          {it.isCustom ? (
                            <input
                              value={it.name || ''}
                              onChange={(e) => updateItem(idx, { name: e.target.value })}
                              placeholder="שם פריט..."
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #c6c5b9',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#393d3f',
                                backgroundColor: 'white',
                                transition: 'border-color 0.2s ease',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#62929e'}
                              onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                            />
                          ) : (
                            it.name || 'פריט'
                          )}
                        </div>
                        {it.product_id && (
                          <div style={{ fontSize: '13px', color: '#546a7b' }}>
                            {products.find(p => p.id === it.product_id)?.category || 'קטגוריה'}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(idx)}
                        style={{
                          background: '#4B4F58',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>

                    {/* Item Details Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '15px',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <label style={{ fontSize: '13px', color: '#546a7b', marginBottom: '5px', display: 'block' }}>כמות:</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={it.qty}
                          onChange={(e) => updateItem(idx, { qty: Number(e.target.value || 0) })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #c6c5b9',
                            borderRadius: '6px',
                            fontSize: '16px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: '#546a7b', marginBottom: '5px', display: 'block' }}>מחיר יחידה (₪):</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={it.unit_price}
                          onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value || 0) })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #c6c5b9',
                            borderRadius: '6px',
                            fontSize: '16px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '13px', color: '#546a7b', marginBottom: '5px', display: 'block' }}>הערות:</label>
                      <textarea
                        value={it.notes || ''}
                        onChange={(e) => updateItem(idx, { notes: e.target.value })}
                        placeholder="הערות נוספות..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #c6c5b9',
                          borderRadius: '6px',
                          fontSize: '16px',
                          resize: 'vertical',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                          lineHeight: '1.5'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#62929e'}
                        onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                      />
                    </div>

                    {/* Total */}
                    <div style={{
                      paddingTop: '10px',
                      borderTop: '1px solid #c6c5b9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '16px', color: '#546a7b' }}>סה״כ שורה:</span>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#62929e'
                      }}>
                        ₪{currency(it.line_total)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Totals Section */}
          <section style={{
            background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
            border: '1px solid #c6c5b9',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#393d3f',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              &#x1F9EE; חישוב סכומים
            </div>
            <div className="mobile-totals" style={{
              display: 'grid',
              gap: '15px',
              maxWidth: '400px',
              marginInlineStart: 'auto'
            }}>
              <div style={{ 
                fontSize: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span>ביניים (לפני מע״מ):</span>
                <span style={{ fontWeight: 'bold', color: '#546a7b' }}>₪{currency(netSubtotal)}</span>
              </div>
              {/* DISCOUNT COMPONENT RESTRUCTURED - HEROKU DEPLOY 2025 */}
              <div 
                id="discount-component-heroku-2025"
                className="discount-wrapper-new"
                style={{ 
                fontSize: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: '15px',
                backgroundColor: 'transparent'
              }}>
                <span style={{ fontWeight: 'normal' }}>הנחה:</span>
                <div 
                  className="discount-controls-heroku-2025"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <select
                    id="discount-type-heroku-rebuild"
                    className="discount-selector-heroku-new"
                    value={discountType}
                    onChange={e => {
                      setDiscountType(e.target.value);
                      if (e.target.value === 'percentage') {
                        setDiscountAmount(0);
                      } else {
                        setDiscountPct(0);
                      }
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '2px solid #c6c5b9',
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease',
                      minWidth: '60px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#62929e'}
                    onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                  >
                    <option value="percentage">אחוז %</option>
                    <option value="absolute">סכום ₪</option>
                  </select>
                  <input
                    type="number" 
                    min={0}
                    max={discountType === 'percentage' ? 100 : undefined}
                    value={discountType === 'percentage' ? discountPct : discountAmount}
                    onChange={e => {
                      const val = Number(e.target.value || 0);
                      if (discountType === 'percentage') {
                        setDiscountPct(val);
                      } else {
                        setDiscountAmount(val);
                      }
                    }}
                    style={{
                      width: '80px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '2px solid #c6c5b9',
                      textAlign: 'center',
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#62929e'}
                    onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                  />
                  {discountValue > 0 && (
                    <span style={{ color: '#546a7b', fontWeight: 'bold' }}>
                      (-₪{currency(discountValue)})
                    </span>
                  )}
                </div>
              </div>
              <div style={{ 
                fontSize: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span>מע״מ ({vatRate}%):</span>
                <span style={{ fontWeight: 'bold', color: '#546a7b' }}>₪{currency(vatAmount)}</span>
              </div>
              <div style={{
                fontSize: '20px',
                padding: '15px',
                background: '#62929e',
                color: 'white',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(1, 112, 185, 0.3)'
              }}>
                <span>סה״כ לתשלום:</span>
                <span>₪{currency(total)}</span>
              </div>
            </div>
          </section>

          {/* Additional Details */}
          <section style={{
            background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
            border: '1px solid #c6c5b9',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#393d3f',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              &#x1F4DD; פרטים נוספים
            </div>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#546a7b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  &#x1F4B3; תנאי תשלום
                </label>
                <textarea 
                  rows={3} 
                  value={paymentTerms} 
                  onChange={e => setPaymentTerms(e.target.value)} 
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    minHeight: '80px',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="מזומן / המחאה / העברה בנקאית / שוטף +30"
                  onFocus={(e) => e.target.style.borderColor = '#62929e'}
                  onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#546a7b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  &#x1F4CB; הערות
                </label>
                <textarea 
                  rows={3} 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    minHeight: '80px',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="הערות להצעה…"
                  onFocus={(e) => e.target.style.borderColor = '#62929e'}
                  onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                />
              </div>

              {/* Delivery Date */}
              <div style={{ 
                background: 'linear-gradient(135deg, #c6c5b9 0%, #fdfdff 100%)', 
                padding: '20px', 
                borderRadius: '15px',
                border: '1px solid #c6c5b9',
                marginTop: '20px' 
              }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '10px',
                  color: '#546a7b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  &#x1F4C5; תאריך משלוח
                </label>
                <input 
                  type="date"
                  value={deliveryDate} 
                  onChange={e => setDeliveryDate(e.target.value)} 
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #c6c5b9',
                    fontSize: '15px',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }} 
                  onFocus={(e) => e.target.style.borderColor = '#62929e'}
                  onBlur={(e) => e.target.style.borderColor = '#c6c5b9'}
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="mobile-buttons" style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginTop: '30px',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={saveQuote} 
              disabled={saving} 
              style={{
                background: saving 
                  ? 'linear-gradient(45deg, #6c757d, #5a6268)' 
                  : 'linear-gradient(45deg, #62929e, #62929e)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '25px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: saving 
                  ? '0 4px 15px rgba(108, 117, 125, 0.3)' 
                  : '0 4px 15px rgba(1, 112, 185, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: saving ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(1, 112, 185, 0.4)';
                }
              }}
            >
              {saving ? '&#x23F3; שומר...' : '&#x1F4BE; שמור הצעה'}
            </button>
            <a 
              href="/quotes" 
              style={{
                background: '#62929e',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              &#x1F519; חזרה לרשימת הצעות
            </a>
          </div>
        </div>
      </div>
      </main>
      
      <style jsx>{`
        @media (max-width: 768px) {
          main {
            padding: 10px 5px !important;
          }
        }
      `}</style>
    </>
  );
}
