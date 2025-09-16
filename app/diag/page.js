'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Diag() {
  const [envOk, setEnvOk] = useState({ url: false, key: false });
  const [counts, setCounts] = useState({ customers: null, products: null, settings: null });
  const [err, setErr] = useState(null);

  useEffect(() => {
    setEnvOk({
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    const run = async () => {
      try {
        if (!supabase) throw new Error('Supabase client missing');
        const [{ data: c, error: e1 }, { data: p, error: e2 }, { data: s, error: e3 }] = await Promise.all([
          supabase.from('customer').select('id', { count: 'exact', head: true }),
          supabase.from('product').select('id', { count: 'exact', head: true }),
          supabase.from('settings').select('id', { count: 'exact', head: true }),
        ]);
        if (e1) throw e1;
        if (e2) throw e2;
        if (e3) throw e3;

        setCounts({
          customers: c?.length ?? (c === null ? null : 0),
          products: p?.length ?? (p === null ? null : 0),
          settings: s?.length ?? (s === null ? null : 0),
        });
      } catch (error) {
        setErr(error.message || String(error));
      }
    };
    run();
  }, []);

  return (
    <main dir="rtl" style={{ 
      padding: 16, 
      fontFamily: 'system-ui, Arial',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <h1 style={{ color: '#3a3a3a' }}>בדיקת דיאגנוסטיקה</h1>
      <div style={{ color: '#3a3a3a' }}>ENV URL: <b style={{ color: envOk.url ? '#0170B9' : '#4B4F58' }}>{envOk.url ? 'OK' : 'MISSING'}</b></div>
      <div style={{ color: '#3a3a3a' }}>ENV KEY: <b style={{ color: envOk.key ? '#0170B9' : '#4B4F58' }}>{envOk.key ? 'OK' : 'MISSING'}</b></div>
      <hr />
      {err && <div style={{ color: '#4B4F58' }}>שגיאה: {err}</div>}
      <div style={{ color: '#3a3a3a' }}>לקוחות (customer): <b style={{ color: '#0170B9' }}>{counts.customers ?? '—'}</b></div>
      <div style={{ color: '#3a3a3a' }}>מוצרים (product): <b style={{ color: '#0170B9' }}>{counts.products ?? '—'}</b></div>
      <div style={{ color: '#3a3a3a' }}>הגדרות (settings): <b style={{ color: '#0170B9' }}>{counts.settings ?? '—'}</b></div>
    </main>
  );
}
