'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

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
    <main dir="rtl" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, Arial'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header with Logo */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          color: 'white',
          padding: '40px 30px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <img 
            src="/image3.png" 
            alt="תחנת לחם" 
            style={{ 
              height: '80px', 
              width: 'auto',
              marginBottom: '15px',
              filter: 'brightness(1.2)'
            }}
          />
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
        <div style={{ padding: '30px' }}>
          {/* Customer Details */}
          <section style={{
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

          {/* Items Table */}
          <div style={{
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
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
                  color: '#ffc107' 
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
                        color: '#ffc107',
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

          {/* Totals */}
          <section style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            color: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              <div style={{ 
                fontSize: '18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                opacity: 0.9 
              }}>
                <span>ביניים (לפני מע״מ):</span>
                <span style={{ fontWeight: 'bold', color: '#ffc107' }}>₪{currency(proposal.subtotal)}</span>
              </div>
              {proposal.include_discount_row && (
                <div style={{ 
                  fontSize: '18px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  color: '#28a745',
                  opacity: 0.9 
                }}>
                  <span>הנחה:</span>
                  <span style={{ fontWeight: 'bold' }}>-₪{currency(proposal.discount_value)}</span>
                </div>
              )}
              <div style={{ 
                fontSize: '18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                opacity: 0.9 
              }}>
                <span>מע״מ ({vatRate}%):</span>
                <span style={{ fontWeight: 'bold', color: '#ffc107' }}>₪{currency(proposal.vat_amount)}</span>
              </div>
              <div style={{
                fontSize: '24px',
                padding: '20px',
                background: 'linear-gradient(45deg, #ffc107, #ffb300)',
                color: '#1a1a1a',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(255, 193, 7, 0.4)',
                marginTop: '10px'
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
          <div style={{
            textAlign: 'center',
            padding: '30px 20px',
            borderTop: '2px solid #f8f9fa',
            marginTop: '30px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              color: '#ffc107',
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
  );
}