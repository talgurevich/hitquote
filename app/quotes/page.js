'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function QuotesList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
        const { data, error } = await supabase
          .from('proposal')
          .select('id, proposal_number, created_at, total')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRows(data || []);
      } catch (e) {
        setErr(e.message || String(e));
      }
    };
    load();
  }, []);

  return (
    <main dir="rtl" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
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
          <div>
            <h1 style={{ 
              margin: '0 0 5px 0', 
              fontSize: '32px', 
              fontWeight: 'bold' 
            }}>
              📋 רשימת הצעות מחיר
            </h1>
            <p style={{ 
              margin: 0, 
              opacity: 0.9, 
              fontSize: '16px' 
            }}>
              ניהול וצפייה בהצעות המחיר שלך
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/" style={{
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
            
            <Link href="/new" style={{
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
            }}>
              ✨ הצעה חדשה
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
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
                background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                🚀 צור הצעה חדשה
              </Link>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gap: '15px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
              }}>
                {rows.map((r) => (
                  <Link 
                    key={r.id} 
                    href={`/quote/${r.id}`} 
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                      border: '1px solid #e9ecef',
                      borderRadius: '15px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      e.currentTarget.style.borderColor = '#4facfe';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '15px'
                      }}>
                        <div>
                          <h3 style={{
                            margin: '0 0 5px 0',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            📋 הצעה #{r.proposal_number || r.id.slice(0,8)}
                          </h3>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            📅 {new Date(r.created_at).toLocaleDateString('he-IL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div style={{
                          background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                          color: 'white',
                          padding: '8px 15px',
                          borderRadius: '20px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          minWidth: '80px'
                        }}>
                          ₪{Number(r.total || 0).toFixed(0)}
                        </div>
                      </div>
                      
                      <div style={{
                        background: 'rgba(79, 172, 254, 0.1)',
                        padding: '10px 15px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        color: '#4facfe',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        לחץ לצפייה ועריכה →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
