'use client';

export default function Health() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <main dir="rtl" style={{ padding: 24, fontFamily: 'system-ui, Arial' }}>
      <h1>בדיקת ENV</h1>
      <ul style={{ lineHeight: 1.8 }}>
        <li>NEXT_PUBLIC_SUPABASE_URL: <b style={{ color: hasUrl ? 'green' : 'red' }}>{hasUrl ? 'OK' : 'MISSING'}</b></li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: <b style={{ color: hasKey ? 'green' : 'red' }}>{hasKey ? 'OK' : 'MISSING'}</b></li>
      </ul>
    </main>
  );
}
