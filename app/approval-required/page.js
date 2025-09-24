'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import emailjs from '@emailjs/browser'

export default function ApprovalRequired() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleRequestAccess = async () => {
    if (!session?.user?.email) {
      setError('לא נמצא כתובת אימייל בחשבון שלך')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Send approval request email
      await emailjs.send(
        'service_lp16xmn',
        'template_n9zej2e',
        {
          from_name: session.user.name || 'משתמש חדש',
          from_email: session.user.email,
          message: `בקשה לאישור גישה למערכת Hit Quote
          
שם: ${session.user.name || 'לא צוין'}
אימייל: ${session.user.email}
סיבת הבקשה: בקשה לגישה למערכת ניהול הצעות המחיר

אנא אשר את הגישה לחשבון זה.`,
          to_email: 'tal.gurevich2@gmail.com'
        },
        '_-y5PKj_iUMKpv97G'
      )

      // Create pending request in database
      const response = await fetch('/api/request-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email
        })
      })

      if (!response.ok) {
        throw new Error('שליחת הבקשה נכשלה')
      }
      
      setIsSuccess(true)
    } catch (error) {
      console.error('Error requesting access:', error)
      setError('שליחת הבקשה נכשלה. אנא נסה שנית.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (isSuccess) {
    return (
      <main dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: '50px 40px',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(98, 146, 158, 0.2)',
          border: '2px solid rgba(98, 146, 158, 0.1)'
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '20px',
            color: '#62929e' 
          }}>✓</div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#393d3f', 
            marginBottom: '15px' 
          }}>
            הבקשה נשלחה בהצלחה!
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#546a7b', 
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            הבקשה שלך לגישה למערכת נשלחה למנהל. תקבל עדכון באימייל כאשר הגישה תאושר.
          </p>
          <div style={{
            background: 'rgba(98, 146, 158, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <p style={{ 
              fontSize: '16px', 
              color: '#393d3f',
              margin: 0,
              fontWeight: '600'
            }}>
              📧 {session?.user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              background: 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '25px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
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
            חזור לעמוד הראשי
          </button>
        </div>
      </main>
    )
  }

  return (
    <main dir="rtl" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '25px',
        padding: '50px 40px',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.8)'
      }}>
        <div style={{ 
          fontSize: '64px', 
          marginBottom: '20px',
          color: '#62929e' 
        }}>🔒</div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#393d3f', 
          marginBottom: '15px' 
        }}>
          נדרש אישור גישה
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#546a7b', 
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          החשבון שלך זקוק לאישור מנהל כדי לגשת למערכת Hit Quote. 
          לחץ על הכפתור למטה כדי לשלוח בקשה לאישור.
        </p>
        
        {session?.user?.email && (
          <div style={{
            background: 'rgba(98, 146, 158, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <p style={{ 
              fontSize: '16px', 
              color: '#393d3f',
              margin: 0,
              fontWeight: '600'
            }}>
              📧 {session.user.email}
            </p>
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: '25px',
            padding: '15px 20px',
            background: 'rgba(220, 53, 69, 0.1)',
            border: '2px solid rgba(220, 53, 69, 0.2)',
            borderRadius: '15px',
            textAlign: 'right'
          }}>
            <p style={{ 
              color: '#dc3545', 
              fontSize: '14px',
              margin: 0,
              fontWeight: '600'
            }}>
              {error}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleRequestAccess}
            disabled={isLoading}
            style={{
              background: isLoading ? '#87c5d6' : 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '25px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isLoading ? 'none' : '0 4px 15px rgba(98, 146, 158, 0.3)',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(98, 146, 158, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(98, 146, 158, 0.3)';
              }
            }}
          >
            {isLoading ? 'שולח בקשה...' : 'בקש אישור גישה'}
          </button>
          
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              color: '#546a7b',
              padding: '15px 30px',
              borderRadius: '25px',
              border: '2px solid #546a7b',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#546a7b';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#546a7b';
            }}
          >
            התנתק
          </button>
        </div>
      </div>
    </main>
  )
}