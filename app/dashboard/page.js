'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import HamburgerMenu from '../components/HamburgerMenu';
import { supabase } from '../../lib/supabaseClient';

export default function Home() {
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingQuotes: 0,
    thisMonthTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await getSession();
    if (!session) {
      window.location.href = '/';
      return;
    }
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    try {
      // Load recent quotes
      const { data: quotes, error: quotesError } = await supabase
        .from('proposal')
        .select(`
          id, 
          proposal_number, 
          total, 
          created_at, 
          signature_status,
          customer:customer (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (quotesError) throw quotesError;
      setRecentQuotes(quotes || []);

      // Load stats
      const { data: allQuotes, error: statsError } = await supabase
        .from('proposal')
        .select('total, created_at, signature_status');

      if (statsError) throw statsError;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalQuotes = allQuotes?.length || 0;
      const pendingQuotes = allQuotes?.filter(q => q.signature_status !== 'signed')?.length || 0;
      const thisMonthTotal = allQuotes
        ?.filter(q => new Date(q.created_at) >= firstDayOfMonth)
        ?.reduce((sum, q) => sum + (Number(q.total) || 0), 0) || 0;

      setStats({
        totalQuotes,
        pendingQuotes,
        thisMonthTotal
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        color: '#666',
        fontSize: '18px'
      }}>
        טוען דשבורד...
      </div>
    );
  }

  return (
    <>
      <HamburgerMenu />
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px 20px 20px 80px', // Extra padding on right for hamburger menu
        fontFamily: 'system-ui, Arial'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <img 
            src="/logo2.png" 
            alt="HIT Quote" 
            style={{ 
              height: '160px', 
              width: 'auto',
              marginBottom: '25px'
            }}
          />
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ffdc33',
            margin: '0 0 10px 0'
          }}>
            דשבורד ראשי
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            סקירה כללית של המערכת שלך
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffdc33 0%, #e6c52d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📄
              </div>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 5px 0'
                }}>
                  {stats.totalQuotes}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  סה״כ הצעות מחיר
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ⏰
              </div>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 5px 0'
                }}>
                  {stats.pendingQuotes}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  ממתינות לאישור
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                💰
              </div>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 5px 0'
                }}>
                  ₪{stats.thisMonthTotal.toLocaleString()}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  סה״כ החודש
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            margin: '0 0 20px 0'
          }}>
            פעולות מהירות
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <Link href="/new" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffdc33 0%, #e6c52d 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                border: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🆕</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>הצעה חדשה</div>
              </div>
            </Link>

            <Link href="/quotes" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                color: '#333',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                border: '2px solid #ffdc33'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>כל ההצעות</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Quotes */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            margin: '0 0 20px 0'
          }}>
            הצעות אחרונות
          </h2>
          {recentQuotes.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', margin: '40px 0' }}>
              עדיין לא נוצרו הצעות מחיר
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '600px'
              }}>
                <thead>
                  <tr style={{
                    background: '#f8f9fa',
                    borderBottom: '2px solid #e9ecef'
                  }}>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>מספר הצעה</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>לקוח</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>סכום</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>סטטוס</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotes.map((quote) => (
                    <tr key={quote.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '12px' }}>
                        <Link href={`/quote/${quote.id}`} style={{
                          color: '#ffdc33',
                          textDecoration: 'none',
                          fontWeight: 'bold'
                        }}>
                          #{quote.proposal_number || quote.id.slice(0,8)}
                        </Link>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {quote.customer?.name || 'לא צוין'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        ₪{Number(quote.total || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: quote.signature_status === 'signed' ? '#d4edda' : '#fff3cd',
                          color: quote.signature_status === 'signed' ? '#155724' : '#856404'
                        }}>
                          {quote.signature_status === 'signed' ? 'חתום' : 'ממתין'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        {new Date(quote.created_at).toLocaleDateString('he-IL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
