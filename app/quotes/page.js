'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import HamburgerMenu from '../components/HamburgerMenu';
import { useSession } from 'next-auth/react';
import { validateSessionAndGetBusinessUserId } from '../../lib/businessUserUtils';
import { useRouter } from 'next/navigation';

export default function QuotesList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [settings, setSettings] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const menuRefs = useRef({});

  useEffect(() => {
    if (session?.user?.id) {
      loadQuotes();
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

  const duplicateQuote = async (quoteId) => {
    try {
      const response = await fetch('/api/duplicate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/quote/${data.newQuoteId}?edit=true`);
      } else {
        throw new Error('Failed to duplicate quote');
      }
    } catch (error) {
      console.error('Error duplicating quote:', error);
      alert('שגיאה בשכפול הצעת המחיר');
    }
  };

  const deleteQuote = async (quoteId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק הצעת מחיר זו? פעולה זו לא ניתנת לביטול.')) {
      return;
    }

    try {
      const response = await fetch('/api/delete-quote', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId }),
      });

      if (response.ok) {
        setRows(rows.filter(row => row.id !== quoteId));
        alert('הצעת המחיר נמחקה בהצלחה');
      } else {
        throw new Error('Failed to delete quote');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('שגיאה במחיקת הצעת המחיר');
    }
  };

  const sendForSignature = (quoteId) => {
    router.push(`/quote/${quoteId}/signature`);
  };

  const downloadPDF = (quoteId) => {
    router.push(`/quote/${quoteId}/pdf`);
  };

  const shareWhatsApp = (quote) => {
    const message = `הצעת מחיר מס׳ ${quote.proposal_number || quote.id.slice(0,8)} - סכום: ₪${Number(quote.total || 0).toLocaleString('he-IL')}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const toggleMenu = (quoteId) => {
    setOpenMenuId(openMenuId === quoteId ? null : quoteId);
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
          &#x270D; נחתם
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
        &#x23F3; ממתין
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
        overflow: 'visible'
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
                color: 'rgba(253,253,255,0.9)'
              }}>
                ניהול וצפייה בהצעות המחיר שלך
              </p>
            </div>
          </div>
          
          <div className="mobile-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/new" style={{
              background: '#62929e',
              color: '#fdfdff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(98, 146, 158, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#546a7b';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(98, 146, 158, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#62929e';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(98, 146, 158, 0.3)';
            }}>
              ✚ הצעה חדשה
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="mobile-content" style={{ padding: '30px' }}>
          {err && (
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
              &#x26A0; <strong>שגיאה:</strong> {err}
            </div>
          )}

          {rows.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#546a7b'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>📋</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#393d3f' }}>
                אין הצעות מחיר עדיין
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '30px', opacity: 0.8 }}>
                התחל ביצירת הצעת המחיר הראשונה שלך
              </p>
              <Link href="/new" style={{
                background: '#62929e',
                color: '#fdfdff',
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                boxShadow: '0 3px 10px rgba(98, 146, 158, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#546a7b';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(98, 146, 158, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#62929e';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(98, 146, 158, 0.3)';
              }}>
                ⚙ צור הצעה חדשה
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table" style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflow: 'visible'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)', color: '#fdfdff' }}>
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
                          e.currentTarget.style.backgroundColor = '#c6c5b9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                        }}
                      >
                        <td style={{ padding: '18px', fontSize: '16px', fontWeight: 'bold', color: '#393d3f' }}>
                          #{r.proposal_number || r.id.slice(0,8)}
                        </td>
                        <td style={{ padding: '18px', fontSize: '16px', color: '#393d3f' }}>
                          {r.customer?.name || 'לא צוין'}
                        </td>
                        <td style={{ padding: '18px', fontSize: '14px', color: '#546a7b', textAlign: 'center' }}>
                          {new Date(r.created_at).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '18px', fontSize: '14px', color: '#546a7b', textAlign: 'center' }}>
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
                          color: '#62929e',
                          textAlign: 'left'
                        }}>
                          ₪{Number(r.total || 0).toLocaleString('he-IL')}
                        </td>
                        <td style={{ padding: '18px', textAlign: 'center' }}>
                          {getStatusBadge(r.status || 'pending', r.signature_status)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              ref={(el) => {
                                if (el) menuRefs.current[r.id] = el;
                              }}
                              onClick={() => toggleMenu(r.id)}
                              style={{
                                background: '#62929e',
                                color: '#fdfdff',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#546a7b';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#62929e';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              ⋯
                            </button>
                            
                            {openMenuId === r.id && (
                              <div style={{
                                position: 'fixed',
                                top: menuRefs.current[r.id]?.getBoundingClientRect().bottom + 5 || 0,
                                right: window.innerWidth - (menuRefs.current[r.id]?.getBoundingClientRect().right || 0),
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                border: '1px solid #e9ecef',
                                minWidth: '180px',
                                zIndex: 9999,
                                overflow: 'hidden'
                              }}>
                                <Link
                                  href={`/quote/${r.id}`}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    textDecoration: 'none',
                                    color: '#393d3f',
                                    fontSize: '14px',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  👁 צפייה
                                </Link>
                                
                                <button
                                  onClick={() => {
                                    duplicateQuote(r.id);
                                    setOpenMenuId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#393d3f',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'right',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  📋 שכפול
                                </button>
                                
                                <button
                                  onClick={() => {
                                    deleteQuote(r.id);
                                    setOpenMenuId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#dc3545',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'right',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  🗑 מחק
                                </button>
                                
                                <button
                                  onClick={() => {
                                    sendForSignature(r.id);
                                    setOpenMenuId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#393d3f',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'right',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  ✍ שליחה לחתימה
                                </button>
                                
                                <button
                                  onClick={() => {
                                    downloadPDF(r.id);
                                    setOpenMenuId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#393d3f',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'right',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  📄 הורד PDF
                                </button>
                                
                                <button
                                  onClick={() => {
                                    shareWhatsApp(r);
                                    setOpenMenuId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#25d366',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'right',
                                    transition: 'background 0.2s ease',
                                    borderTop: '1px solid #e9ecef'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8f9fa';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  📱 שתף בוואטסאפ
                                </button>
                              </div>
                            )}
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
                            color: '#546a7b', 
                            textAlign: 'center',
                            fontSize: '16px'
                          }}
                        >
                          &#x1F4DD; אין הצעות מחיר עדיין
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
                          color: '#62929e',
                          marginBottom: '8px'
                        }}>
                          #{r.proposal_number || r.id.slice(0,8)}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#393d3f',
                          marginBottom: '6px'
                        }}>
                          {r.customer?.name || 'לא צוין'}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#546a7b',
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
                        color: '#62929e'
                      }}>
                        ₪{Number(r.total || 0).toLocaleString('he-IL')}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '10px'
                    }}>
                      <Link 
                        href={`/quote/${r.id}`}
                        style={{
                          background: '#62929e',
                          color: '#fdfdff',
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
                          flex: 1
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#546a7b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#62929e';
                        }}
                      >
                        👁 צפייה
                      </Link>
                      
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => toggleMenu(r.id)}
                          style={{
                            background: '#62929e',
                            color: '#fdfdff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            minWidth: '48px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#546a7b';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#62929e';
                          }}
                        >
                          ⋯
                        </button>
                        
                        {openMenuId === r.id && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '1px solid #e9ecef',
                            minWidth: '180px',
                            zIndex: 9999,
                            overflow: 'hidden',
                            marginTop: '5px'
                          }}>
                            <button
                              onClick={() => {
                                duplicateQuote(r.id);
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#393d3f',
                                fontSize: '14px',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'right',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              📋 שכפול
                            </button>
                            
                            <button
                              onClick={() => {
                                deleteQuote(r.id);
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#dc3545',
                                fontSize: '14px',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'right',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              🗑 מחק
                            </button>
                            
                            <button
                              onClick={() => {
                                sendForSignature(r.id);
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#393d3f',
                                fontSize: '14px',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'right',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              ✍ שליחה לחתימה
                            </button>
                            
                            <button
                              onClick={() => {
                                downloadPDF(r.id);
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#393d3f',
                                fontSize: '14px',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'right',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              📄 הורד PDF
                            </button>
                            
                            <button
                              onClick={() => {
                                shareWhatsApp(r);
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#25d366',
                                fontSize: '14px',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'right',
                                transition: 'background 0.2s ease',
                                borderTop: '1px solid #e9ecef'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              📱 שתף בוואטסאפ
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
