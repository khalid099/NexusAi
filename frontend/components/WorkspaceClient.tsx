'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MODELS } from '@/lib/models';
import { apiRequest, buildWorkspacePath, clearAuthSession, createGuestSession, readAccessToken, readStoredUser, updateStoredUser } from '@/lib/auth';
import type { AuthProfile, Model } from '@/lib/types';
import Nav from './Nav';
import Toast from './Toast';
import AppShell from './AppShell';
import ModelModal from './ModelModal';

type WorkspaceTab = 'chat' | 'marketplace' | 'agents' | 'research';

export default function WorkspaceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get('tab') as WorkspaceTab) || 'chat';
  const pendingQuery = searchParams.get('query') ?? '';
  const initialUser = readStoredUser();
  const initialHasAccess = Boolean(readAccessToken()) || Boolean(initialUser?.isGuest);

  const [isCheckingAuth, setIsCheckingAuth] = useState(!initialHasAccess ? true : !initialUser?.isGuest);
  const [activeModel, setActiveModel] = useState<Model>(MODELS[0]);
  const [modalModelId, setModalModelId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [user, setUser] = useState<AuthProfile | null>(initialUser);

  const userLabel = useMemo(() => user?.name ?? user?.email ?? undefined, [user]);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const syncRoute = useCallback((tab: WorkspaceTab, query = '') => {
    router.replace(buildWorkspacePath(tab, query));
  }, [router]);

  const handleSignOut = useCallback(() => {
    clearAuthSession();
    router.replace('/signin');
  }, [router]);

  const openModal = useCallback((modelId: string, tab = 'overview') => {
    setModalModelId(modelId);
    setModalTab(tab);
  }, []);

  const selectModel = useCallback((model: Model) => {
    setActiveModel(model);
    syncRoute('chat', '');
  }, [syncRoute]);

  const handleTabChange = useCallback((tab: WorkspaceTab) => {
    if (tab !== 'chat') {
      syncRoute(tab, '');
      return;
    }

    syncRoute(tab, pendingQuery);
  }, [pendingQuery, syncRoute]);

  useEffect(() => {
    const token = readAccessToken();
    const guest = readStoredUser();

    if (!token && guest?.isGuest) {
      return;
    }

    if (!token) {
      const nextGuest = createGuestSession();
      if (nextGuest?.isGuest) {
        router.refresh();
        return;
      }

      router.replace(`/signin?next=${encodeURIComponent(buildWorkspacePath(activeTab, pendingQuery))}`);
      return;
    }

    let active = true;

    apiRequest<AuthProfile>('/users/me')
      .then((profile) => {
        if (!active) return;
        updateStoredUser(profile);
        setUser(profile);
        setIsCheckingAuth(false);
      })
      .catch(() => {
        if (!active) return;
        clearAuthSession();
        router.replace(`/signin?next=${encodeURIComponent(buildWorkspacePath(activeTab, pendingQuery))}`);
      });

    return () => {
      active = false;
    };
  }, [activeTab, pendingQuery, router]);

  if (isCheckingAuth) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'center' }}>
          <div style={{ width: '0.85rem', height: '0.85rem', borderRadius: '999px', background: 'var(--accent)', animation: 'pulse 1.2s infinite' }} />
          <p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>Validating your session...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Nav
        activeView="app"
        activeTab={activeTab}
        onNavigate={() => router.push('/')}
        onOpenApp={(tab) => handleTabChange(tab ?? 'chat')}
        onTabChange={handleTabChange}
        onToast={showToast}
        isAuthenticated
        userLabel={userLabel}
        onSignOut={handleSignOut}
      />

      <AppShell
        initialQuery={pendingQuery}
        tab={activeTab}
        onTabChange={handleTabChange}
        activeModel={activeModel}
        onModelChange={setActiveModel}
        onOpenModal={openModal}
        onToast={showToast}
        onSelectModel={selectModel}
        currentUser={user}
      />

      {modalModelId && (
        <ModelModal
          modelId={modalModelId}
          defaultTab={modalTab}
          onClose={() => setModalModelId(null)}
          onChat={(id) => selectModel(MODELS.find((model) => model.id === id) ?? MODELS[0])}
          onToast={showToast}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  );
}
