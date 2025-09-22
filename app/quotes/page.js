'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import HamburgerMenu from '../components/HamburgerMenu';
import { useSession } from 'next-auth/react';
import { validateSessionAndGetBusinessUserId } from '../../lib/businessUserUtils';

export default function QuotesList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [settings, setSettings] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      loadQuotes();
    }
  }, [session]);

  const loadQuotes = async () => {
    try {
      if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
      if (!session?.user?.id) throw new Error('No user session');
      
      // Get properly converted user ID
      const userId = await validateSessionAndGetBusinessUserId(session);
      
      // Load quotes and settings in parallel
      const [quotesResult, settingsResult] = await Promise.all([
        supabase
          .from('proposal')
          .select('id, proposal_number, created_at, delivery_date, total, status, signature_status, signature_timestamp, signer_name, customer:customer (name)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('settings')
          .select('logo_url')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle()
      ]);
      
      if (quotesResult.error) throw quotesResult.error;
      let data = quotesResult.data || [];
      
      setRows(data);
      setSettings(settingsResult.data);
      
      // Debug logging
      console.log('Settings loaded:', settingsResult.data);
      console.log('Logo URL:', settingsResult.data?.logo_url);
    } catch (e) {
      setErr(e.message || String(e));
      console.error('Error loading quotes/settings:', e);
    }
  };

  const getStatusBadge = (status, signatureStatus) => {
    // If signed, show signed status regardless of original status
    if (signatureStatus === 'signed') {
      return (
        <span style={{
          background: '#d4edda',
          color: '#155724',
          padding: '5px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          border: '1px solid #c3e6cb',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ✍️ נחתם
        </span>
      );
    }
    
    // Otherwise show waiting status
    return (
      <span style={{
        background: '#fff8e1',
        color: '#ffc107',
        padding: '5px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '1px solid #ffc107',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        ⏳ ממתין
      </span>
    );
  };

  return (
    <>
      <HamburgerMenu />
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 20px !important;
            padding: 20px !important;
          }
          .mobile-header-content {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .mobile-buttons {
            flex-direction: column !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .mobile-buttons a, .mobile-buttons button {
            width: 100% !important;
            justify-content: center !important;
          }
          .mobile-content {
            padding: 15px !important;
          }
          .desktop-table {
            display: none !important;
          }
          .mobile-cards {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-cards {
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
        padding: '10px 10px 10px 80px', // Extra padding on right for hamburger menu
        fontFamily: 'system-ui, Arial'
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
          background: 'linear-gradient(135deg, #ffdc33 0%, #e6c52d 100%)',
          color: 'black',
          padding: '40px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div className="mobile-header-content" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {settings?.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="לוגו העסק" 
                style={{ height: '50px', width: 'auto' }}
              />
            )}
            <div>
              <h1 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '32px', 
                fontWeight: 'bold' 
              }}>
                רשימת הצעות מחיר
              </h1>
              <p style={{ 
                margin: 0, 
                opacity: 0.9, 
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                ניהול וצפייה בהצעות המחיר שלך
              </p>
            </div>
          </div>
          
          <div className="mobile-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.3)',
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
            }}>
              🏠 דף הבית
            </Link>
            
            <Link href="/catalog" style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.3)',
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
            }}>
              📁 ניהול קטלוג
            </Link>
            
            <Link href="/schedule" style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.3)',
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
            }}>
              📅 לוח זמנים
            </Link>
            
            <Link href="/new" style={{
              background: '#ffdc33',
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
              e.currentTarget.style.background = '#e6c52d';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 112, 185, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffdc33';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 112, 185, 0.3)';
            }}>
              🆕 הצעה חדשה
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="mobile-content" style={{ padding: '30px' }}>
          {err && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              color: '#c33',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ⚠️ <strong>שגיאה:</strong> {err}
            </div>
          )}

          {rows.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>📄</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#555' }}>
                אין הצעות מחיר עדיין
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '30px', opacity: 0.8 }}>
                התחל ביצירת הצעת המחיר הראשונה שלך
              </p>
              <Link href="/new" style={{
                background: '#ffdc33',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                boxShadow: '0 3px 10px rgba(1, 112, 185, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e6c52d';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(1, 112, 185, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffdc33';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(1, 112, 185, 0.3)';
              }}>
                🚀 צור הצעה חדשה
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table" style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #ffdc33 0%, #e6c52d 100%)', color: 'white' }}>
                      <th style={{ textAlign: 'right', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>מס׳ הצעה</th>
                      <th style={{ textAlign: 'right', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>לקוח</th>
                      <th style={{ textAlign: 'center', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>תאריך יצירה</th>
                      <th style={{ textAlign: 'center', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>תאריך משלוח</th>
                      <th style={{ textAlign: 'left', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>סכום</th>
                      <th style={{ textAlign: 'center', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>סטטוס</th>
                      <th style={{ textAlign: 'center', padding: '18px', width: '140px', fontSize: '16px', fontWeight: 'bold' }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, index) => (
                      <tr 
                        key={r.id}
                        style={{
                          background: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                          borderBottom: '1px solid #e9ecef',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e3f2fd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                        }}
                      >
                        <td style={{ padding: '18px', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                          #{r.proposal_number || r.id.slice(0,8)}
                        </td>
                        <td style={{ padding: '18px', fontSize: '16px', color: '#495057' }}>
                          {r.customer?.name || 'לא צוין'}
                        </td>
                        <td style={{ padding: '18px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                          {new Date(r.created_at).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '18px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                          {r.delivery_date ? new Date(r.delivery_date).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }) : 'לא צוין'}
                        </td>
                        <td style={{ 
                          padding: '18px', 
                          fontSize: '18px', 
                          fontWeight: 'bold', 
                          color: '#ffdc33',
                          textAlign: 'left'
                        }}>
                          ₪{Number(r.total || 0).toLocaleString('he-IL')}
                        </td>
                        <td style={{ padding: '18px', textAlign: 'center' }}>
                          {getStatusBadge(r.status || 'pending', r.signature_status)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                            <Link 
                              href={`/quote/${r.id}`}
                              title="צפייה בהצעה"
                              style={{
                                background: '#ffdc33',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                fontWeight: 'bold',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e6c52d';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffdc33';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              👁️ צפייה
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td 
                          colSpan={6} 
                          style={{ 
                            padding: '40px', 
                            color: '#666', 
                            textAlign: 'center',
                            fontSize: '16px'
                          }}
                        >
                          📝 אין הצעות מחיר עדיין
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards" style={{ display: 'none' }}>
                {rows.map((r, index) => (
                  <div key={r.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '15px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '15px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#ffdc33',
                          marginBottom: '8px'
                        }}>
                          #{r.proposal_number || r.id.slice(0,8)}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#495057',
                          marginBottom: '6px'
                        }}>
                          {r.customer?.name || 'לא צוין'}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6c757d',
                          marginBottom: '4px'
                        }}>
                          יצירה: {new Date(r.created_at).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6c757d'
                        }}>
                          משלוח: {r.delivery_date ? new Date(r.delivery_date).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }) : 'לא צוין'}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#ffdc33'
                      }}>
                        ₪{Number(r.total || 0).toLocaleString('he-IL')}
                      </div>
                    </div>
                    <Link 
                      href={`/quote/${r.id}`}
                      style={{
                        background: '#ffdc33',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e6c52d';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffdc33';
                      }}
                    >
                      👁️ צפייה בהצעה
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
    </>
  );
}
