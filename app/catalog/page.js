'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function CatalogUpload() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [csvText, setCsvText] = useState('');
  const [deleteExisting, setDeleteExisting] = useState(false);
  
  // Online editor state
  const [existingProducts, setExistingProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showOnlineEditor, setShowOnlineEditor] = useState(false);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const item = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      items.push(item);
    }
    return items;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setCsvText(text);
        try {
          const parsed = parseCSV(text);
          setProducts(parsed);
          setMessage(`נטענו ${parsed.length} מוצרים מהקובץ. בדוק את הנתונים ולחץ "העלה לבסיס נתונים"`);
        } catch (err) {
          setMessage('שגיאה בקריאת הקובץ: ' + err.message);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleTextPaste = (e) => {
    const text = e.target.value;
    setCsvText(text);
    if (text.trim()) {
      try {
        const parsed = parseCSV(text);
        setProducts(parsed);
        setMessage(`נטענו ${parsed.length} מוצרים. בדוק את הנתונים ולחץ "העלה לבסיס נתונים"`);
      } catch (err) {
        setMessage('שגיאה בפענוח הנתונים: ' + err.message);
      }
    }
  };

  const uploadToDatabase = async () => {
    if (!supabase) {
      setMessage('שגיאה: Supabase לא זמין');
      return;
    }

    setUploading(true);
    setMessage('מעלה...');

    try {
      // Delete existing products if requested
      if (deleteExisting) {
        const { error: deleteError } = await supabase
          .from('product')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        
        if (deleteError) throw deleteError;
        setMessage('המוצרים הקיימים נמחקו. מוסיף מוצרים חדשים...');
      }

      // Prepare products for insertion
      const productsToInsert = products.map(p => ({
        category: p.category || null,
        name: p.name || 'מוצר ללא שם',
        unit_label: p.unit_label || null,
        base_price: parseFloat(p.base_price) || 0,
        notes: p.notes || null,
        options: p.options || null
      }));

      // Insert products
      const { data, error } = await supabase
        .from('product')
        .insert(productsToInsert);

      if (error) throw error;

      setMessage(`✅ ${products.length} מוצרים הועלו בהצלחה!`);
      setProducts([]);
      setCsvText('');
    } catch (err) {
      setMessage('❌ שגיאה בהעלאה: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `category,name,unit_label,base_price,notes,options
שירותים,ייעוץ טכני,שעה,500,כולל נסיעות,
שירותים,פיתוח תוכנה,שעה,400,,Frontend|Backend|Full Stack
מוצרים,מחשב נייד,יחידה,5000,אחריות שנה,Dell|HP|Lenovo
מוצרים,מסך מחשב,יחידה,1500,24 אינץ׳,
שירותים,תמיכה טכנית,חודש,2000,תמיכה מרחוק,בסיסי|מתקדם|פרימיום`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'catalog-template.csv';
    link.click();
  };

  // Online editor functions
  const loadExistingProducts = async () => {
    if (!supabase) {
      setMessage('שגיאה: Supabase לא זמין');
      return;
    }

    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setExistingProducts(data || []);
    } catch (err) {
      setMessage('❌ שגיאה בטעינת המוצרים: ' + err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const saveProduct = async (product) => {
    if (!supabase) {
      setMessage('שגיאה: Supabase לא זמין');
      return;
    }

    try {
      const productData = {
        category: product.category || null,
        name: product.name || 'מוצר ללא שם',
        unit_label: product.unit_label || null,
        base_price: parseFloat(product.base_price) || 0,
        notes: product.notes || null,
        options: product.options || null
      };

      if (product.id) {
        // Update existing product
        const { error } = await supabase
          .from('product')
          .update(productData)
          .eq('id', product.id);
        
        if (error) throw error;
        setMessage('✅ המוצר עודכן בהצלחה!');
      } else {
        // Create new product
        const { error } = await supabase
          .from('product')
          .insert([productData]);
        
        if (error) throw error;
        setMessage('✅ המוצר נוסף בהצלחה!');
      }

      setEditingProduct(null);
      loadExistingProducts(); // Reload products
    } catch (err) {
      setMessage('❌ שגיאה בשמירה: ' + err.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!supabase) {
      setMessage('שגיאה: Supabase לא זמין');
      return;
    }

    if (!confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('product')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      setMessage('✅ המוצר נמחק בהצלחה!');
      loadExistingProducts(); // Reload products
    } catch (err) {
      setMessage('❌ שגיאה במחיקה: ' + err.message);
    }
  };

  useEffect(() => {
    if (showOnlineEditor) {
      loadExistingProducts();
    }
  }, [showOnlineEditor]);

  return (
    <main dir="rtl" style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 16, 
      fontFamily: 'system-ui, Arial',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>ניהול קטלוג מוצרים</h1>
        <Link href="/quotes" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, textDecoration: 'none' }}>
          חזרה להצעות
        </Link>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: 30, borderBottom: '2px solid #f0f0f0' }}>
        <button
          onClick={() => setShowOnlineEditor(false)}
          style={{
            padding: '10px 20px',
            background: !showOnlineEditor ? '#0170B9' : 'transparent',
            color: !showOnlineEditor ? 'white' : '#0170B9',
            border: 'none',
            borderBottom: !showOnlineEditor ? '3px solid #0170B9' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📂 העלאת CSV
        </button>
        <button
          onClick={() => setShowOnlineEditor(true)}
          style={{
            padding: '10px 20px',
            background: showOnlineEditor ? '#0170B9' : 'transparent',
            color: showOnlineEditor ? 'white' : '#0170B9',
            border: 'none',
            borderBottom: showOnlineEditor ? '3px solid #0170B9' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✏️ עריכה אונליין
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: 12, 
          marginBottom: 20, 
          borderRadius: 8, 
          background: message.includes('✅') ? '#e8f4ff' : message.includes('❌') ? '#f8f9fa' : '#e8f4ff',
          border: `1px solid ${message.includes('✅') ? '#0170B9' : message.includes('❌') ? '#4B4F58' : '#0170B9'}`
        }}>
          {message}
        </div>
      )}

      {!showOnlineEditor ? (
        // CSV Upload Section
        <div>
          <section style={{ marginBottom: 30 }}>
            <h2>שלב 1: הורד תבנית CSV</h2>
        <p>הורד את התבנית וערוך אותה ב-Excel או Google Sheets</p>
        <button onClick={downloadTemplate} style={{ padding: '10px 20px', fontWeight: 700, marginTop: 10 }}>
          📥 הורד תבנית CSV
        </button>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>שלב 2: העלה קובץ CSV או הדבק נתונים</h2>
        
        <div style={{ marginBottom: 20 }}>
          <h3>אפשרות א׳: העלה קובץ CSV</h3>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload}
            style={{ padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3>אפשרות ב׳: הדבק נתוני CSV</h3>
          <textarea
            value={csvText}
            onChange={handleTextPaste}
            placeholder="הדבק כאן את תוכן ה-CSV (כולל שורת הכותרות)"
            style={{ 
              width: '100%', 
              height: 200, 
              padding: 10, 
              borderRadius: 8, 
              border: '1px solid #ddd',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input 
              type="checkbox" 
              checked={deleteExisting}
              onChange={(e) => setDeleteExisting(e.target.checked)}
            />
            <span>מחק את כל המוצרים הקיימים לפני ההעלאה</span>
          </label>
        </div>
      </section>

      {products.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <h2>שלב 3: תצוגה מקדימה ({products.length} מוצרים)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: 8 }}>קטגוריה</th>
                  <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: 8 }}>שם מוצר</th>
                  <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: 8 }}>יחידה</th>
                  <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: 8 }}>מחיר</th>
                  <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: 8 }}>הערות</th>
                  <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: 8 }}>אפשרויות</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 10).map((p, i) => (
                  <tr key={i}>
                    <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8 }}>{p.category || '-'}</td>
                    <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8, fontWeight: 700 }}>{p.name}</td>
                    <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8 }}>{p.unit_label || '-'}</td>
                    <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8 }}>₪{parseFloat(p.base_price || 0).toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8 }}>{p.notes || '-'}</td>
                    <td style={{ borderBottom: '1px solid #f2f2f2', padding: 8 }}>{p.options || '-'}</td>
                  </tr>
                ))}
                {products.length > 10 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 12, textAlign: 'center', color: '#666' }}>
                      ... ועוד {products.length - 10} מוצרים
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button 
            onClick={uploadToDatabase} 
            disabled={uploading}
            style={{ 
              padding: '12px 24px', 
              fontWeight: 700, 
              fontSize: 16,
              background: uploading ? '#ccc' : '#0170B9',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? '⏳ מעלה...' : '📤 העלה לבסיס נתונים'}
          </button>
        </section>
      )}

          <section style={{ marginTop: 40, padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
            <h3>הוראות:</h3>
            <ol>
              <li>הורד את תבנית ה-CSV</li>
              <li>פתח את הקובץ ב-Excel או Google Sheets</li>
              <li>ערוך את המוצרים שלך (אל תשנה את שורת הכותרות)</li>
              <li>שמור כ-CSV (UTF-8)</li>
              <li>העלה את הקובץ או הדבק את התוכן</li>
              <li>בדוק את התצוגה המקדימה</li>
              <li>לחץ על "העלה לבסיס נתונים"</li>
            </ol>
            
            <h3 style={{ marginTop: 20 }}>שדות:</h3>
            <ul>
              <li><b>category</b> - קטגוריה (לדוגמה: שירותים, מוצרים)</li>
              <li><b>name</b> - שם המוצר (חובה)</li>
              <li><b>unit_label</b> - יחידת מידה (לדוגמה: שעה, יחידה, חודש)</li>
              <li><b>base_price</b> - מחיר בסיס (מספר)</li>
              <li><b>notes</b> - הערות</li>
              <li><b>options</b> - אפשרויות מופרדות ב-| (לדוגמה: קטן|בינוני|גדול)</li>
            </ul>
          </section>
        </div>
      ) : (
        // Online Editor Section
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>עריכה אונליין של המוצרים הקיימים</h2>
            <button
              onClick={() => setEditingProduct({ category: '', name: '', unit_label: '', base_price: '', notes: '', options: '' })}
              style={{
                padding: '10px 20px',
                background: '#0170B9',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ➕ הוסף מוצר חדש
            </button>
          </div>

          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              ⏳ טוען מוצרים...
            </div>
          ) : (
            <div>
              {existingProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#f9f9f9', borderRadius: 8, color: '#666' }}>
                  אין מוצרים במערכת. הוסף מוצר ראשון או העלה CSV.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {existingProducts.map((product) => (
                    <div key={product.id} style={{
                      background: 'white',
                      border: '1px solid #e8e8e8',
                      borderRadius: 8,
                      padding: 20,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr auto',
                      gap: 15,
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>{product.name}</div>
                        <div style={{ color: '#666', fontSize: 14 }}>{product.category || 'ללא קטגוריה'}</div>
                      </div>
                      <div style={{ fontSize: 14 }}>
                        <div><strong>יחידה:</strong> {product.unit_label || '-'}</div>
                        <div><strong>מחיר:</strong> ₪{parseFloat(product.base_price || 0).toFixed(2)}</div>
                      </div>
                      <div style={{ fontSize: 14 }}>
                        <div><strong>הערות:</strong> {product.notes || '-'}</div>
                        <div><strong>אפשרויות:</strong> {product.options || '-'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setEditingProduct(product)}
                          style={{
                            padding: '6px 12px',
                            background: '#0170B9',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          ✏️ ערוך
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#4B4F58',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          🗑️ מחק
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Product Modal */}
          {editingProduct && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 30,
                maxWidth: 500,
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
              }}>
                <h3 style={{ marginBottom: 20 }}>
                  {editingProduct.id ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
                </h3>
                
                <div style={{ display: 'grid', gap: 15 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>שם המוצר *</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14
                      }}
                      placeholder="שם המוצר"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>קטגוריה</label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14
                      }}
                      placeholder="לדוגמה: שירותים, מוצרים"
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>יחידת מידה</label>
                      <input
                        type="text"
                        value={editingProduct.unit_label}
                        onChange={(e) => setEditingProduct({...editingProduct, unit_label: e.target.value})}
                        style={{
                          width: '100%',
                          padding: 10,
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          fontSize: 14
                        }}
                        placeholder="יחידה, שעה, חודש"
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>מחיר בסיס</label>
                      <input
                        type="number"
                        value={editingProduct.base_price}
                        onChange={(e) => setEditingProduct({...editingProduct, base_price: e.target.value})}
                        style={{
                          width: '100%',
                          padding: 10,
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          fontSize: 14
                        }}
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>הערות</label>
                    <textarea
                      value={editingProduct.notes}
                      onChange={(e) => setEditingProduct({...editingProduct, notes: e.target.value})}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14,
                        minHeight: 60
                      }}
                      placeholder="הערות נוספות"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>אפשרויות</label>
                    <input
                      type="text"
                      value={editingProduct.options}
                      onChange={(e) => setEditingProduct({...editingProduct, options: e.target.value})}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14
                      }}
                      placeholder="אפשרויות מופרדות ב-| לדוגמה: קטן|בינוני|גדול"
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setEditingProduct(null)}
                    style={{
                      padding: '10px 20px',
                      background: '#f5f5f5',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    ביטול
                  </button>
                  <button
                    onClick={() => saveProduct(editingProduct)}
                    disabled={!editingProduct.name.trim()}
                    style={{
                      padding: '10px 20px',
                      background: editingProduct.name.trim() ? '#0170B9' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: editingProduct.name.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    💾 שמור
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}