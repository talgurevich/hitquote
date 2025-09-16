'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../../../../lib/supabaseClient';

// Dynamically import PDF component to avoid SSR issues
const QuotePDFDownloadButton = dynamic(
  () => import('./QuotePDFSimple').then(mod => mod.SimplePDFButton),
  { 
    ssr: false,
    loading: () => <span style={{ padding: '12px 20px' }}>⏳ טוען PDF...</span>
  }
);

const currency = (n) => Number(n || 0).toFixed(2);

export default function CustomerQuoteClient({ id }) {
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

  if (error) {
    return (
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, Arial',
        padding: '20px'
      }}>
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '15px',
          padding: '20px',
          color: '#c33',
          textAlign: 'center'
        }}>
          ⚠️ שגיאה: {error}
        </div>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, Arial',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          fontSize: '18px',
          color: '#666'
        }}>
          ⏳ טוען הצעת מחיר...
        </div>
      </main>
    );
  }

  const vatRate = Number(proposal.vat_rate || settings?.vat_rate || 18);
  const currentDate = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <style jsx>{`
        @media (max-width: 480px) {
          .mobile-header {
            padding: 20px 15px !important;
          }
          .mobile-header img {
            height: 60px !important;
          }
          .mobile-content {
            padding: 10px !important;
          }
          .mobile-customer {
            padding: 12px !important;
            margin-bottom: 12px !important;
            font-size: 14px !important;
          }
          .mobile-customer > div:first-child {
            font-size: 15px !important;
          }
          .desktop-table {
            display: none !important;
          }
          .mobile-items {
            display: block !important;
          }
          .mobile-totals {
            padding: 15px !important;
            margin-bottom: 15px !important;
          }
          .mobile-totals > div > div {
            font-size: 13px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 5px !important;
          }
          .mobile-totals .total-final {
            font-size: 16px !important;
            padding: 10px !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: 8px !important;
          }
          .mobile-footer {
            padding: 15px 10px !important;
            margin-top: 15px !important;
          }
          .mobile-footer > div {
            padding: 15px !important;
            margin-bottom: 10px !important;
          }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .mobile-header {
            padding: 30px 20px !important;
          }
          .mobile-content {
            padding: 15px !important;
          }
          .mobile-customer {
            padding: 15px !important;
            margin-bottom: 15px !important;
          }
          .mobile-customer > div:first-child {
            font-size: 16px !important;
          }
          .desktop-table {
            display: none !important;
          }
          .mobile-items {
            display: block !important;
          }
          .mobile-totals {
            padding: 20px !important;
            margin-bottom: 20px !important;
          }
          .mobile-totals > div > div {
            font-size: 14px !important;
          }
          .mobile-totals .total-final {
            font-size: 18px !important;
            padding: 12px !important;
          }
          .mobile-footer {
            padding: 20px 15px !important;
            margin-top: 20px !important;
          }
          .mobile-footer > div {
            padding: 20px !important;
            margin-bottom: 15px !important;
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '10px',
        fontFamily: 'system-ui, Arial'
      }}>
        <div className="quote-container" style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
        {/* Header with Logo */}
        <div id="quote-header" className="mobile-header" style={{
          background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)',
          color: 'white',
          padding: '40px 30px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <picture>
            <source media="(max-width: 768px)" srcSet="/image1.png" />
            <source media="(min-width: 769px)" srcSet="/image3.png" />
            <img 
              src="/image3.png" 
              alt="תחנת לחם" 
              crossOrigin="anonymous"
              style={{ 
                height: '80px', 
                width: 'auto',
                marginBottom: '15px',
                filter: 'brightness(1.2)'
              }}
            />
          </picture>
          <div style={{
            fontSize: '16px',
            color: '#28a745',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            כשר למהדרין
          </div>
          <div style={{
            fontSize: '14px',
            color: '#ffc107',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            📍 צפירה 1 עכו
          </div>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ffc107'
          }}>
            הצעת מחיר
          </h1>
          <div style={{
            fontSize: '16px',
            opacity: 0.9,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <span>מס׳ הצעה: <strong>{proposal.proposal_number || proposal.id.slice(0,8)}</strong></span>
            <span>תאריך: <strong>{currentDate}</strong></span>
          </div>
        </div>

        {/* Content */}
        <div id="quote-content" className="mobile-content" style={{ padding: '30px' }}>
          {/* Customer Details */}
          <section className="mobile-customer" style={{
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            border: '2px solid #ffc107',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px',
            boxShadow: '0 5px 15px rgba(255, 193, 7, 0.2)'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              👤 לכבוד:
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#1a1a1a' }}>
              {proposal.customer?.name}
            </div>
            {proposal.customer?.phone && (
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📱 טלפון: {proposal.customer.phone}
              </div>
            )}
            {proposal.customer?.email && (
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📧 אימייל: {proposal.customer.email}
              </div>
            )}
            {proposal.customer?.address && (
              <div style={{ fontSize: '16px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 כתובת: {proposal.customer.address}
              </div>
            )}
          </section>

          {/* Desktop Table */}
          <div className="desktop-table" style={{
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            marginBottom: '30px',
            border: '2px solid #f8f9fa'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)', 
                  color: 'white' 
                }}>
                  <th style={{ textAlign: 'right', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>פריט</th>
                  <th style={{ textAlign: 'center', padding: '18px', width: '80px', fontSize: '16px', fontWeight: 'bold' }}>כמות</th>
                  <th style={{ textAlign: 'center', padding: '18px', width: '120px', fontSize: '16px', fontWeight: 'bold' }}>מחיר יח׳</th>
                  <th style={{ textAlign: 'right', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>הערות</th>
                  <th style={{ textAlign: 'left', padding: '18px', width: '120px', fontSize: '16px', fontWeight: 'bold' }}>סה״כ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, index) => {
                  const name = it.custom_name || it.product_name || 'פריט';
                  return (
                    <tr key={it.id} style={{
                      background: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      <td style={{ padding: '18px', fontWeight: '600', color: '#333', fontSize: '16px' }}>
                        {name}
                      </td>
                      <td style={{ padding: '18px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>
                        {it.qty}
                      </td>
                      <td style={{ padding: '18px', textAlign: 'center', fontWeight: '500', fontSize: '16px' }}>
                        ₪{currency(it.unit_price)}
                      </td>
                      <td style={{ padding: '18px', color: '#666', fontSize: '14px' }}>
                        {it.notes || '—'}
                      </td>
                      <td style={{ 
                        padding: '18px', 
                        textAlign: 'left', 
                        fontWeight: 'bold', 
                        color: '#0170B9',
                        fontSize: '16px'
                      }}>
                        ₪{currency(it.line_total)}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ 
                      padding: '40px', 
                      color: '#666', 
                      textAlign: 'center',
                      fontSize: '18px'
                    }}>
                      📝 אין פריטים להצגה
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Items View */}
          <div className="mobile-items" style={{ display: 'none', marginBottom: '20px' }}>
            {items.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                color: '#666',
                fontSize: '16px',
                border: '1px solid #e9ecef'
              }}>
                📝 אין פריטים להצגה
              </div>
            ) : (
              items.map((it, index) => {
                const name = it.custom_name || it.product_name || 'פריט';
                return (
                  <div key={it.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '15px',
                    marginBottom: '12px',
                    border: '2px solid #f8f9fa',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#0170B9',
                      marginBottom: '10px'
                    }}>
                      {name}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '5px 0'
                      }}>
                        <span style={{ color: '#6c757d', fontSize: '14px' }}>כמות:</span>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{it.qty}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '5px 0'
                      }}>
                        <span style={{ color: '#6c757d', fontSize: '14px' }}>מחיר יח׳:</span>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>₪{currency(it.unit_price)}</span>
                      </div>
                    </div>
                    
                    {it.notes && (
                      <div style={{
                        background: '#f8f9fa',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '10px'
                      }}>
                        <span style={{ fontWeight: '600' }}>הערות:</span> {it.notes}
                      </div>
                    )}
                    
                    <div style={{
                      borderTop: '1px solid #e9ecef',
                      paddingTop: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#6c757d', fontSize: '14px' }}>סה״כ שורה:</span>
                      <span style={{
                        fontSize: '17px',
                        fontWeight: 'bold',
                        color: '#0170B9',
                        whiteSpace: 'nowrap'
                      }}>
                        ₪{currency(it.line_total)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Totals */}
          <section className="mobile-totals" style={{
            background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)',
            color: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(1, 112, 185, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <div style={{ 
                fontSize: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                opacity: 0.9,
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>ביניים (לפני מע״מ):</span>
                <span style={{ fontWeight: 'bold', color: '#ffc107' }}>₪{currency(proposal.subtotal)}</span>
              </div>
              {proposal.include_discount_row && (
                <div style={{ 
                  fontSize: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  color: '#28a745',
                  opacity: 0.9,
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span>הנחה:</span>
                  <span style={{ fontWeight: 'bold' }}>-₪{currency(proposal.discount_value)}</span>
                </div>
              )}
              <div style={{ 
                fontSize: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                opacity: 0.9,
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>מע״מ ({vatRate}%):</span>
                <span style={{ fontWeight: 'bold', color: '#ffc107' }}>₪{currency(proposal.vat_amount)}</span>
              </div>
              <div className="total-final" style={{
                fontSize: '20px',
                padding: '16px',
                background: 'linear-gradient(45deg, #ffc107, #ffb300)',
                color: '#1a1a1a',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(255, 193, 7, 0.4)',
                marginTop: '10px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <span>סה״כ לתשלום:</span>
                <span>₪{currency(proposal.total)}</span>
              </div>
            </div>
          </section>

          {/* Additional Information */}
          {(proposal.payment_terms || proposal.notes) && (
            <section style={{
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              border: '2px solid #e9ecef',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
            }}>
              {proposal.payment_terms && (
                <div style={{ marginBottom: proposal.notes ? '20px' : '0' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: '#495057', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '12px',
                    fontSize: '18px' 
                  }}>
                    💳 תנאי תשלום:
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#666', 
                    paddingRight: '30px',
                    lineHeight: '1.6'
                  }}>
                    {proposal.payment_terms}
                  </div>
                </div>
              )}
              {proposal.notes && (
                <div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: '#495057', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '12px',
                    fontSize: '18px' 
                  }}>
                    📝 הערות:
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#666', 
                    paddingRight: '30px',
                    lineHeight: '1.6'
                  }}>
                    {proposal.notes}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Footer */}
          <div className="mobile-footer" style={{
            textAlign: 'center',
            padding: '30px 20px',
            borderTop: '2px solid #f8f9fa',
            marginTop: '30px'
          }}>
            {/* PDF Download Button */}
            <div style={{ marginBottom: '25px' }}>
              <QuotePDFDownloadButton 
                proposal={proposal}
              />
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                תודה על בחירתכם!
              </div>
              <div style={{ 
                fontSize: '15px', 
                color: '#28a745', 
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                כשר למהדרין
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#ffc107',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                📍 צפירה 1 עכו
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                להזמנות וייעוץ נוסף ניתן ליצור קשר
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999',
              textAlign: 'center'
            }}>
              הצעת מחיר זו תקפה ל-30 יום מתאריך ההנפקה
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}