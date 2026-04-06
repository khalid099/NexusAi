'use client';
import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProfile } from '@/lib/types';
import { buildWorkspacePath, clearAuthSession, createGuestSession, hasGuestSession, readAccessToken, readStoredUser, sanitizeNextPath } from '@/lib/auth';
import AuthModal from '@/components/auth/AuthModal';
import Nav from '@/components/layout/Nav';
import Toast from '@/components/ui/Toast';
import LandingPage from '@/components/home/LandingPage';

export default function LandingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());
  const authQuery = searchParams.get('auth');
  const nextPath = sanitizeNextPath(searchParams.get('next'));

  const [toast, setToast] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user, setUser] = useState<AuthProfile | null>(initialUser);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(
    authQuery === 'signin' || authQuery === 'signup' ? authQuery : null
  );
  const [authNextPath, setAuthNextPath] = useState(nextPath);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const openApp = useCallback((tab: 'chat' | 'marketplace' | 'agents' | 'research' = 'chat', query = '') => {
    if (tab === 'agents' && (!isAuthenticated || hasGuestSession())) {
      setAuthNextPath(buildWorkspacePath('agents'));
      setAuthMode('signup');
      return;
    }

    const path = buildWorkspacePath(tab, query);
    if (isAuthenticated || hasGuestSession()) {
      router.push(path);
      return;
    }

    createGuestSession();
    router.push(path);
  }, [isAuthenticated, router]);

  const handleSignOut = useCallback(() => {
    clearAuthSession();
    const guest = createGuestSession();
    setIsAuthenticated(false);
    setUser(guest);
    showToast('Signed out successfully');
    router.push('/landing');
  }, [router, showToast]);

  return (
    <>
      <Nav
        activeView="landing"
        onNavigate={() => router.push('/')}
        onOpenApp={openApp}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
        onOpenAuthModal={(mode) => {
          setAuthNextPath('/landing');
          setAuthMode(mode);
        }}
      />

      <LandingPage
        onLaunch={(query) => openApp('chat', query)}
        onOpenAgents={() => openApp('agents')}
        onSelectModel={() => router.push(buildWorkspacePath('chat'))}
        onOpenModal={() => router.push(buildWorkspacePath('marketplace'))}
        onToast={showToast}
      />

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          nextPath={authNextPath}
          onClose={() => {
            setAuthMode(null);
            if (authQuery === 'signin' || authQuery === 'signup') {
              router.replace('/');
            }
          }}
          onSuccess={(profile) => {
            setUser(profile);
            setIsAuthenticated(true);
            setAuthMode(null);
            showToast('Signed in successfully');
            router.replace(authNextPath);
          }}
          onToast={showToast}
        />
      )}
    </>
  );
}
