'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminApprovals() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingRequests, setPendingRequests] = useState([])
  const [approvedEmails, setApprovedEmails] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [newEmail, setNewEmail] = useState('')
  const [isAddingEmail, setIsAddingEmail] = useState(false)

  // Check if user is admin (you can adjust this condition)
  const isAdmin = session?.user?.email === 'tal.gurevich@gmail.com'

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !isAdmin) {
      router.push('/dashboard')
      return
    }
    
    fetchData()
  }, [session, status, isAdmin, router])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/admin/pending-requests'),
        fetch('/api/admin/approved-emails')
      ])
      
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingRequests(pendingData.requests || [])
      }
      
      if (approvedRes.ok) {
        const approvedData = await approvedRes.json()
        setApprovedEmails(approvedData.emails || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (email) => {
    try {
      const response = await fetch('/api/admin/approve-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        alert('שגיאה באישור האימייל')
      }
    } catch (error) {
      console.error('Error approving email:', error)
      alert('שגיאה באישור האימייל')
    }
  }

  const handleReject = async (email) => {
    if (!confirm(`האם אתה בטוח שברצונך לדחות את ${email}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/reject-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        alert('שגיאה בדחיית האימייל')
      }
    } catch (error) {
      console.error('Error rejecting email:', error)
      alert('שגיאה בדחיית האימייל')
    }
  }

  const handleRevokeApproval = async (email) => {
    if (!confirm(`האם אתה בטוח שברצונך לבטל את האישור עבור ${email}? המשתמש לא יוכל יותר לגשת למערכת.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/reject-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        await fetchData() // Refresh data
        alert(`האישור עבור ${email} בוטל בהצלחה`)
      } else {
        alert('שגיאה בביטול האישור')
      }
    } catch (error) {
      console.error('Error revoking approval:', error)
      alert('שגיאה בביטול האישור')
    }
  }

  const handleAddNewEmail = async () => {
    if (!newEmail.trim()) {
      alert('אנא הזן כתובת אימייל')
      return
    }

    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      alert('אנא הזן כתובת אימייל תקינה')
      return
    }

    setIsAddingEmail(true)

    try {
      const response = await fetch('/api/admin/approve-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail.trim() })
      })

      if (response.ok) {
        await fetchData() // Refresh data
        setNewEmail('') // Clear input
        alert(`${newEmail.trim()} נוסף בהצלחה לרשימת המאושרים`)
      } else {
        const errorData = await response.json()
        alert(`שגיאה בהוספת האימייל: ${errorData.message || 'שגיאה לא ידועה'}`)
      }
    } catch (error) {
      console.error('Error adding new email:', error)
      alert('שגיאה בהוספת האימייל')
    } finally {
      setIsAddingEmail(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: 'system-ui'
      }}>
        <div>טוען...</div>
      </div>
    )
  }

  if (!session || !isAdmin) {
    return null
  }

  return (
    <div dir="rtl" style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#393d3f',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          ניהול אישורי גישה
        </h1>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: 'none',
              background: activeTab === 'pending' ? '#62929e' : '#ffffff',
              color: activeTab === 'pending' ? 'white' : '#62929e',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'pending' ? '0 4px 15px rgba(98, 146, 158, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            בקשות ממתינות ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: 'none',
              background: activeTab === 'approved' ? '#62929e' : '#ffffff',
              color: activeTab === 'approved' ? 'white' : '#62929e',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'approved' ? '0 4px 15px rgba(98, 146, 158, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            משתמשים מאושרים ({approvedEmails.length})
          </button>
        </div>

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#393d3f',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              בקשות ממתינות לאישור
            </h2>
            
            {pendingRequests.length === 0 ? (
              <p style={{ 
                textAlign: 'center', 
                color: '#666',
                fontSize: '18px',
                padding: '40px'
              }}>
                אין בקשות ממתינות כרגע
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {pendingRequests.map((request) => (
                  <div key={request.email} style={{
                    background: '#f8f9fa',
                    borderRadius: '15px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e9ecef'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: '#393d3f'
                      }}>
                        {request.email}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        marginTop: '5px'
                      }}>
                        תאריך בקשה: {new Date(request.created_at).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleApprove(request.email)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#218838'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#28a745'
                        }}
                      >
                        ✓ אשר
                      </button>
                      <button
                        onClick={() => handleReject(request.email)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#c82333'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#dc3545'
                        }}
                      >
                        ✗ דחה
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approved Emails Tab */}
        {activeTab === 'approved' && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#393d3f',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              משתמשים מאושרים
            </h2>

            {/* Add New Email Section */}
            <div style={{
              background: '#f0f8ff',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              border: '2px dashed #62929e'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#393d3f',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                הוסף אימייל חדש לרשימת המאושרים
              </h3>
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="הזן כתובת אימייל"
                  disabled={isAddingEmail}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '25px',
                    border: '2px solid #62929e',
                    fontSize: '16px',
                    width: '300px',
                    textAlign: 'center',
                    outline: 'none',
                    background: isAddingEmail ? '#f5f5f5' : 'white',
                    color: isAddingEmail ? '#999' : '#393d3f'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAddingEmail) {
                      handleAddNewEmail()
                    }
                  }}
                />
                <button
                  onClick={handleAddNewEmail}
                  disabled={isAddingEmail || !newEmail.trim()}
                  style={{
                    background: (!newEmail.trim() || isAddingEmail) ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    cursor: (!newEmail.trim() || isAddingEmail) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAddingEmail && newEmail.trim()) {
                      e.currentTarget.style.background = '#218838'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAddingEmail && newEmail.trim()) {
                      e.currentTarget.style.background = '#28a745'
                    }
                  }}
                >
                  {isAddingEmail ? 'מוסיף...' : '+ הוסף'}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {approvedEmails.map((email) => (
                <div key={email.email} style={{
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '15px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #e9ecef'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: '#393d3f'
                    }}>
                      {email.email}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      marginTop: '3px'
                    }}>
                      אושר ב: {new Date(email.approved_at).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      background: '#28a745',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      מאושר
                    </div>
                    {/* Only show revoke button for non-admin users */}
                    {email.email !== 'tal.gurevich@gmail.com' && (
                      <button
                        onClick={() => handleRevokeApproval(email.email)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '15px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#c82333'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#dc3545'
                        }}
                      >
                        ✗ בטל אישור
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}