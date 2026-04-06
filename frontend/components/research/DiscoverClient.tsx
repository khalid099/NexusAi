'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildWorkspacePath, clearAuthSession, createGuestSession, readAccessToken, readStoredUser } from '@/lib/auth';
import AuthModal from '@/components/auth/AuthModal';
import type { AuthProfile } from '@/lib/types';
import Nav from '@/components/layout/Nav';
import Toast from '@/components/ui/Toast';
import ResearchView from '@/components/research/ResearchView';

export default function DiscoverClient() {
  const router = useRouter();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());

  const [toast, setToast] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user, setUser] = useState<AuthProfile | null>(initialUser);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleSignOut = useCallback(() => {
    clearAuthSession();
    const guest = createGuestSession();
    setIsAuthenticated(false);
    setUser(guest);
    router.push(buildWorkspacePath('chat'));
  }, [router]);

  return (
    <>
      <Nav
        activeView="app"
        activeTab="research"
        onNavigate={() => router.push('/')}
        onOpenApp={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onTabChange={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
        onOpenAuthModal={setAuthMode}
      />

      <ResearchView
        onToast={showToast}
        onDiscuss={(prompt) => router.push(buildWorkspacePath('chat', prompt))}
      />

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          nextPath="/discover"
          onClose={() => setAuthMode(null)}
          onSuccess={(profile) => {
            setUser(profile);
            setIsAuthenticated(true);
            setAuthMode(null);
            showToast('Signed in successfully');
          }}
          onToast={showToast}
        />
      )}
    </>
  );
}
