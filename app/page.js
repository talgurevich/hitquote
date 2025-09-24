'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ContactForm from '../components/ContactForm';

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hit Quote - מערכת הצעות מחיר מקצועית",
    "description": "מערכת מתקדמת לניהול הצעות מחיר, יצירת הצעות מחיר אונליין, ניהול קטלוג מוצרים וחתימה דיגיטלית. פתרון מקצועי לעסקים קטנים ובינוניים בישראל.",
    "url": "https://hitquote-3af50317cd73.herokuapp.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "ILS"
    },
    "featureList": [
      "יצירת הצעות מחיר מקצועיות",
      "ניהול קטלוג מוצרים",
      "חתימה דיגיטלית מאובטחת",
      "ניהול לקוחות CRM",
      "ייצוא PDF מקצועי",
      "אימות Google מאובטח"
    ],
    "inLanguage": "he",
    "publisher": {
      "@type": "Organization",
      "name": "Hit Quote",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hitquote-3af50317cd73.herokuapp.com/logo2.png"
      }
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(98, 146, 158, 0.1)',
        padding: '10px 15px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(98, 146, 158, 0.1)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Navigation Menu */}
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '20px',
            alignItems: 'center',
            fontFamily: 'inherit',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <li>
              <a 
                href="#features" 
                style={{
                  textDecoration: 'none',
                  color: '#393d3f',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#62929e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#393d3f';
                }}
              >
                תכונות
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                style={{
                  textDecoration: 'none',
                  color: '#393d3f',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#62929e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#393d3f';
                }}
              >
                אודותינו
              </a>
            </li>
            <li>
              <a 
                href="#faq" 
                style={{
                  textDecoration: 'none',
                  color: '#393d3f',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#62929e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#393d3f';
                }}
              >
                שאלות נפוצות
              </a>
            </li>
            <li>
              <a 
                href="#login" 
                style={{
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(98, 146, 158, 0.3)',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(98, 146, 158, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(98, 146, 158, 0.3)';
                }}
              >
                כניסה למערכת
              </a>
            </li>
          </ul>
        </nav>
      </header>

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
        <section className="parallax-bg" style={{
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
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
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
              יצירת הצעות מחיר מקצועיות בקליקים ספורים | ניהול קטלוג מוצרים מתקדם | חתימה דיגיטלית מאובטחת | פתרון CRM מושלם לעסקים קטנים ובינוניים בישראל
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
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>יצירת הצעות מחיר מהירה</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>הכנת הצעת מחיר מקצועית בקליקים ספורים - חסכו זמן ויוצרים הצעות מחיר מושלמות תוך דקות</div>
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
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>ניהול קטלוג מוצרים מתקדם</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>ניהול מלאי מוצרים, עדכון מחירים באופן מיידי, ויצירת בסיס נתונים מותאם לעסק שלכם</div>
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
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>אבטחת נתונים מתקדמת</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>אימות Google מאובטח, הגנה על נתונים רגישים, וגיבוי אוטומטי של כל המידע העסקי</div>
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
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#393d3f', marginBottom: '10px' }}>חתימה דיגיטלית מתקדמת</div>
                <div style={{ fontSize: '14px', color: '#393d3f', lineHeight: '1.5' }}>אישור הצעות מחיר דיגיטלי מאובטח, חתימה אלקטרונית מחייבת ומעקב סטטוס בזמן אמת</div>
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
        <section id="features" style={{
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
              מערכת הצעות מחיר מקצועית - תכונות מתקדמות לעסק שלכם
            </h2>
            <p style={{
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#666',
              maxWidth: '700px',
              margin: '0 auto 60px auto'
            }}>
              מערכת CRM מושלמת לניהול הצעות מחיר, לקוחות ומוצרים - הכל במקום אחד. פתרון דיגיטלי מתקדם לעסקים קטנים ובינוניים הזקוקים לכלי ניהול מקצועי בישראל
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

        {/* FAQ Section for SEO */}
        <section id="faq" style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #546a7b 0%, #393d3f 100%)',
          borderTop: '1px solid #c6c5b9'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '50px',
              color: '#fdfdff'
            }}>
              שאלות נפוצות - מערכת הצעות מחיר
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{
                background: 'rgba(253, 253, 255, 0.95)',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(198, 197, 185, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#393d3f', marginBottom: '15px' }}>
                  איך יוצרים הצעת מחיר במערכת?
                </h3>
                <p style={{ fontSize: '16px', color: '#546a7b', lineHeight: '1.6', margin: 0 }}>
                  יצירת הצעת מחיר במערכת Hit Quote היא פשוטה ומהירה. לחצו על "הצעת מחיר חדשה", בחרו מוצרים מהקטלוג, הוסיפו פרטי לקוח ותקבלו הצעת מחיר מקצועית מוכנה להדפסה או לשליחה דיגיטלית.
                </p>
              </div>
              
              <div style={{
                background: 'rgba(253, 253, 255, 0.95)',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(198, 197, 185, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#393d3f', marginBottom: '15px' }}>
                  האם ניתן להתאים אישית את הצעת המחיר?
                </h3>
                <p style={{ fontSize: '16px', color: '#546a7b', lineHeight: '1.6', margin: 0 }}>
                  כן! המערכת מאפשרת להתאים את הצעת המחיר לעסק שלכם - הוספת לוגו אישי, עיצוב מותאם, הוספת תנאים מיוחדים ופרטי חברה. כל הצעת מחיר תיראה מקצועית ותשקף את המותג שלכם.
                </p>
              </div>
              
              <div style={{
                background: 'rgba(253, 253, 255, 0.95)',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(198, 197, 185, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#393d3f', marginBottom: '15px' }}>
                  איך עובדת החתימה הדיגיטלית?
                </h3>
                <p style={{ fontSize: '16px', color: '#546a7b', lineHeight: '1.6', margin: 0 }}>
                  החתימה הדיגיטלית במערכת Hit Quote מאפשרת ללקוחות לאשר הצעת מחיר באופן מקוון ומאובטח. הלקוח מקבל קישור לאישור, חותם דיגיטלית ואתם מקבלים עדכון מיידי על סטטוס ההצעה.
                </p>
              </div>
              
              <div style={{
                background: 'rgba(253, 253, 255, 0.95)',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(198, 197, 185, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#393d3f', marginBottom: '15px' }}>
                  האם המערכת מתאימה לעסקים קטנים?
                </h3>
                <p style={{ fontSize: '16px', color: '#546a7b', lineHeight: '1.6', margin: 0 }}>
                  בהחלט! המערכת תוכננה במיוחד עבור עסקים קטנים ובינוניים בישראל. היא פשוטה לשימוש, לא דורשת הכשרה מיוחדת ומתאימה לכל סוג עסק הזקוק לניהול הצעות מחיר מקצועיות.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #c6c5b9 0%, #fdfdff 100%)',
          borderTop: '1px solid #546a7b'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '30px',
              color: '#393d3f'
            }}>
              אודותינו - הסיפור שלנו
            </h2>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(98, 146, 158, 0.1)',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <p style={{
                fontSize: '20px',
                color: '#393d3f',
                lineHeight: '1.7',
                marginBottom: '25px',
                fontWeight: '500'
              }}>
                אנחנו שני יזמים שהגיעו מהנוף של עסקים קטנים וזיהו בעיה יומיומית משותפת
              </p>
              
              <p style={{
                fontSize: '18px',
                color: '#546a7b',
                lineHeight: '1.6',
                marginBottom: '25px'
              }}>
                כל יום, עסקים קטנים ובינוניים מתמודדים עם אתגר יצירת הצעות מחיר מקצועיות. המציאות הייתה מורכבת: 
                קבצי Word לא עקביים, חישובים ידניים מועדים לטעויות, ותהליכים איטיים שגוזלים זמן יקר.
              </p>
              
              <p style={{
                fontSize: '18px',
                color: '#546a7b',
                lineHeight: '1.6',
                marginBottom: '30px'
              }}>
                מתוך הבנה עמוקה של הצרכים הללו, פיתחנו את Hit Quote - פתרון פשוט, מהיר ומקצועי שהופך את יצירת 
                הצעות המחיר מתהליך מתיש למשימה של דקות ספורות. המטרה שלנו היא לאפשר לכל עסק, גדול כקטן, 
                להתמקד במה שהם עושים הכי טוב - במקום לבזבז זמן על משימות אדמיניסטרטיביות.
              </p>
              
              <div style={{
                background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: '500',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                ב-Hit Quote, אנו מאמינים שכל עסק זכאי לכלים מקצועיים ופשוטים שיעזרו לו לצמוח ולהצליח
              </div>
            </div>
          </div>
        </section>


        {/* Login Section */}
        <section id="login" style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
          borderTop: '1px solid #c6c5b9',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className="login-card" style={{
            background: 'rgba(253, 253, 255, 0.98)',
            borderRadius: '25px',
            padding: '50px 40px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
            border: '2px solid rgba(198, 197, 185, 0.4)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)'
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
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              יש להתחבר עם חשבון Google כדי לגשת למערכת ניהול הצעות המחיר
            </p>
            
            {/* New User Notice */}
            <div style={{
              background: 'rgba(98, 146, 158, 0.1)',
              border: '1px solid rgba(98, 146, 158, 0.3)',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '25px',
              textAlign: 'right'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#393d3f',
                margin: '0 0 8px 0',
                fontWeight: '600'
              }}>
                🆕 משתמש חדש?
              </p>
              <p style={{
                fontSize: '13px',
                color: '#546a7b',
                margin: 0,
                lineHeight: '1.4'
              }}>
                אם זו הפעם הראשונה שלך במערכת, לאחר ההתחברות תתבקש לשלוח בקשת אישור. 
                השתמש בטופס יצירת הקשר למטה כדי לבקש גישה למערכת.
              </p>
            </div>
            
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

        {/* Contact Form */}
        <ContactForm />

        {/* Footer */}
        <footer style={{
          background: '#333',
          borderTop: '1px solid #c6c5b9',
          padding: '50px 20px 30px 20px',
          color: '#ccc'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Main Footer Content */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '40px',
              marginBottom: '40px',
              textAlign: 'right'
            }}>
              {/* Company Info */}
              <div>
                <h3 style={{
                  color: '#62929e',
                  fontSize: '18px',
                  marginBottom: '20px',
                  fontWeight: 'bold'
                }}>
                  Hit Quote - מערכת הצעות מחיר
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#bbb',
                  margin: 0
                }}>
                  פתרון מקצועי ופשוט לניהול הצעות מחיר עבור עסקים קטנים ובינוניים בישראל. 
                  יצירת הצעות מחיר מהירה, ניהול קטלוג מוצרים וחתימה דיגיטלית מאובטחת.
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h3 style={{
                  color: '#62929e',
                  fontSize: '18px',
                  marginBottom: '20px',
                  fontWeight: 'bold'
                }}>
                  צור קשר
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong style={{ color: '#fff' }}>כתובת:</strong> ברכה צפירה, עכו
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong style={{ color: '#fff' }}>LinkedIn:</strong>{' '}
                    <a 
                      href="https://www.linkedin.com/in/talgurevich/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#62929e',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#87c5d6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#62929e';
                      }}
                    >
                      Tal Gurevich
                    </a>
                  </p>
                </div>
              </div>

              {/* Legal Links */}
              <div>
                <h3 style={{
                  color: '#62929e',
                  fontSize: '18px',
                  marginBottom: '20px',
                  fontWeight: 'bold'
                }}>
                  מידע משפטי
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <a 
                      href="/terms"
                      style={{
                        color: '#bbb',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#62929e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#bbb';
                      }}
                    >
                      תנאי שימוש
                    </a>
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <a 
                      href="/privacy"
                      style={{
                        color: '#bbb',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#62929e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#bbb';
                      }}
                    >
                      מדיניות פרטיות
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div style={{
              borderTop: '1px solid #444',
              paddingTop: '20px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#999',
                margin: 0
              }}>
                © 2024 Hit Quote. כל הזכויות שמורות. | פותח בישראל עם ❤️ עבור עסקים קטנים
              </p>
            </div>
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