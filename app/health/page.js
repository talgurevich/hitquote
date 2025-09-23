'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HamburgerMenu from '../components/HamburgerMenu';
import { supabase } from '../../lib/supabaseClient';

export default function Health() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState({
    envVars: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    database: { connected: false, responseTime: null },
    api: { status: 'checking', responseTime: null },
    system: { uptime: null, timestamp: new Date().toISOString() }
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/');
      return;
    }
    runHealthChecks();
  };

  const runHealthChecks = async () => {
    setLoading(true);
    
    // Test database connectivity
    const dbStart = Date.now();
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('id')
        .limit(1);
      
      const dbTime = Date.now() - dbStart;
      setChecks(prev => ({
        ...prev,
        database: { 
          connected: !error, 
          responseTime: dbTime,
          error: error?.message
        }
      }));
    } catch (err) {
      setChecks(prev => ({
        ...prev,
        database: { 
          connected: false, 
          responseTime: null,
          error: err.message
        }
      }));
    }

    // System info
    setChecks(prev => ({
      ...prev,
      system: {
        uptime: process.uptime ? Math.floor(process.uptime()) : null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      },
      api: {
        status: 'healthy',
        responseTime: Date.now() - dbStart
      }
    }));

    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === true || status === 'healthy') return '#28a745';
    if (status === false || status === 'error') return '#dc3545';
    return '#ffc107';
  };

  const getStatusText = (status) => {
    if (status === true) return 'תקין';
    if (status === false) return 'כשל';
    if (status === 'healthy') return 'תקין';
    if (status === 'checking') return 'בבדיקה';
    return 'לא ידוע';
  };

  if (loading) {
    return (
      <>
        <HamburgerMenu />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          color: '#666',
          fontSize: '18px',
          padding: '20px 20px 20px 80px'
        }}>
          מריץ בדיקות מערכת...
        </div>
      </>
    );
  }

  return (
    <>
      <HamburgerMenu />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px 20px 20px 80px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
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
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#ffdc33',
              margin: '0 0 15px 0'
            }}>
              בדיקת מערכת
            </h1>
            <p style={{
              color: '#666',
              margin: 0,
              fontSize: '16px'
            }}>
              סטטוס ובריאות המערכת
            </p>
            <button
              onClick={runHealthChecks}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#ffdc33',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e6c52d'}
              onMouseLeave={(e) => e.target.style.background = '#ffdc33'}
            >
              🔄 רענן בדיקות
            </button>
          </div>

          {/* Environment Variables */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 20px 0',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              🔧 משתני סביבה
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ fontWeight: '500' }}>NEXT_PUBLIC_SUPABASE_URL</span>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: getStatusColor(checks.envVars.supabaseUrl),
                  color: 'white'
                }}>
                  {getStatusText(checks.envVars.supabaseUrl)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ fontWeight: '500' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: getStatusColor(checks.envVars.supabaseKey),
                  color: 'white'
                }}>
                  {getStatusText(checks.envVars.supabaseKey)}
                </span>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 20px 0',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              🗄️ מסד נתונים
            </h2>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: '500', marginBottom: '5px' }}>חיבור Supabase</div>
                {checks.database.responseTime && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    זמן תגובה: {checks.database.responseTime}ms
                  </div>
                )}
                {checks.database.error && (
                  <div style={{ fontSize: '12px', color: '#dc3545' }}>
                    שגיאה: {checks.database.error}
                  </div>
                )}
              </div>
              <span style={{
                padding: '5px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: getStatusColor(checks.database.connected),
                color: 'white'
              }}>
                {getStatusText(checks.database.connected)}
              </span>
            </div>
          </div>

          {/* API Status */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 20px 0',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              🌐 API
            </h2>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: '500', marginBottom: '5px' }}>Next.js API</div>
                {checks.api.responseTime && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    זמן תגובה: {checks.api.responseTime}ms
                  </div>
                )}
              </div>
              <span style={{
                padding: '5px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: getStatusColor(checks.api.status),
                color: 'white'
              }}>
                {getStatusText(checks.api.status)}
              </span>
            </div>
          </div>

          {/* System Info */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 20px 0',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              📊 מידע מערכת
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '5px' }}>זמן בדיקה אחרונה</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {new Date(checks.system.timestamp).toLocaleString('he-IL')}
                </div>
              </div>
              <div style={{
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '5px' }}>דפדפן</div>
                <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                  {checks.system.userAgent}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
