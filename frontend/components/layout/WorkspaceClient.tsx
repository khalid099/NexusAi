'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MODELS } from '@/lib/mock-data';
import { apiRequest, buildAuthModalPath, buildWorkspacePath, clearAuthSession, createGuestSession, hasGuestSession, readAccessToken, readStoredUser, updateStoredUser } from '@/lib/auth';
import type { AuthProfile, Model } from '@/lib/types';
import AuthModal from '@/components/auth/AuthModal';
import Nav from '@/components/layout/Nav';
import Toast from '@/components/ui/Toast';
import AppShell from '@/components/layout/AppShell';
import ModelModal from '@/components/marketplace/ModelModal';

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
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);
  const [authNextPath, setAuthNextPath] = useState(buildWorkspacePath('agents'));

  const userLabel = useMemo(() => user?.name ?? user?.email ?? undefined, [user]);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const syncRoute = useCallback((tab: WorkspaceTab, query = '') => {
    router.replace(buildWorkspacePath(tab, query));
  }, [router]);

  const handleSignOut = useCallback(() => {
    clearAuthSession();
    const guest = createGuestSession();
    setUser(guest);
    router.replace(buildWorkspacePath('chat', ''));
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
    if (tab === 'agents' && hasGuestSession()) {
      setAuthNextPath(buildWorkspacePath('agents'));
      setAuthMode('signup');
      return;
    }

    if (tab !== 'chat') {
      syncRoute(tab, '');
      return;
    }

    syncRoute(tab, pendingQuery);
  }, [pendingQuery, syncRoute]);

  useEffect(() => {
    const token = readAccessToken();
    const guest = readStoredUser();

    if (activeTab === 'agents' && guest?.isGuest) {
      setAuthNextPath(buildWorkspacePath('agents'));
      setAuthMode('signup');
      router.replace(buildWorkspacePath('chat', pendingQuery));
      return;
    }

    if (!token && guest?.isGuest) {
      return;
    }

    if (!token) {
      const nextGuest = createGuestSession();
      if (nextGuest?.isGuest) {
        router.refresh();
        return;
      }

      router.replace(buildAuthModalPath('signin', buildWorkspacePath(activeTab, pendingQuery)));
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
        router.replace(buildAuthModalPath('signin', buildWorkspacePath(activeTab, pendingQuery)));
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
        isAuthenticated={!user?.isGuest}
        userLabel={userLabel}
        onSignOut={handleSignOut}
        onOpenAuthModal={(mode) => {
          setAuthNextPath(buildWorkspacePath(activeTab, pendingQuery));
          setAuthMode(mode);
        }}
      />

      <AppShell
        initialQuery={pendingQuery}
        tab={activeTab}
        onTabChange={handleTabChange}
        onResearchDiscuss={(prompt) => syncRoute('chat', prompt)}
        activeModel={activeModel}
        onModelChange={setActiveModel}
        onOpenModal={openModal}
        onToast={showToast}
        onSelectModel={selectModel}
        currentUser={user}
        models={MODELS}
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
      {authMode && (
        <AuthModal
          initialMode={authMode}
          nextPath={authNextPath}
          onClose={() => setAuthMode(null)}
          onSuccess={(profile) => {
            setUser(profile);
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
