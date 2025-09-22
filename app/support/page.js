'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HamburgerMenu from '../components/HamburgerMenu';

export default function SupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setLoading(false);
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
        טוען עמוד תמיכה...
      </div>
    );
  }

  return (
    <>
      <HamburgerMenu />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px 20px 20px 80px' // Extra padding on right for hamburger menu
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>💬</div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#ffdc33',
              margin: '0 0 15px 0'
            }}>
              תמיכה ועזרה
            </h1>
            <p style={{
              color: '#666',
              margin: 0,
              fontSize: '16px'
            }}>
              אנחנו כאן כדי לעזור לך עם המערכת
            </p>
          </div>

          {/* Contact Information */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '25px',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              יצירת קשר
            </h2>

            <div style={{
              display: 'grid',
              gap: '25px'
            }}>
              {/* Phone Support */}
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    📞
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#333',
                      margin: '0 0 5px 0'
                    }}>
                      תמיכה טלפונית
                    </h3>
                    <p style={{
                      color: '#666',
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      זמינים בימי עבודה
                    </p>
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#28a745',
                  textAlign: 'center',
                  padding: '10px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '2px solid #28a745'
                }}>
                  <a href="tel:0504425322" style={{
                    color: '#28a745',
                    textDecoration: 'none'
                  }}>
                    050-442-5322
                  </a>
                </div>
              </div>

              {/* Email Support */}
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    📧
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#333',
                      margin: '0 0 5px 0'
                    }}>
                      תמיכה באימייל
                    </h3>
                    <p style={{
                      color: '#666',
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      מענה תוך 24 שעות
                    </p>
                  </div>
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#17a2b8',
                  textAlign: 'center',
                  padding: '10px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '2px solid #17a2b8'
                }}>
                  <a href="mailto:tal.gurevich@gmail.com" style={{
                    color: '#17a2b8',
                    textDecoration: 'none'
                  }}>
                    tal.gurevich@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              שעות תמיכה
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                padding: '20px',
                background: '#fff9e6',
                borderRadius: '12px',
                border: '2px solid #ffdc33',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>🕐</div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  margin: '0 0 10px 0'
                }}>
                  ימי עבודה
                </h3>
                <p style={{
                  color: '#666',
                  margin: 0,
                  fontSize: '14px'
                }}>
                  ראשון - חמישי<br/>
                  08:00 - 18:00
                </p>
              </div>

              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>💌</div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  margin: '0 0 10px 0'
                }}>
                  תמיכה באימייל
                </h3>
                <p style={{
                  color: '#666',
                  margin: 0,
                  fontSize: '14px'
                }}>
                  זמין 24/7<br/>
                  מענה תוך 24 שעות
                </p>
              </div>
            </div>
          </div>

          {/* Help Tips */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              טיפים מהירים
            </h2>
            
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333' }}>💡 לפני יצירת קשר:</strong><br/>
                • נסה לרענן את הדף<br/>
                • בדוק את חיבור האינטרנט שלך<br/>
                • וודא שהדפדפן מעודכן
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333' }}>🔧 בעיות נפוצות:</strong><br/>
                • אם הטפסים לא נשלחים - נסה לנקות את ה-cache<br/>
                • אם התמונות לא נטענות - בדוק את גודל הקובץ (מקסימום 5MB)<br/>
                • אם יש שגיאות חיבור - נסה שוב בעוד כמה דקות
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#333' }}>📱 תמיכה מהירה:</strong><br/>
                לתמיכה מהירה, אנא ציין את סוג הבעיה ואת הדף בו נתקלת בבעיה
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}