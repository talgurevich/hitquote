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
  const [showCustomerView, setShowCustomerView] = useState(false);

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

  const getCustomerUrl = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      // If we're already on the customer page, use current URL
      if (currentUrl.includes('/customer')) {
        return currentUrl;
      }
      // Otherwise, add /customer to the current URL
      return currentUrl + '/customer';
    }
    return '';
  };

  const shareMail = () => {
    const url = getCustomerUrl();
    const subject = encodeURIComponent('הצעת מחיר - תחנת לחם');
    const body = encodeURIComponent(`שלום,\n\nמצורפת הצעת המחיר שלך מתחנת לחם:\n\n${url}\n\nתודה!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareWhatsApp = () => {
    const url = getCustomerUrl();
    const message = encodeURIComponent(`שלום! מצורפת הצעת המחיר שלך מתחנת לחם: ${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareCustomerMail = () => {
    const url = getCustomerUrl();
    const subject = encodeURIComponent('הצעת מחיר - תחנת לחם');
    const body = encodeURIComponent(`שלום,\n\nמצורפת הצעת המחיר שלך מתחנת לחם:\n\n${url}\n\nתודה!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (error) {
    return <main dir="rtl" style={{ padding:16 }}><div style={{ background:'#ffe8e8', border:'1px solid #f5b5b5', padding:8, borderRadius:8 }}>שגיאה: {error}</div></main>;
  }
  if (!proposal) {
    return <main dir="rtl" style={{ padding:16 }}>טוען…</main>;
  }

  const vatRate = Number(proposal.vat_rate || settings?.vat_rate || 18);

  return (
    <main dir="rtl" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, Arial'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src="/image3.png" 
              alt="תחנת לחם" 
              style={{ height: '50px', width: 'auto' }}
            />
            <div>
              <h1 style={{ 
                margin: '0 0 5px 0', 
                fontSize: '28px', 
                fontWeight: 'bold' 
              }}>
                הצעת מחיר
              </h1>
              <p style={{ 
                margin: 0, 
                opacity: 0.9, 
                fontSize: '16px' 
              }}>
                מס׳ הצעה: {proposal.proposal_number || proposal.id.slice(0,8)}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={shareCustomerMail} 
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '25px',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📧 שליחה במייל
            </button>
            <button 
              onClick={shareWhatsApp} 
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '25px',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💬 שיתוף וואטסאפ
            </button>
            <Link 
              href={`/new?id=${proposal.id}`} 
              style={{
                background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.4)';
              }}
            >
              ✏️ עריכה
            </Link>
            <Link 
              href={`/quote/${id}/customer`} 
              style={{
                background: 'rgba(255,193,7,0.9)',
                color: 'black',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.4)';
              }}
            >
              👁️ תצוגת לקוח
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>

          <section style={{
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            border: '1px solid #e9ecef',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              👤 לכבוד:
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#495057' }}>
              {proposal.customer?.name}
            </div>
            {proposal.customer?.phone && (
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📱 טלפון: {proposal.customer.phone}
              </div>
            )}
            {proposal.customer?.email && (
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📧 אימייל: {proposal.customer.email}
              </div>
            )}
            {proposal.customer?.address && (
              <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 כתובת: {proposal.customer.address}
              </div>
            )}
          </section>

          <div style={{
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <th style={{ textAlign: 'right', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>פריט</th>
                  <th style={{ textAlign: 'center', padding: '15px', width: '80px', fontSize: '16px', fontWeight: 'bold' }}>כמות</th>
                  <th style={{ textAlign: 'center', padding: '15px', width: '140px', fontSize: '16px', fontWeight: 'bold' }}>מחיר יח׳ (₪)</th>
                  <th style={{ textAlign: 'right', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>הערות / מילויים</th>
                  <th style={{ textAlign: 'left', padding: '15px', width: '120px', fontSize: '16px', fontWeight: 'bold' }}>סה״כ שורה</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, index) => {
                  const name = it.custom_name || it.product_name || 'פריט';
                  return (
                    <tr key={it.id} style={{
                      background: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                    }}>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#333' }}>{name}</td>
                      <td style={{ padding: '15px', textAlign: 'center', fontWeight: '500' }}>{it.qty}</td>
                      <td style={{ padding: '15px', textAlign: 'center', fontWeight: '500' }}>{currency(it.unit_price)} ₪</td>
                      <td style={{ padding: '15px', color: '#666', fontSize: '14px' }}>{it.notes || '—'}</td>
                      <td style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#4facfe' }}>
                        {currency(it.line_total)} ₪
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ 
                      padding: '30px', 
                      color: '#666', 
                      textAlign: 'center',
                      fontSize: '16px'
                    }}>
                      📝 אין שורות להצגה
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <section style={{
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            border: '1px solid #e9ecef',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            display: 'grid',
            gap: '12px',
            justifyContent: 'end'
          }}>
            <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '300px' }}>
              <span>ביניים (לפני מע״מ):</span>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>{currency(proposal.subtotal)} ₪</span>
            </div>
            {proposal.include_discount_row && (
              <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '300px', color: '#dc3545' }}>
                <span>הנחה:</span>
                <span style={{ fontWeight: 'bold' }}>-{currency(proposal.discount_value)} ₪</span>
              </div>
            )}
            <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '300px' }}>
              <span>מע״מ ({vatRate}%):</span>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>{currency(proposal.vat_amount)} ₪</span>
            </div>
            <div style={{
              fontSize: '20px',
              padding: '15px',
              background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
              color: 'white',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
            }}>
              <span>סה״כ לתשלום:</span>
              <span>{currency(proposal.total)} ₪</span>
            </div>
          </section>

          {(proposal.payment_terms || proposal.notes) && (
            <section style={{
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              border: '1px solid #e9ecef',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              {proposal.payment_terms && (
                <div style={{ marginBottom: proposal.notes ? '15px' : '0' }}>
                  <span style={{ fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    💳 תנאי תשלום:
                  </span>
                  <div style={{ fontSize: '15px', color: '#666', paddingRight: '25px' }}>
                    {proposal.payment_terms}
                  </div>
                </div>
              )}
              {proposal.notes && (
                <div>
                  <span style={{ fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    📝 הערות:
                  </span>
                  <div style={{ fontSize: '15px', color: '#666', paddingRight: '25px' }}>
                    {proposal.notes}
                  </div>
                </div>
              )}
            </section>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
            <Link 
              href="/quotes" 
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
              🔙 חזרה לרשימת הצעות
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
