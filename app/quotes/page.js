'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function QuotesList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) throw new Error('Supabase לא זמין בדפדפן');
        const { data, error } = await supabase
          .from('proposal')
          .select('id, proposal_number, created_at, total')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRows(data || []);
      } catch (e) {
        setErr(e.message || String(e));
      }
    };
    load();
  }, []);

  return (
    <main dir="rtl" style={{ maxWidth: 900, margin:'0 auto', padding:16, fontFamily:'system-ui, Arial' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <h1 style={{ margin:0 }}>רשימת הצעות</h1>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/catalog" style={{ padding:'8px 12px', border:'1px solid #ddd', borderRadius:8, textDecoration:'none' }}>
            📦 ניהול קטלוג
          </Link>
          <Link href="/new" style={{ padding:'8px 12px', border:'1px solid #ddd', borderRadius:8, textDecoration:'none' }}>
            הצעה חדשה
          </Link>
        </div>
      </div>

      {err && <div style={{ background:'#ffe8e8', border:'1px solid #f5b5b5', padding:8, borderRadius:8, marginBottom:8 }}>שגיאה: {err}</div>}

      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign:'right', borderBottom:'1px solid #ddd', padding:8 }}>מס׳ הצעה</th>
            <th style={{ textAlign:'right', borderBottom:'1px solid #ddd', padding:8 }}>תאריך</th>
            <th style={{ textAlign:'left', borderBottom:'1px solid #ddd', padding:8 }}>סה״כ (₪)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ borderBottom:'1px solid #f2f2f2', padding:8 }}>
                <Link href={`/quote/${r.id}`} style={{ textDecoration:'none', fontWeight:700 }}>
                  {r.proposal_number || r.id.slice(0,8)}
                </Link>
              </td>
              <td style={{ borderBottom:'1px solid #f2f2f2', padding:8 }}>
                {new Date(r.created_at).toLocaleString('he-IL')}
              </td>
              <td style={{ borderBottom:'1px solid #f2f2f2', padding:8, textAlign:'left' }}>
                {Number(r.total || 0).toFixed(2)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={3} style={{ padding:12, color:'#666' }}>אין הצעות להצגה.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
