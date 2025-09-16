'use client';

export default function Health() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <main dir="rtl" style={{ 
      padding: 24, 
      fontFamily: 'system-ui, Arial',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <h1 style={{ color: '#3a3a3a' }}>בדיקת ENV</h1>
      <ul style={{ lineHeight: 1.8 }}>
        <li>NEXT_PUBLIC_SUPABASE_URL: <b style={{ color: hasUrl ? '#0170B9' : '#4B4F58' }}>{hasUrl ? 'OK' : 'MISSING'}</b></li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: <b style={{ color: hasKey ? '#0170B9' : '#4B4F58' }}>{hasKey ? 'OK' : 'MISSING'}</b></li>
      </ul>
    </main>
  );
}
