'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MODELS } from '@/lib/models';
import { clearAuthSession, readAccessToken, readStoredUser } from '@/lib/auth';
import type { AuthProfile, Model } from '@/lib/types';
import Nav from '@/components/Nav';
import Toast from '@/components/Toast';
import Marketplace from '@/components/Marketplace';
import ModelModal from '@/components/ModelModal';

export default function MarketplaceClient() {
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

  const selectModel = useCallback((model: Model) => {
    router.push(`/chat?model=${model.id}`);
  }, [router]);

  return (
    <>
      <Nav
        activeView="app"
        activeTab="marketplace"
        onNavigate={() => router.push('/landing')}
        onOpenApp={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onTabChange={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
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
    </>
  );
}
