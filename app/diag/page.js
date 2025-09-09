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
    <main dir="rtl" style={{ padding: 16, fontFamily: 'system-ui, Arial' }}>
      <h1>בדיקת דיאגנוסטיקה</h1>
      <div>ENV URL: <b style={{ color: envOk.url ? 'green' : 'red' }}>{envOk.url ? 'OK' : 'MISSING'}</b></div>
      <div>ENV KEY: <b style={{ color: envOk.key ? 'green' : 'red' }}>{envOk.key ? 'OK' : 'MISSING'}</b></div>
      <hr />
      {err && <div style={{ color: 'red' }}>שגיאה: {err}</div>}
      <div>לקוחות (customer): <b>{counts.customers ?? '—'}</b></div>
      <div>מוצרים (product): <b>{counts.products ?? '—'}</b></div>
      <div>הגדרות (settings): <b>{counts.settings ?? '—'}</b></div>
    </main>
  );
}
