'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveAuthSession, apiRequest, updateStoredUser } from '@/lib/auth';
import type { AuthProfile } from '@/lib/types';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      router.replace('/?auth=signin&error=oauth_failed');
      return;
    }

    saveAuthSession({ accessToken, refreshToken });

    // Fetch user profile then redirect
    apiRequest<AuthProfile>('/users/me')
      .then((profile) => {
        updateStoredUser(profile);
        router.replace('/workspace/chat');
      })
      .catch(() => {
        // Profile fetch failed but tokens are saved — redirect anyway
        router.replace('/workspace/chat');
      });
  }, [router, searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f2ee',
      fontFamily: "'Instrument Sans', sans-serif",
    }}>
      <div style={{ textAlign: 'center', color: '#5a5750' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #c8622a',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 16px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Signing you in…</p>
      </div>
    </div>
  );
}
