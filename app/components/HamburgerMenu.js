'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          background: isOpen ? '#ffdc33' : 'rgba(255, 220, 51, 0.9)',
          border: 'none',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.target.style.background = '#ffdc33';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.target.style.background = 'rgba(255, 220, 51, 0.9)';
        }}
      >
        <div style={{
          width: '24px',
          height: '18px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: isOpen ? 'white' : '#333',
            borderRadius: '1px',
            transform: isOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none',
            transition: 'all 0.3s ease'
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: isOpen ? 'white' : '#333',
            borderRadius: '1px',
            opacity: isOpen ? 0 : 1,
            transition: 'all 0.3s ease'
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: isOpen ? 'white' : '#333',
            borderRadius: '1px',
            transform: isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none',
            transition: 'all 0.3s ease'
          }} />
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-350px',
          width: '320px',
          height: '100vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          zIndex: 1000,
          transition: 'right 0.3s ease',
          boxShadow: isOpen ? '-10px 0 30px rgba(0,0,0,0.2)' : 'none',
          overflowY: 'auto',
          direction: 'rtl'
        }}
      >
        {/* Menu Header */}
        <div style={{
          padding: '80px 30px 30px 30px',
          borderBottom: '1px solid #e9ecef',
          background: 'linear-gradient(135deg, #ffdc33 0%, #e6c52d 100%)',
          color: 'white'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            תפריט ראשי
          </h2>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            opacity: 0.9
          }}>
            מערכת ניהול הצעות מחיר
          </p>
          
          {/* User Info */}
          {session?.user && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="User Avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    👤
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '2px'
                  }}>
                    {session.user.name || 'משתמש'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    wordBreak: 'break-all'
                  }}>
                    {session.user.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div style={{ padding: '20px 0' }}>
          {/* Primary Actions */}
          <div style={{
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e9ecef'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 15px 0',
              padding: '0 30px'
            }}>
              פעולות עיקריות
            </h3>

            <Link href="/dashboard" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>🏠</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    דשבורד
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    חזרה לדף הבית
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/quotes" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>📄</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    הצעות מחיר
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    צפה ונהל הצעות קיימות
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/new" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>🆕</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    הצעה חדשה
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    צור הצעת מחיר חדשה
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Management */}
          <div style={{
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e9ecef'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 15px 0',
              padding: '0 30px'
            }}>
              ניהול
            </h3>

            <Link href="/catalog" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>📁</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    קטלוג מוצרים
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    עדכון וניהול מוצרים
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/schedule" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>📅</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    לוח זמנים
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    הצעות מאושרות לפי שבוע
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/settings" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>⚙️</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    הגדרות
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    ניהול פרטי עסק ולוגו
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* System */}
          <div style={{
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e9ecef'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 15px 0',
              padding: '0 30px'
            }}>
              מערכת
            </h3>

            <Link href="/health" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>⚙️</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    בדיקת מערכת
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    סטטוס ובדיקות
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/support" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '24px' }}>💬</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    תמיכה
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    יצירת קשר ועזרה
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Sign Out */}
          <div style={{ padding: '0 30px' }}>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>🚪</span>
              התנתק
            </button>
          </div>
        </div>
      </div>
    </>
  );
}