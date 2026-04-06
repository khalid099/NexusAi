'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildWorkspacePath, clearAuthSession, createGuestSession, readAccessToken, readStoredUser } from '@/lib/auth';
import AuthModal from '@/components/auth/AuthModal';
import type { AuthProfile, Model } from '@/lib/types';
import Nav from '@/components/layout/Nav';
import Toast from '@/components/ui/Toast';
import Marketplace from '@/components/marketplace/Marketplace';
import ModelModal from '@/components/marketplace/ModelModal';

export default function MarketplaceClient() {
  const router = useRouter();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());

  const [toast, setToast] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user, setUser] = useState<AuthProfile | null>(initialUser);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);
  const [modalModelId, setModalModelId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState('overview');

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleSignOut = useCallback(() => {
    clearAuthSession();
    const guest = createGuestSession();
    setIsAuthenticated(false);
    setUser(guest);
    router.push(buildWorkspacePath('chat'));
  }, [router]);

  const openModal = useCallback((modelId: string, tab = 'overview') => {
    setModalModelId(modelId);
    setModalTab(tab);
  }, []);

  const selectModel = useCallback((model: Model) => {
    router.push(`/chat?model=${model.id}`);
  }, [router]);

  return (
    <>
      <Nav
        activeView="app"
        activeTab="marketplace"
        onNavigate={() => router.push('/')}
        onOpenApp={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onTabChange={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
        onOpenAuthModal={setAuthMode}
      />

      <Marketplace
        onSelectModel={selectModel}
        onOpenModal={openModal}
        onToast={showToast}
      />

      {modalModelId && (
        <ModelModal
          modelId={modalModelId}
          defaultTab={modalTab}
          onClose={() => setModalModelId(null)}
          onChat={(id) => { router.push(`/chat?model=${id}`); }}
          onToast={showToast}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          nextPath="/marketplace"
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
