'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import SignatureCanvas from '../../components/SignatureCanvas';

export default function SignPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState(null);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [signerName, setSignerName] = useState('');
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProposal();
  }, [params.id]);

  const loadProposal = async () => {
    try {
      // Load proposal data
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposal')
        .select(`
          id, 
          proposal_number, 
          customer_id, 
          payment_terms, 
          notes, 
          subtotal, 
          discount_value, 
          include_discount_row, 
          vat_rate, 
          vat_amount, 
          total, 
          created_at, 
          delivery_date,
          signature_status,
          signature_data,
          signature_timestamp,
          signer_name,
          customer:customer (name, phone, email, address)
        `)
        .eq('id', params.id)
        .maybeSingle();

      if (proposalError) throw proposalError;
      if (!proposalData) {
        setError('הצעת מחיר לא נמצאה');
        setLoading(false);
        return;
      }

      // Check if already signed
      if (proposalData.signature_status === 'signed') {
        setSigned(true);
      }

      setProposal(proposalData);

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('proposal_item')
        .select('*')
        .eq('proposal_id', params.id)
        .order('id', { ascending: true });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('business_name, business_email, business_phone, business_address, business_license, logo_url')
        .limit(1)
        .maybeSingle();

      setSettings(settingsData || {});

    } catch (err) {
      console.error('Error loading proposal:', err);
      setError('שגיאה בטעינת הצעת המחיר');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signatureData || !signerName.trim()) {
      alert('אנא הזן שם וחתום על המסמך');
      return;
    }

    setSigning(true);
    try {
      const { error } = await supabase
        .from('proposal')
        .update({
          signature_data: signatureData,
          signature_timestamp: new Date().toISOString(),
          signature_status: 'signed',
          signer_name: signerName,
          status: 'accepted' // Also mark as accepted
        })
        .eq('id', params.id);

      if (error) throw error;

      setSigned(true);
      alert('המסמך נחתם בהצלחה!');
    } catch (err) {
      console.error('Error saving signature:', err);
      alert('שגיאה בשמירת החתימה');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <div style={{ fontSize: '18px', color: '#666' }}>טוען הצעת מחיר...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '18px', color: '#dc3545' }}>{error}</div>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            background: '#ffdc33',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          חזור לדף הבית
        </button>
      </div>
    );
  }

  if (signed) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '60px',
            marginBottom: '20px'
          }}>
            ✅
          </div>
          <h2 style={{
            fontSize: '24px',
            color: '#28a745',
            marginBottom: '15px'
          }}>
            המסמך נחתם בהצלחה!
          </h2>
          {proposal.signature_timestamp && (
            <p style={{ color: '#666' }}>
              נחתם על ידי: {proposal.signer_name || 'לא צוין'}<br />
              בתאריך: {new Date(proposal.signature_timestamp).toLocaleString('he-IL')}
            </p>
          )}
          <button
            onClick={() => router.push(`/quote/${params.id}`)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#ffdc33',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            צפה בהצעה החתומה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ffdc33',
            margin: 0
          }}>
            חתימה על הצעת מחיר #{proposal?.proposal_number}
          </h1>
          {proposal?.customer?.name && (
            <p style={{
              marginTop: '10px',
              color: '#666',
              fontSize: '16px'
            }}>
              עבור: {proposal.customer.name}
            </p>
          )}
        </div>

        {/* Quote Preview */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '20px',
            borderBottom: '2px solid #ffdc33',
            paddingBottom: '10px'
          }}>
            פרטי ההצעה
          </h3>

          {/* Business Info */}
          {(settings.business_name || settings.logo_url) && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              {settings.logo_url && (
                <img 
                  src={settings.logo_url} 
                  alt="לוגו העסק" 
                  style={{ 
                    height: '40px', 
                    width: 'auto', 
                    maxWidth: '120px', 
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              )}
              <div>
                {settings.business_name && <div><strong>{settings.business_name}</strong></div>}
                {settings.business_email && <div>📧 {settings.business_email}</div>}
                {settings.business_phone && <div>📞 {settings.business_phone}</div>}
                {settings.business_address && <div>📍 {settings.business_address}</div>}
                {settings.business_license && <div>🏢 עוסק מורשה: {settings.business_license}</div>}
              </div>
            </div>
          )}

          {/* Items Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px'
          }}>
            <thead>
              <tr style={{
                background: '#ffdc33',
                color: 'black'
              }}>
                <th style={{ padding: '10px', textAlign: 'right' }}>תיאור</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>כמות</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>מחיר</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>סה"כ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <td style={{ padding: '10px' }}>{item.description}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>₪{item.unit_price}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>₪{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{
            textAlign: 'left',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {proposal?.discount_value > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <span>הנחה: </span>
                <strong>₪{proposal.discount_value}</strong>
              </div>
            )}
            {proposal?.vat_amount > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <span>מע"מ: </span>
                <strong>₪{proposal.vat_amount}</strong>
              </div>
            )}
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ffdc33',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '2px solid #e9ecef'
            }}>
              <span>סה"כ לתשלום: </span>
              <span>₪{proposal?.total}</span>
            </div>
          </div>

          {/* Terms */}
          {(proposal?.payment_terms || proposal?.notes) && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#fff9e6',
              borderRadius: '8px',
              border: '1px solid #ffdc33'
            }}>
              {proposal.payment_terms && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>תנאי תשלום:</strong> {proposal.payment_terms}
                </div>
              )}
              {proposal.notes && (
                <div>
                  <strong>הערות:</strong> {proposal.notes}
                </div>
              )}
            </div>
          )}

          {/* Validity Note */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            ⏰ הצעה זו בתוקף ל-30 יום מתאריך היצירה
          </div>
        </div>

        {/* Signature Section */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '20px'
          }}>
            אישור וחתימה
          </h3>

          {/* Signer Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              שם החותם:
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="הזן את שמך המלא"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Signature Canvas */}
          <SignatureCanvas onSignatureChange={setSignatureData} />

          {/* Agreement Text */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                style={{
                  marginTop: '3px',
                  width: '18px',
                  height: '18px'
                }}
              />
              <span>
                אני מאשר/ת כי קראתי והבנתי את תוכן הצעת המחיר ומסכים/ה לתנאים המפורטים בה.
                החתימה הדיגיטלית שלי מהווה אישור מחייב להזמנה.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div style={{
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <button
              onClick={handleSign}
              disabled={signing || !signatureData || !signerName.trim()}
              style={{
                padding: '15px 40px',
                background: signing || !signatureData || !signerName.trim() ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: signing || !signatureData || !signerName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {signing ? 'שומר חתימה...' : 'אשר וחתום'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}