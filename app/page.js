'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main dir="rtl" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, Arial',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Logo/Title */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#333',
            margin: '0 0 10px 0',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            תחנת לחם
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            margin: 0
          }}>
            מערכת הצעות מחיר מקצועית
          </p>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#555',
          lineHeight: '1.6',
          marginBottom: '50px'
        }}>
          ברוכים הבאים למערכת ניהול הצעות המחיר של תחנת לחם.<br/>
          כאן תוכלו ליצור הצעות מחיר מקצועיות ולנהל את קטלוג המוצרים.
        </p>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Quotes Card */}
          <Link href="/quotes" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              padding: '30px 20px',
              borderRadius: '15px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(79, 172, 254, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>📄</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>הצעות מחיר</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                צור והנהל הצעות מחיר חדשות
              </p>
            </div>
          </Link>

          {/* Catalog Card */}
          <Link href="/catalog" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#333',
              padding: '30px 20px',
              borderRadius: '15px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(168, 237, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>📁</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>ניהול קטלוג</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                עדכון וניהול מוצרים במערכת
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div style={{
          padding: '20px 0',
          borderTop: '1px solid #eee',
          marginTop: '30px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#888',
            margin: '0 0 15px 0'
          }}>
            פעולות מהירות:
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link href="/new" style={{
              background: '#f8f9fa',
              color: '#495057',
              padding: '8px 16px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid #dee2e6',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}>
              🆕 הצעה חדשה
            </Link>
            <Link href="/health" style={{
              background: '#f8f9fa',
              color: '#495057',
              padding: '8px 16px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid #dee2e6',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}>
              ⚙️ בדיקת מערכת
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
