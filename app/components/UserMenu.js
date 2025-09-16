'use client';

import { useSession, signOut } from 'next-auth/react';

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {session.user.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%'
            }}
          />
        )}
        <div style={{ fontSize: '14px' }}>
          <div style={{ fontWeight: 'bold', color: '#333' }}>
            {session.user.name}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {session.user.email}
          </div>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#c82333';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#dc3545';
        }}
      >
        יציאה
      </button>
    </div>
  );
}