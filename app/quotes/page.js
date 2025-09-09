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
          .select('id, proposal_number, created_at, total, customer:customer (name)')
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
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                      <th style={{ textAlign: 'right', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>מס׳ הצעה</th>
                      <th style={{ textAlign: 'right', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>לקוח</th>
                      <th style={{ textAlign: 'center', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>תאריך</th>
                      <th style={{ textAlign: 'left', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}>סכום</th>
                      <th style={{ textAlign: 'center', padding: '18px', width: '120px', fontSize: '16px', fontWeight: 'bold' }}>פעולות</th>
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
                        <td style={{ 
                          padding: '18px', 
                          fontSize: '18px', 
                          fontWeight: 'bold', 
                          color: '#4facfe',
                          textAlign: 'left'
                        }}>
                          ₪{Number(r.total || 0).toLocaleString('he-IL')}
                        </td>
                        <td style={{ padding: '18px', textAlign: 'center' }}>
                          <Link 
                            href={`/quote/${r.id}`}
                            style={{
                              background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 172, 254, 0.3)';
                            }}
                          >
                            👁️ צפייה
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td 
                          colSpan={5} 
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
