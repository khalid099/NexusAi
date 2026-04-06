'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthSession, readAccessToken, readStoredUser } from '@/lib/auth';
import type { AuthProfile } from '@/lib/types';
import Nav from '@/components/layout/Nav';
import Toast from '@/components/ui/Toast';
import ResearchView from '@/components/research/ResearchView';

export default function DiscoverClient() {
  const router = useRouter();
  const initialUser = readStoredUser();
  const initialHasToken = Boolean(readAccessToken());

  const [toast, setToast] = useState('');
  const [isAuthenticated] = useState(initialHasToken && Boolean(initialUser));
  const [user] = useState<AuthProfile | null>(initialUser);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleSignOut = useCallback(() => {
    clearAuthSession();
    router.push('/signin');
  }, [router]);

  return (
    <>
      <Nav
        activeView="app"
        activeTab="research"
        onNavigate={() => router.push('/landing')}
        onOpenApp={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onTabChange={(tab) => router.push(`/${tab === 'research' ? 'discover' : tab}`)}
        onToast={showToast}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? undefined}
        onSignOut={handleSignOut}
      />

      <ResearchView onToast={showToast} />

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  );
}
