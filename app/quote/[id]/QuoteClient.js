'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import HamburgerMenu from '../../components/HamburgerMenu';

// Dynamically import PDF components to avoid SSR issues
const QuotePDFDownloadButton = dynamic(
  () => import('./QuotePDFSimple').then(mod => mod.SimplePDFButton),
  { 
    ssr: false,
    loading: () => <span style={{ padding: '12px 20px' }}>⏳ טוען PDF...</span>
  }
);

const SignedPDFDownloadButton = dynamic(
  () => import('./QuotePDFSigned').then(mod => mod.SignedPDFButton),
  { 
    ssr: false,
    loading: () => <span style={{ padding: '12px 20px' }}>⏳ טוען PDF חתום...</span>
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

        // First get the proposal to extract the user_id
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposal')
          .select('id, proposal_number, customer_id, payment_terms, notes, subtotal, discount_value, include_discount_row, vat_rate, vat_amount, total, created_at, delivery_date, signature_status, signature_timestamp, signer_name, signature_data, user_id, customer:customer (name, phone, email, address)')
          .eq('id', id)
          .maybeSingle();
        
        if (proposalError) throw proposalError;
        if (!proposalData) throw new Error('Proposal not found');
        
        // Now get settings for the specific user who owns this proposal
        const { data: st, error: e1 } = await supabase
          .from('settings')
          .select('business_name, business_email, business_phone, business_address, business_license, logo_url')
          .eq('user_id', proposalData.user_id)
          .limit(1)
          .maybeSingle();
        
        if (e1) throw e1;
        setSettings(st || {});
        setProposal(proposalData);
        console.log('Loaded proposal data:', proposalData); // Debug log
        console.log('Loaded settings data:', st); // Debug log

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
    return <main dir="rtl" style={{ padding:16 }}><div style={{ background:'#fdfdff', border:'1px solid #c6c5b9', padding:8, borderRadius:8 }}>שגיאה: {error}</div></main>;
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
      <HamburgerMenu />
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fdfdff 0%, #c6c5b9 100%)',
        padding: '10px 10px 10px 80px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
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
          background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
          color: 'white',
          padding: '30px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
{settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="לוגו העסק" 
                style={{ height: '50px', width: 'auto', maxWidth: '150px', objectFit: 'contain' }}
              />
            ) : (
              <picture>
                <source media="(max-width: 768px)" srcSet="/image1-mobile.png?v=1737159000" />
                <source media="(min-width: 769px)" srcSet="/logo-new.png?v=1758110947" />
                <img 
                  src="/image1-mobile.png?v=1737159000" 
                  alt="תחנת לחם" 
                  style={{ height: '50px', width: 'auto' }}
                />
              </picture>
            )}
            <div>
              {settings?.business_name && (
                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 'bold'
                }}>
                  {settings.business_name}
                </p>
              )}
              {settings?.business_license && (
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  עוסק מורשה: {settings.business_license}
                </p>
              )}
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
                {settings?.business_email && (
                  <div style={{ marginBottom: '2px' }}>📧 {settings.business_email}</div>
                )}
                {settings?.business_phone && (
                  <div style={{ marginBottom: '2px' }}>📞 {settings.business_phone}</div>
                )}
                {settings?.business_address && (
                  <div style={{ marginBottom: '2px' }}>📍 {settings.business_address}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mobile-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <QuotePDFDownloadButton 
              proposal={proposal}
            />
            <SignedPDFDownloadButton 
              proposal={proposal}
            />
            {proposal?.signature_status !== 'signed' && (
              <button 
                onClick={() => {
                  window.open(`/sign/${id}`, '_blank');
                }}
                style={{
                  background: '#62929e',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(98, 146, 158, 0.3)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#546a7b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(98, 146, 158, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#62929e';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(98, 146, 158, 0.3)';
                }}
              >
                ✍️ שלח לחתימה
              </button>
            )}
            <button 
              onClick={shareWhatsApp} 
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.2)';
              }}
            >
              💬 שיתוף וואטסאפ
            </button>
            <Link 
              href={`/new?id=${proposal.id}`} 
              style={{
                background: '#c6c5b9',
                color: '#393d3f',
                padding: '12px 20px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(198, 197, 185, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#546a7b';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(84, 106, 123, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#c6c5b9';
                e.currentTarget.style.color = '#393d3f';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(198, 197, 185, 0.3)';
              }}
            >
              ✏️ עריכה
            </Link>
          </div>
        </div>

        {/* Content */}
        <div id="quote-content" className="mobile-content" style={{ padding: '30px' }}>

          <section className="mobile-customer" style={{
            background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
            border: '1px solid #c6c5b9',
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
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#393d3f' }}>
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

          {/* Date Information Section */}
          <section style={{
            background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
            border: '1px solid #c6c5b9',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '30px',
              marginBottom: '15px'
            }}>
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '5px',
                  fontWeight: 'bold'
                }}>
                  📅 תאריך יצירה:
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  {new Date(proposal.created_at).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </div>
              </div>
              {proposal.delivery_date && proposal.delivery_date !== '' && (
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '5px',
                    fontWeight: 'bold'
                  }}>
                    🚚 תאריך משלוח:
                  </div>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    {new Date(proposal.delivery_date).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
            <div style={{
              borderTop: '1px solid #c6c5b9',
              paddingTop: '12px',
              fontSize: '13px',
              color: '#666',
              fontStyle: 'italic',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⏰ <span>הצעה זו בתוקף ל-30 יום מתאריך היצירה</span>
              </div>
              {proposal.signature_status === 'signed' && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  background: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '6px',
                  color: '#155724',
                  fontWeight: 'bold',
                  fontStyle: 'normal'
                }}>
                  ✅ נחתם על ידי {proposal.signer_name} בתאריך {new Date(proposal.signature_timestamp).toLocaleDateString('he-IL')}
                </div>
              )}
            </div>
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
                <tr style={{ background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)', color: 'white' }}>
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
                      background: index % 2 === 0 ? '#ffffff' : '#fdfdff',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fdfdff';
                    }}>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#333' }}>{name}</td>
                      <td style={{ padding: '15px', textAlign: 'center', fontWeight: '500' }}>{it.qty}</td>
                      <td style={{ padding: '15px', textAlign: 'center', fontWeight: '500' }}>{currency(it.unit_price)} ₪</td>
                      <td style={{ padding: '15px', color: '#666', fontSize: '14px' }}>{it.notes || '—'}</td>
                      <td style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#393d3f' }}>
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
            background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
            border: '1px solid #c6c5b9',
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
              <span style={{ fontWeight: 'bold', color: '#393d3f' }}>{currency(proposal.subtotal)} ₪</span>
            </div>
            {proposal.include_discount_row && (
              <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '300px', color: '#dc3545' }}>
                <span>הנחה:</span>
                <span style={{ fontWeight: 'bold' }}>-{currency(proposal.discount_value)} ₪</span>
              </div>
            )}
            <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '300px' }}>
              <span>מע״מ ({vatRate}%):</span>
              <span style={{ fontWeight: 'bold', color: '#393d3f' }}>{currency(proposal.vat_amount)} ₪</span>
            </div>
            <div className="total-final" style={{
              fontSize: '20px',
              padding: '15px',
              background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
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

          {(proposal.payment_terms || proposal.notes || (proposal.delivery_date && proposal.delivery_date !== '')) && (
            <section style={{
              background: 'linear-gradient(135deg, #fff 0%, #fdfdff 100%)',
              border: '1px solid #c6c5b9',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              {proposal.payment_terms && (
                <div style={{ marginBottom: ((proposal.delivery_date && proposal.delivery_date !== '') || proposal.notes) ? '15px' : '0' }}>
                  <span style={{ fontWeight: 'bold', color: '#393d3f', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    💳 תנאי תשלום:
                  </span>
                  <div style={{ fontSize: '15px', color: '#666', paddingRight: '25px' }}>
                    {proposal.payment_terms}
                  </div>
                </div>
              )}
              {proposal.delivery_date && proposal.delivery_date !== '' && (
                <div style={{ marginBottom: proposal.notes ? '15px' : '0' }}>
                  <span style={{ fontWeight: 'bold', color: '#393d3f', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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
                  <span style={{ fontWeight: 'bold', color: '#393d3f', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    📝 הערות:
                  </span>
                  <div style={{ fontSize: '15px', color: '#666', paddingRight: '25px' }}>
                    {proposal.notes}
                  </div>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </main>
    </>
  );
}
