'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthSession, readAccessToken, readStoredUser } from '@/lib/auth';
import type { AuthProfile } from '@/lib/types';
import Nav from '@/components/layout/Nav';
import Toast from '@/components/ui/Toast';
import AgentBuilder from '@/components/agents/AgentBuilder';
import ModelModal from '@/components/marketplace/ModelModal';
import { MODELS } from '@/lib/mock-data';

export default function AgentsClient() {
  const router = useRouter();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());

  const [toast, setToast] = useState('');
  const [isAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user] = useState<AuthProfile | null>(initialUser);
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
        activeTab="agents"
        onNavigate={() => router.push('/landing')}
        onOpenApp={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onTabChange={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
      />

      <AgentBuilder
        onOpenModal={openModal}
        onChatAction={() => router.push('/chat')}
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
    </>
  );
}
