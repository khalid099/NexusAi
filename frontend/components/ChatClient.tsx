'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MODELS } from '@/lib/models';
import { clearAuthSession, readAccessToken, readStoredUser } from '@/lib/auth';
import type { AuthProfile, Model } from '@/lib/types';
import Nav from '@/components/Nav';
import Toast from '@/components/Toast';
import ChatHub from '@/components/ChatHub';
import ModelModal from '@/components/ModelModal';

export default function ChatClient() {
  const router = useRouter();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());

  const [toast, setToast] = useState('');
  const [isAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user] = useState<AuthProfile | null>(initialUser);
  const [activeModel, setActiveModel] = useState<Model>(MODELS[0]);
  const [modalModelId, setModalModelId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState('overview');

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleSignOut = useCallback(() => {
    clearAuthSession();
    router.push('/signin');
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
        onNavigate={() => router.push('/landing')}
        onOpenApp={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onTabChange={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
      />

      <ChatHub
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
          onChat={(id) => setActiveModel(MODELS.find((m) => m.id === id) ?? MODELS[0])}
          onToast={showToast}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  );
}
