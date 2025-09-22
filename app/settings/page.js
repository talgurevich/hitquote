'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import HamburgerMenu from '../components/HamburgerMenu';
import { supabase } from '../../lib/supabaseClient';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    business_license: '',
    logo_url: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/');
      return;
    }
    loadSettings();
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('business_name, business_email, business_phone, business_address, business_license, logo_url')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('שגיאה בטעינת ההגדרות');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('גודל הקובץ חייב להיות פחות מ-5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('נא להעלות קובץ תמונה בלבד');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;

    try {
      // Convert file to base64 for simple storage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(logoFile);
      });
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw new Error('שגיאה בהעלאת הלוגו');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let logoUrl = settings.logo_url;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const updatedSettings = {
        ...settings,
        logo_url: logoUrl
      };

      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let result;
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('settings')
          .update(updatedSettings)
          .eq('id', existingSettings.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('settings')
          .insert([updatedSettings]);
      }

      if (result.error) throw result.error;

      setSettings(updatedSettings);
      setLogoFile(null);
      setSuccess('ההגדרות נשמרו בהצלחה!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('שגיאה בשמירת ההגדרות: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        טוען הגדרות...
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
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              marginBottom: '10px'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffdc33',
                margin: 0
              }}>
                ⚙️ הגדרות מערכת
              </h1>
            </div>
            
            <p style={{
              color: '#666',
              margin: 0,
              fontSize: '16px'
            }}>
              נהל את הגדרות העסק והלוגו שלך
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              color: '#c33'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#efe',
              border: '1px solid #cfc',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              color: '#3c3'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Settings Form */}
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
              marginBottom: '30px',
              borderBottom: '2px solid #ffdc33',
              paddingBottom: '10px'
            }}>
              פרטי העסק
            </h2>

            <div style={{
              display: 'grid',
              gap: '25px'
            }}>
              {/* Business Name */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  שם העסק:
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={settings.business_name}
                  onChange={handleInputChange}
                  placeholder="הזן את שם העסק"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Business Email */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  אימייל העסק:
                </label>
                <input
                  type="email"
                  name="business_email"
                  value={settings.business_email}
                  onChange={handleInputChange}
                  placeholder="business@example.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Business Phone */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  טלפון העסק:
                </label>
                <input
                  type="tel"
                  name="business_phone"
                  value={settings.business_phone}
                  onChange={handleInputChange}
                  placeholder="050-1234567"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Business Address */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  כתובת העסק:
                </label>
                <input
                  type="text"
                  name="business_address"
                  value={settings.business_address}
                  onChange={handleInputChange}
                  placeholder="רחוב 123, עיר, מיקוד"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Business License */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  עוסק מורשה:
                </label>
                <input
                  type="text"
                  name="business_license"
                  value={settings.business_license}
                  onChange={handleInputChange}
                  placeholder="מספר עוסק מורשה"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  לוגו העסק:
                </label>
                
                {logoPreview && (
                  <div style={{
                    marginBottom: '15px',
                    padding: '15px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    background: '#f8f9fa',
                    textAlign: 'center'
                  }}>
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '100px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '5px',
                  margin: '5px 0 0 0'
                }}>
                  קבצי תמונה בלבד, עד 5MB. מומלץ רזולוציה של 200x100 פיקסלים
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div style={{
              marginTop: '40px',
              textAlign: 'center'
            }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '15px 40px',
                  background: saving ? '#ccc' : '#ffdc33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(255, 220, 51, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.background = '#e6c52d';
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.target.style.background = '#ffdc33';
                }}
              >
                {saving ? 'שומר...' : 'שמור הגדרות'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}