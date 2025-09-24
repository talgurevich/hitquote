'use client'

import { useState } from 'react'
import emailjs from '@emailjs/browser'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await emailjs.send(
        'service_lp16xmn',
        'template_n9zej2e',
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'tal.gurevich2@gmail.com'
        },
        '_-y5PKj_iUMKpv97G'
      )
      
      setIsSuccess(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('Error sending email:', error)
      setError('שליחת ההודעה נכשלה. אנא נסה שנית.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <section dir="rtl" id="contact" style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #fdfdff 0%, #c6c5b9 50%, #393d3f 100%)',
        borderTop: '1px solid #546a7b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center' 
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '25px',
            padding: '50px 40px',
            boxShadow: '0 20px 60px rgba(98, 146, 158, 0.2)',
            border: '2px solid rgba(98, 146, 158, 0.1)'
          }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '20px',
              color: '#62929e' 
            }}>✓</div>
            <h3 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#393d3f', 
              marginBottom: '15px' 
            }}>
              ההודעה נשלחה בהצלחה!
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#546a7b', 
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              תודה על פנייתך. אנו נחזור אליך בהקדם האפשרי.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
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
              שלח הודעה נוספת
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section dir="rtl" id="contact" style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #fdfdff 0%, #c6c5b9 50%, #393d3f 100%)',
      borderTop: '1px solid #546a7b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#393d3f', 
            marginBottom: '20px' 
          }}>
            צור קשר
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#546a7b', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            יש לך שאלות על מערכת הצעות המחיר שלנו? נשמח לשמוע ממך ולעזור.
          </p>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '25px',
            padding: '50px 40px',
            boxShadow: '0 20px 60px rgba(98, 146, 158, 0.2)',
            border: '2px solid rgba(98, 146, 158, 0.1)'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="name" style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#393d3f', 
                marginBottom: '10px',
                textAlign: 'right'
              }}>
                שם מלא
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: 'calc(100% - 44px)',
                  padding: '15px 20px',
                  border: '2px solid rgba(98, 146, 158, 0.2)',
                  borderRadius: '15px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'right',
                  direction: 'rtl',
                  boxSizing: 'border-box'
                }}
                placeholder="השם שלך"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#62929e';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(98, 146, 158, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(98, 146, 158, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#393d3f', 
                marginBottom: '10px',
                textAlign: 'right'
              }}>
                כתובת אימייל
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: 'calc(100% - 44px)',
                  padding: '15px 20px',
                  border: '2px solid rgba(98, 146, 158, 0.2)',
                  borderRadius: '15px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'left',
                  direction: 'ltr',
                  boxSizing: 'border-box'
                }}
                placeholder="your.email@example.com"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#62929e';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(98, 146, 158, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(98, 146, 158, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="message" style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#393d3f', 
                marginBottom: '10px',
                textAlign: 'right'
              }}>
                הודעה
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                style={{
                  width: 'calc(100% - 44px)',
                  padding: '15px 20px',
                  border: '2px solid rgba(98, 146, 158, 0.2)',
                  borderRadius: '15px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'right',
                  direction: 'rtl',
                  resize: 'vertical',
                  minHeight: '120px',
                  boxSizing: 'border-box'
                }}
                placeholder="ספר לנו איך נוכל לעזור לך..."
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#62929e';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(98, 146, 158, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(98, 146, 158, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

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

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: isLoading ? '#87c5d6' : 'linear-gradient(135deg, #62929e 0%, #546a7b 100%)',
                color: 'white',
                padding: '18px 30px',
                borderRadius: '25px',
                border: 'none',
                fontSize: '18px',
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
              {isLoading ? 'שולח הודעה...' : 'שלח הודעה'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}