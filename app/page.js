'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      <style jsx>{`
        .background-blur::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url('https://breadstation.co.il/wp-content/uploads/sites/221/2021/10/fo_0009__P1A6761.jpg') center/cover;
          filter: blur(3px);
          z-index: -2;
        }
        .background-overlay::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3));
          z-index: -1;
        }
      `}</style>
      <main dir="rtl" className="background-blur background-overlay" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, Arial',
        padding: '10px',
        position: 'relative'
      }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        margin: '20px 0'
      }}>
        {/* Logo/Title */}
        <div style={{ marginBottom: '40px' }}>
          <img 
            src="/image3.png" 
            alt="תחנת לחם" 
            style={{ 
              height: '80px', 
              width: 'auto',
              marginBottom: '20px'
            }}
          />
          <p style={{
            fontSize: '20px',
            color: '#0170B9',
            margin: '0 0 10px 0',
            fontWeight: 'bold'
          }}>
            כשר למהדרין
          </p>
          <p style={{
            fontSize: '18px',
            color: '#4B4F58',
            margin: '0 0 15px 0'
          }}>
            מערכת הצעות מחיר מקצועית
          </p>
          <p style={{
            fontSize: '16px',
            color: '#3a3a3a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            📍 צפירה 1 עכו
          </p>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#3a3a3a',
          lineHeight: '1.6',
          marginBottom: '50px'
        }}>
          ברוכים הבאים למערכת ניהול הצעות המחיר שלנו.<br/>
          כאן תוכלו ליצור הצעות מחיר מקצועיות ולנהל את קטלוג המוצרים.
        </p>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Quotes Card */}
          <Link href="/quotes" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)',
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
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(1, 112, 185, 0.4)';
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
              background: 'linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 100%)',
              color: '#4B4F58',
              padding: '30px 20px',
              borderRadius: '15px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              border: '2px solid #0170B9'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(1, 112, 185, 0.2)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #0170B9 0%, #025a8a 100%)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 100%)';
              e.currentTarget.style.color = '#4B4F58';
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
              background: '#F5F5F5',
              color: '#4B4F58',
              padding: '8px 16px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid #0170B9',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0170B9';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5';
              e.currentTarget.style.color = '#4B4F58';
            }}>
              🆕 הצעה חדשה
            </Link>
            <Link href="/health" style={{
              background: '#F5F5F5',
              color: '#3a3a3a',
              padding: '8px 16px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid #E5E5E5',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E5E5';
              e.currentTarget.style.borderColor = '#0170B9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5';
              e.currentTarget.style.borderColor = '#E5E5E5';
            }}>
              ⚙️ בדיקת מערכת
            </Link>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
