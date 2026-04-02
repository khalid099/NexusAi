'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProfile } from '@/lib/types';
import { buildWorkspacePath, clearAuthSession, createGuestSession, hasGuestSession, readAccessToken, readStoredUser } from '@/lib/auth';
import Nav from '@/components/Nav';
import Toast from '@/components/Toast';
import LandingPage from '@/components/LandingPage';

export default function LandingClient() {
  const router = useRouter();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());

  const [toast, setToast] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user, setUser] = useState<AuthProfile | null>(initialUser);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const openApp = useCallback((tab: 'chat' | 'marketplace' | 'agents' | 'research' = 'chat', query = '') => {
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
    setIsAuthenticated(false);
    setUser(null);
    showToast('Signed out successfully');
    router.push('/signin');
  }, [router, showToast]);

  return (
    <>
      <Nav
        activeView="landing"
        onNavigate={() => router.push('/landing')}
        onOpenApp={openApp}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
      />

      <LandingPage
        onLaunch={(query) => openApp('chat', query)}
        onSelectModel={() => router.push(buildWorkspacePath('chat'))}
        onOpenModal={() => router.push(buildWorkspacePath('marketplace'))}
        onToast={showToast}
      />

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  );
}
