'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

// Dynamically import PDF component to avoid SSR issues
const QuotePDFDownloadButton = dynamic(
  () => import('./QuotePDFSimple').then(mod => mod.SimplePDFButton),
  { 
    ssr: false,
    loading: () => <span style={{ padding: '12px 20px' }}>⏳ טוען PDF...</span>
  }
);

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



  const shareWhatsApp = async () => {
    try {
      // Import PDF generation function
      const { generatePDFBlob } = await import('./QuotePDFSimple');
      
      // Generate PDF blob
      const pdfBlob = await generatePDFBlob(proposal);
      
      // Create download link for the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `הצעת_מחיר_${proposal.proposal_number || proposal.id.slice(0,8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Open WhatsApp with message about the PDF
      const message = encodeURIComponent(`שלום ${proposal.customer?.name || ''}! הצעת המחיר שלך מוכנה להורדה. אני שולח אותה עכשיו בנפרד.`);
      window.open(`https://wa.me/${proposal.customer?.phone?.replace(/[^\d]/g, '') || ''}?text=${message}`, '_blank');
      
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      alert('שגיאה בהכנת הקובץ לשיתוף');
    }
  };


  if (error) {
    return <main dir="rtl" style={{ padding:16 }}><div style={{ background:'#ffe8e8', border:'1px solid #f5b5b5', padding:8, borderRadius:8 }}>שגיאה: {error}</div></main>;
  }
  if (!proposal) {
    return <main dir="rtl" style={{ padding:16 }}>טוען…</main>;
  }

  const vatRate = Number(proposal.vat_rate || settings?.vat_rate || 18);

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 20px !important;
          }
          .mobile-buttons {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .mobile-table {
            overflow-x: auto;
            display: block;
          }
          .mobile-table table {
            min-width: 600px;
          }
          .mobile-customer {
            padding: 15px !important;
            margin-bottom: 15px !important;
          }
          .mobile-totals {
            padding: 20px !important;
            margin-bottom: 15px !important;
          }
          .mobile-totals div {
            min-width: auto !important;
            font-size: 14px !important;
          }
          .mobile-totals .total-final {
            font-size: 18px !important;
          }
          .mobile-content {
            padding: 15px !important;
          }
          .mobile-back-button {
            flex-direction: column !important;
            margin-top: 20px !important;
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
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="mobile-header" style={{
          background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)',
          color: 'white',
          padding: '30px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <picture>
              <source media="(max-width: 768px)" srcSet="/logo-new.png?v=1758110947" />
              <source media="(min-width: 769px)" srcSet="/logo-new.png?v=1758110947" />
              <img 
                src="/logo-new.png?v=1758110947" 
                alt="תחנת לחם" 
                style={{ height: '50px', width: 'auto' }}
              />
            </picture>
            <div>
              <h1 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '28px', 
                fontWeight: 'bold' 
              }}>
                הצעת מחיר
              </h1>
              <p style={{ 
                margin: '0 0 8px 0', 
                opacity: 0.9, 
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)' 
              }}>
                מס׳ הצעה: {proposal.proposal_number || proposal.id.slice(0,8)}
              </p>
              <div className="business-info-v2" style={{ 
                fontSize: '12px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.5',
                fontWeight: '500',
                marginTop: '6px'
              }}>
                <div style={{ marginBottom: '2px' }}>אל יזמות ופיתוח ע.מ. • 312333263</div>
                <div style={{ marginBottom: '2px' }}>ברכה צפירה 3, עכו • 0502670040 • 0508386698</div>
                <div>moran.marmus@gmail.com</div>
              </div>
            </div>
          </div>
          
          <div className="mobile-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <QuotePDFDownloadButton 
              proposal={proposal}
            />
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
                background: '#0170B9',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(1, 112, 185, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#025a8a';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 112, 185, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0170B9';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 112, 185, 0.3)';
              }}
            >
              ✏️ עריכה
            </Link>
          </div>
        </div>

        {/* Content */}
        <div id="quote-content" className="mobile-content" style={{ padding: '30px' }}>

          <section className="mobile-customer" style={{
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

          <div className="mobile-table" style={{
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)', color: 'white' }}>
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
                      <td style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#0170B9' }}>
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

          <section className="mobile-totals" style={{
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
            <div className="total-final" style={{
              fontSize: '20px',
              padding: '15px',
              background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)',
              color: 'white',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
              boxShadow: '0 3px 10px rgba(1, 112, 185, 0.3)'
            }}>
              <span>סה״כ לתשלום:</span>
              <span>{currency(proposal.total)} ₪</span>
            </div>
          </section>

          {(proposal.payment_terms || proposal.notes || proposal.delivery_date) && (
            <section style={{
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              border: '1px solid #e9ecef',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              {proposal.payment_terms && (
                <div style={{ marginBottom: (proposal.delivery_date || proposal.notes) ? '15px' : '0' }}>
                  <span style={{ fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    💳 תנאי תשלום:
                  </span>
                  <div style={{ fontSize: '15px', color: '#666', paddingRight: '25px' }}>
                    {proposal.payment_terms}
                  </div>
                </div>
              )}
              {proposal.delivery_date && (
                <div style={{ marginBottom: proposal.notes ? '15px' : '0' }}>
                  <span style={{ fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    📅 תאריך משלוח:
                  </span>
                  <div style={{ fontSize: '15px', color: '#666', paddingRight: '25px' }}>
                    {new Date(proposal.delivery_date).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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

          <div className="mobile-back-button" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
            <Link 
              href="/quotes" 
              style={{
                background: '#4B4F58',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(75, 79, 88, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3a3a3a';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 79, 88, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4B4F58';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(75, 79, 88, 0.3)';
              }}
            >
              🔙 חזרה לרשימת הצעות
            </Link>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
