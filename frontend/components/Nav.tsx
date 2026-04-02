'use client';
import Link from 'next/link';
import { AppView } from '@/lib/types';
import styles from './Nav.module.css';

type AppTab = 'chat' | 'marketplace' | 'agents' | 'research';

interface NavProps {
  activeView: AppView;
  activeTab?: AppTab;
  onNavigate: (view: AppView) => void;
  onOpenApp: (tab?: AppTab) => void;
  onTabChange?: (tab: AppTab) => void;
  onToast?: (msg: string) => void;
  isAuthenticated?: boolean;
  userLabel?: string;
  onSignOut?: () => void;
}

const NAV_LINKS = [
  {
    label: 'Discover New',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        <path d="m11 8 1.5 3H9.5L11 8z"/>
        <path d="M11 14v-2"/>
      </svg>
    ),
    href: '/discover',
    tab: 'research' as const,
  },
  {
    label: 'Chat Hub',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    href: '/chat',
    tab: 'chat' as const,
  },
  {
    label: 'Marketplace',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    href: '/marketplace',
    tab: 'marketplace' as const,
  },
  {
    label: 'Agents',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    href: '/agents',
    tab: 'agents' as const,
  },
];

const APP_TABS: { label: string; tab: AppTab; href: string }[] = [
  { label: 'Chat', tab: 'chat', href: '/chat' },
  { label: 'Marketplace', tab: 'marketplace', href: '/marketplace' },
  { label: 'Agents', tab: 'agents', href: '/agents' },
  { label: 'Discover New', tab: 'research', href: '/discover' },
];

export default function Nav({
  activeView,
  activeTab,
  onNavigate,
  onOpenApp,
  onTabChange,
  onToast,
  isAuthenticated = false,
  userLabel,
  onSignOut,
}: NavProps) {
  const isApp = activeView === 'app';

  return (
    <nav className={styles.nav}>
      <div className={styles.logo} onClick={() => onNavigate('landing')}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <span>NexusAI</span>
      </div>

      {isApp ? (
        <ul className={styles.navLinks}>
          {APP_TABS.map(({ label, tab, href }) => (
            <li key={tab}>
              <Link
                href={href}
                className={activeTab === tab ? styles.navLinkActive : ''}
                style={{ textDecoration: 'none' }}
              >
                <span className={styles.navLinkInner}>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.navLinks}>
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <Link href={link.href} style={{ textDecoration: 'none' }}>
                <span className={styles.navLinkInner}>
                  {link.icon}
                  {link.label}
                  {link.label === 'Discover New' && (
                    <span className={styles.newBadge}>New</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.navActions}>
        {isApp ? (
          <>
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => onToast?.('API key copied!')}>API Key</button>
            <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Upgrade</button>
          </>
        ) : (
          <>
            {isAuthenticated ? (
              <>
                <span className={styles.userChip}>{userLabel ?? 'Signed in'}</span>
                <button className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
                <button className="btn btn-primary" onClick={() => onOpenApp()}>Open workspace</button>
              </>
            ) : (
              <>
                <Link href="/signin" className={`${styles.actionLink} btn btn-ghost`}>
                  Sign in
                </Link>
                <Link href="/signup" className={`${styles.actionLink} btn btn-primary`}>
                  Get started
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
