'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildWorkspacePath, clearAuthSession, createGuestSession, readAccessToken, readStoredUser } from '@/lib/auth';
import { MODELS } from '@/lib/mock-data';
import AuthModal from '@/components/auth/AuthModal';
import type { AuthProfile, Model } from '@/lib/types';
import Nav from '@/components/layout/Nav';
import Toast from '@/components/ui/Toast';
import ChatHub from '@/components/chat/ChatHub';
import ModelModal from '@/components/marketplace/ModelModal';

export default function ChatClient() {
  const router = useRouter();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());

  const [toast, setToast] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user, setUser] = useState<AuthProfile | null>(initialUser);
  const [models] = useState<Model[]>(MODELS);
  const [activeModel, setActiveModel] = useState<Model | null>(MODELS[0] ?? null);
  const [modalModelId, setModalModelId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState('overview');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);

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

  return (
    <>
      <Nav
        activeView="app"
        activeTab="chat"
        onNavigate={() => router.push('/')}
        onOpenApp={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onTabChange={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
        onOpenAuthModal={setAuthMode}
      />

      <ChatHub
        models={models}
        onSwitchTab={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        initialQuery=""
        activeModel={activeModel}
        onModelChange={setActiveModel}
        onOpenModal={openModal}
        onToast={showToast}
        currentUser={user}
      />

      {modalModelId && (
        <ModelModal
          modelId={modalModelId}
          defaultTab={modalTab}
          onClose={() => setModalModelId(null)}
          onChat={(id) => setActiveModel(models.find((m) => m.id === id) ?? activeModel)}
          onToast={showToast}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          nextPath="/chat"
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
