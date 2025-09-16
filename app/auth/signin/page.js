'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/');
        return;
      }
      setIsLoading(false);
    };
    checkSession();
  }, [router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  if (isLoading) {
    return (
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, Arial'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', color: '#666' }}>⏳ טוען...</div>
        </div>
      </main>
    );
  }

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
        padding: '20px',
        position: 'relative'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          padding: '50px 40px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          margin: '20px 0'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '40px' }}>
            <picture>
              <source media="(max-width: 768px)" srcSet="/image1.png" />
              <source media="(min-width: 769px)" srcSet="/image3.png" />
              <img 
                src="/image3.png" 
                alt="תחנת לחם" 
                style={{ 
                  height: '100px', 
                  width: 'auto',
                  marginBottom: '20px'
                }}
              />
            </picture>
            <p style={{
              fontSize: '24px',
              color: '#0170B9',
              margin: '0 0 10px 0',
              fontWeight: 'bold'
            }}>
              כשר למהדרין
            </p>
            <p style={{
              fontSize: '20px',
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

          {/* Sign In */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '28px',
              color: '#3a3a3a',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              כניסה למערכת
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#4B4F58',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              יש להתחבר עם חשבון Google כדי לגשת למערכת ניהול הצעות המחיר
            </p>
            {error === 'AccessDenied' && (
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #4B4F58',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                color: '#4B4F58'
              }}>
                <strong>שגיאה:</strong> החשבון שלך אינו מורשה לגשת למערכת
              </div>
            )}
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleSignIn}
            style={{
              background: '#4285f4',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#357ae8';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(66, 133, 244, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4285f4';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(66, 133, 244, 0.3)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            התחבר עם Google
          </button>

          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: 'rgba(1, 112, 185, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(1, 112, 185, 0.2)'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#0170B9',
              margin: 0,
              fontWeight: '600'
            }}>
              🔒 כניסה מאובטחת למערכת
            </p>
            <p style={{
              fontSize: '13px',
              color: '#4B4F58',
              margin: '8px 0 0 0'
            }}>
              המערכת מוגנת באמצעות אימות Google לביטחון מירבי
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}