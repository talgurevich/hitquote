'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
        return;
      }
      setIsLoading(false);
    };
    checkSession();
  }, [router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  const screenshots = [
    {
      src: '/screenshot-newquote.png',
      alt: 'יצירת הצעת מחיר חדשה',
      title: 'יצירת הצעת מחיר',
      description: 'ממשק פשוט ואינטואיטיבי ליצירת הצעות מחיר מקצועיות'
    },
    {
      src: '/screenshot-catalog.png',
      alt: 'ניהול קטלוג מוצרים',
      title: 'קטלוג מוצרים',
      description: 'ניהול מתקדם של מוצרים עם חיפוש וסינון מהיר'
    },
    {
      src: '/screenshot-pdf.png',
      alt: 'ייצוא PDF מקצועי',
      title: 'ייצוא PDF',
      description: 'הפקת מסמכים מקצועיים עם הלוגו שלכם'
    },
    {
      src: '/screenshot-signature.png',
      alt: 'חתימה דיגיטלית',
      title: 'חתימה דיגיטלית',
      description: 'אישור מקוון מחייב עם חתימה דיגיטלית מאובטחת'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const openImageModal = (imageData) => {
    setSelectedImage(imageData);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);
  

  if (isLoading) {
    return (
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', color: '#666' }}>&#x23F3; טוען...</div>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx>{`
        .hero-bg::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background-image: url('/bg1.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(8px) brightness(0.6);
          z-index: -2;
        }
        
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(2px);
          z-index: -1;
        }
        
        @media (max-width: 768px) {
          .parallax-bg {
            background-attachment: scroll;
          }
          .hero-title {
            font-size: 36px !important;
          }
          .hero-subtitle {
            font-size: 18px !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .feature-card {
            padding: 25px !important;
          }
          .login-card {
            padding: 30px 25px !important;
            margin: 20px !important;
          }
          .hero-logo {
            height: 160px !important;
          }
          .hero-content {
            padding: 40px 30px !important;
          }
          .contact-form {
            padding: 25px 20px !important;
          }
          .contact-form input {
            font-size: 16px !important;
          }
        }
      `}</style>
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        color: '#333'
      }}>
        
        {/* Hero Section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 20px',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url("/bg1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Background Image */}
          <div className="hero-bg"></div>
          {/* Overlay for better text readability */}
          <div className="hero-overlay"></div>
          
          {/* Content */}
          <div className="hero-content" style={{
            maxWidth: '800px',
            width: '100%',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Logo */}
            <img 
              src="/logo2.png" 
              alt="Logo" 
              className="hero-logo"
              style={{ 
                height: '480px', 
                width: 'auto',
                marginBottom: '20px'
              }}
            />
            
            {/* Hero Title */}
            <h1 className="hero-title" style={{
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              color: '#62929e'
            }}>
              מערכת הצעות מחיר מקצועית
            </h1>
            
            {/* Hero Subtitle */}
            <p className="hero-subtitle" style={{
              fontSize: '22px',
              color: '#4B4F58',
              lineHeight: '1.6',
              margin: '0 auto 40px auto',
              maxWidth: '600px',
              textAlign: 'center'
            }}>
              פתרון מתקדם וחכם לניהול הצעות מחיר, ניהול קטלוג מוצרים ויצירת מסמכים מקצועיים
            </p>
            
            {/* Key Benefits */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '30px',
              marginBottom: '50px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '25px',
                border: '2px solid #62929e',
                boxShadow: '0 8px 25px rgba(98, 146, 158, 0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(98, 146, 158, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(98, 146, 158, 0.2)';
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="#62929e"/>
                  </svg>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>מהיר ויעיל</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>יצירת הצעות מחיר בקליקים ספורים</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '25px',
                border: '2px solid #62929e',
                boxShadow: '0 8px 25px rgba(98, 146, 158, 0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(98, 146, 158, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(98, 146, 158, 0.2)';
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v4h8V3h-8z" fill="#62929e"/>
                  </svg>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>ניהול מתקדם</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>קטלוג מוצרים וניהול לקוחות</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '25px',
                border: '2px solid #62929e',
                boxShadow: '0 8px 25px rgba(98, 146, 158, 0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(98, 146, 158, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(98, 146, 158, 0.2)';
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#62929e"/>
                  </svg>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>מאובטח</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>אימות Google ובטיחות מירבית</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '25px',
                border: '2px solid #62929e',
                boxShadow: '0 8px 25px rgba(98, 146, 158, 0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(98, 146, 158, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(98, 146, 158, 0.2)';
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="none" stroke="#62929e" strokeWidth="2"/>
                    <path d="M14 2v6h6" fill="none" stroke="#62929e" strokeWidth="2"/>
                    <path d="M16 13H8" fill="none" stroke="#62929e" strokeWidth="2"/>
                    <path d="M16 17H8" fill="none" stroke="#62929e" strokeWidth="2"/>
                    <path d="M10 9H8" fill="none" stroke="#62929e" strokeWidth="2"/>
                    <path d="M12 19l2-2-2-2" fill="none" stroke="#62929e" strokeWidth="2"/>
                  </svg>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>חתימה דיגיטלית</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>אישור מקוון מחייב בקליק אחד</div>
              </div>
            </div>
            
            {/* CTA to Login Section */}
            <a 
              href="#login" 
              style={{
                background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(98, 146, 158, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(98, 146, 158, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(98, 146, 158, 0.3)';
              }}
            >
              ⚙ התחל עכשיו
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          padding: '80px 20px',
          background: '#fdfdff',
          borderTop: '1px solid #c6c5b9'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
              color: '#333'
            }}>
              תכונות מתקדמות
            </h2>
            <p style={{
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto 60px auto'
            }}>
              כל מה שצריך לניהול מקצועי של הצעות מחיר ולקוחות
            </p>
            
            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {/* Feature 1 */}
              <div className="feature-card" style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 30px',
                textAlign: 'center',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
                <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>יצירת הצעות מחיר</h3>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  צרו הצעות מחיר מקצועיות עם חישובים אוטומטיים, מע"מ והנחות. ייצוא ישיר ל-PDF ושיתוף בוואטסאפ.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="feature-card" style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 30px',
                textAlign: 'center',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>&#x1F4C1;</div>
                <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>ניהול קטלוג</h3>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  נהלו את קטלוג המוצרים שלכם בקלות. העלאת CSV או עריכה ישירה במערכת עם תמיכה בקטגוריות ואפשרויות.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="feature-card" style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 30px',
                textAlign: 'center',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>&#x1F465;</div>
                <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>ניהול לקוחות</h3>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  שמרו פרטי לקוחות, עקבו אחר הצעות מחיר קודמות וצרו מסד נתונים מאורגן של כל הפעילות העסקית.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshots Section */}
        <section style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #fdfdff 0%, #c6c5b9 100%)',
          borderTop: '1px solid #c6c5b9'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
              color: '#393d3f'
            }}>
              ראה את המערכת בפעולה
            </h2>
            <p style={{
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#546a7b',
              maxWidth: '600px',
              margin: '0 auto 60px auto'
            }}>
              מבט על התכונות המתקדמות והממשק הידידותי של המערכת
            </p>
            
            {/* Carousel Container */}
            <div style={{
              position: 'relative',
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 15px 50px rgba(98, 146, 158, 0.2)',
              border: '2px solid rgba(98, 146, 158, 0.1)',
              overflow: 'hidden'
            }}>
              {/* Current Screenshot */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '40px',
                minHeight: '400px'
              }}>
                {/* Image */}
                <div style={{
                  flex: '1',
                  maxWidth: '60%',
                  textAlign: 'center'
                }}>
                  <img 
                    src={screenshots[currentSlide].src}
                    alt={screenshots[currentSlide].alt}
                    onClick={() => openImageModal(screenshots[currentSlide])}
                    style={{
                      width: '100%',
                      maxWidth: '500px',
                      height: 'auto',
                      borderRadius: '15px',
                      boxShadow: '0 10px 30px rgba(98, 146, 158, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(98, 146, 158, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(98, 146, 158, 0.3)';
                    }}
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#546a7b',
                    marginTop: '15px',
                    fontStyle: 'italic'
                  }}>
                    🔍 לחץ על התמונה לצפייה מלאה
                  </p>
                </div>
                
                {/* Content */}
                <div style={{
                  flex: '1',
                  maxWidth: '40%',
                  textAlign: 'right'
                }}>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#393d3f',
                    marginBottom: '20px'
                  }}>
                    {screenshots[currentSlide].title}
                  </h3>
                  <p style={{
                    fontSize: '18px',
                    color: '#546a7b',
                    lineHeight: '1.6',
                    marginBottom: '30px'
                  }}>
                    {screenshots[currentSlide].description}
                  </p>
                  
                  {/* Navigation Dots */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    {screenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        style={{
                          width: currentSlide === index ? '30px' : '12px',
                          height: '12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: currentSlide === index ? '#62929e' : '#c6c5b9',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(98, 146, 158, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(98, 146, 158, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#546a7b';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(98, 146, 158, 0.9)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ←
              </button>
              
              <button
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(98, 146, 158, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(98, 146, 158, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#546a7b';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(98, 146, 158, 0.9)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                →
              </button>
            </div>

            {/* Call to Action */}
            <div style={{
              textAlign: 'center',
              marginTop: '50px'
            }}>
              <a 
                href="#login" 
                style={{
                  background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(98, 146, 158, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(98, 146, 158, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(98, 146, 158, 0.3)';
                }}
              >
                🚀 התחל לעבוד עם המערכת
              </a>
            </div>
          </div>
        </section>

        {/* Login Section */}
        <section id="login" style={{
          padding: '80px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className="login-card" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '25px',
            padding: '50px 40px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
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
                background: '#fdfdff',
                border: '1px solid #4B4F58',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                color: '#4B4F58'
              }}>
                <strong>שגיאה:</strong> החשבון שלך אינו מורשה לגשת למערכת
              </div>
            )}

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
              background: 'rgba(98, 146, 158, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(98, 146, 158, 0.2)'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#62929e',
                margin: 0,
                fontWeight: '600'
              }}>
                &#x1F512; כניסה מאובטחת למערכת
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
        </section>


        {/* Footer */}
        <footer style={{
          background: '#333',
          borderTop: '1px solid #c6c5b9',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#ccc',
              margin: 0
            }}>
              Vibe coded with a simple stack by{' '}
              <a 
                href="https://www.linkedin.com/in/talgurevich/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#62929e',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#546a7b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#62929e';
                }}
              >
                Tal Gurevich
              </a>
            </p>
          </div>
        </footer>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={closeImageModal}>
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%'
          }}>
            <img 
              src={selectedImage.src}
              alt={selectedImage.alt}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '10px'
              }}
            />
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}