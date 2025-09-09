'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function CatalogUpload() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [csvText, setCsvText] = useState('');
  const [deleteExisting, setDeleteExisting] = useState(false);

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

  return (
    <main dir="rtl" style={{ maxWidth: 1200, margin: '0 auto', padding: 16, fontFamily: 'system-ui, Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>ניהול קטלוג מוצרים</h1>
        <Link href="/quotes" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, textDecoration: 'none' }}>
          חזרה להצעות
        </Link>
      </div>

      {message && (
        <div style={{ 
          padding: 12, 
          marginBottom: 20, 
          borderRadius: 8, 
          background: message.includes('✅') ? '#d4f4dd' : message.includes('❌') ? '#ffe8e8' : '#e8f4ff',
          border: `1px solid ${message.includes('✅') ? '#52c41a' : message.includes('❌') ? '#ff4d4f' : '#1890ff'}`
        }}>
          {message}
        </div>
      )}

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
              background: uploading ? '#ccc' : '#52c41a',
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
    </main>
  );
}