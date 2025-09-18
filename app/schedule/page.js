'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import UserMenu from '../components/UserMenu';
import { supabase } from '../../lib/supabaseClient';

export default function SchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    generateWeekDates();
    if (!loading) {
      fetchQuotes();
    }
  }, [currentWeek, loading]);

  const checkAuth = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setLoading(false);
  };

  const generateWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Sunday is 0
    startOfWeek.setDate(diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    setWeekDates(week);
  };

  const fetchQuotes = async () => {
    try {
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      
      if (!startDate || !endDate) return;

      const { data, error } = await supabase
        .from('proposal')
        .select(`
          id, 
          proposal_number, 
          delivery_date, 
          created_at,
          total,
          customer:customer (name, phone, email)
        `)
        .eq('status', 'accepted')
        .gte('delivery_date', startDate.toISOString().split('T')[0])
        .lte('delivery_date', endDate.toISOString().split('T')[0])
        .order('delivery_date', { ascending: true });

      if (error) {
        console.error('Error fetching quotes:', error);
        return;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const getQuotesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return quotes.filter(quote => 
      quote.delivery_date === dateString
    );
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('he-IL', { weekday: 'long' });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        טוען...
      </div>
    );
  }

  return (
    <>
      <UserMenu />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#0170B9',
                margin: 0,
                textAlign: 'right'
              }}>
                📅 לוח הצעות מחיר שבועי
              </h1>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => navigateWeek(-1)}
                  style={{
                    padding: '10px 20px',
                    background: '#0170B9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#025a8a'}
                  onMouseLeave={(e) => e.target.style.background = '#0170B9'}
                >
                  ← שבוע קודם
                </button>
                
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333',
                  padding: '0 15px'
                }}>
                  {weekDates.length > 0 && `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`}
                </span>
                
                <button
                  onClick={() => navigateWeek(1)}
                  style={{
                    padding: '10px 20px',
                    background: '#0170B9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#025a8a'}
                  onMouseLeave={(e) => e.target.style.background = '#0170B9'}
                >
                  שבוע הבא →
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px'
            }}>
              <p style={{
                color: '#666',
                margin: 0,
                fontSize: '16px'
              }}>
                סה"כ הצעות השבוע: <strong>{quotes.length}</strong>
              </p>
              
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '8px 16px',
                  background: '#f8f9fa',
                  color: '#0170B9',
                  border: '2px solid #0170B9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#0170B9';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.color = '#0170B9';
                }}
              >
                ← חזור לדשבורד
              </button>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {weekDates.map((date, index) => {
              const dayQuotes = getQuotesForDate(date);
              const today = isToday(date);
              
              return (
                <div
                  key={index}
                  style={{
                    background: today ? '#e3f2fd' : 'white',
                    border: today ? '2px solid #0170B9' : '1px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '15px',
                    minHeight: '300px',
                    boxShadow: today ? '0 4px 20px rgba(1, 112, 185, 0.2)' : '0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Day Header */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '15px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid #f8f9fa'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '5px'
                    }}>
                      {getDayName(date)}
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: today ? '#0170B9' : '#333'
                    }}>
                      {formatDate(date)}
                    </div>
                    {dayQuotes.length > 0 && (
                      <div style={{
                        fontSize: '12px',
                        color: '#0170B9',
                        fontWeight: 'bold',
                        marginTop: '5px'
                      }}>
                        {dayQuotes.length} הצעות
                      </div>
                    )}
                  </div>

                  {/* Quotes for this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        onClick={() => router.push(`/quote/${quote.id}`)}
                        style={{
                          background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'transform 0.2s ease',
                          boxShadow: '0 2px 8px rgba(1, 112, 185, 0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div style={{
                          fontWeight: 'bold',
                          marginBottom: '4px',
                          fontSize: '14px'
                        }}>
                          #{quote.proposal_number}
                        </div>
                        <div style={{
                          marginBottom: '4px',
                          opacity: 0.9
                        }}>
                          {quote.customer?.name || 'לקוח לא ידוע'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          opacity: 0.8
                        }}>
                          ₪{quote.total?.toLocaleString('he-IL') || '0'}
                        </div>
                      </div>
                    ))}
                    
                    {dayQuotes.length === 0 && (
                      <div style={{
                        color: '#999',
                        textAlign: 'center',
                        fontSize: '14px',
                        padding: '20px 0',
                        fontStyle: 'italic'
                      }}>
                        אין הצעות
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile responsive styles */}
          <style jsx>{`
            @media (max-width: 768px) {
              div[style*="gridTemplateColumns"] {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
              }
            }
            
            @media (max-width: 1024px) {
              div[style*="gridTemplateColumns"] {
                grid-template-columns: repeat(3, 1fr) !important;
              }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}