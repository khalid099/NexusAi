'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

const NAV_LINKS: { label: string; href: string; tab: AppTab; badge?: string }[] = [
  { label: 'Chat Hub',     href: '/chat',        tab: 'chat'        },
  { label: 'Marketplace',  href: '/marketplace', tab: 'marketplace' },
  { label: 'Discover New', href: '/discover',    tab: 'research', badge: 'New' },
  { label: 'Agents',       href: '/agents',      tab: 'agents'      },
];

const APP_TABS: { label: string; tab: AppTab; icon: string }[] = [
  { label: '💬 Chat',       tab: 'chat',        icon: '💬' },
  { label: '🛍 Marketplace', tab: 'marketplace', icon: '🛍' },
  { label: '🤖 Agents',     tab: 'agents',       icon: '🤖' },
  { label: '🔬 Discover',   tab: 'research',     icon: '🔬' },
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
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [activeView, activeTab]);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>

        {/* ── Logo ── */}
        <div className={styles.logo} onClick={() => onNavigate('landing')} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onNavigate('landing')}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <path d="M7 1 L13 7 L7 13 L1 7 Z"/>
            </svg>
          </div>
          <span className={styles.logoText}>NexusAI</span>
          <span className={styles.logoDot}/>
        </div>

        {/* ── Desktop links ── */}
        {isApp ? (
          <ul className={styles.navLinks} role="list">
            {APP_TABS.map(({ label, tab }) => (
              <li key={tab}>
                <button
                  className={`${styles.navLink} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => onTabChange?.(tab)}
                >
                  {label}
                  {activeTab === tab && <span className={styles.activePill} aria-hidden="true"/>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={styles.navLinks} role="list">
            {NAV_LINKS.map(link => (
              <li key={link.tab}>
                <Link href={link.href} className={styles.navLink} style={{ textDecoration: 'none' }}>
                  {link.label}
                  {link.badge && <span className={styles.badge}>{link.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* ── Desktop actions ── */}
        <div className={styles.actions}>
          {isApp ? (
            <>
              <button className={`${styles.btn} ${styles.ghost}`} onClick={() => onToast?.('API docs coming soon!')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                API
              </button>
              <button className={`${styles.btn} ${styles.primary}`} onClick={() => onToast?.('Upgrade coming soon!')}>
                Upgrade ✦
              </button>
            </>
          ) : isAuthenticated ? (
            <>
              <span className={styles.userChip}>{userLabel ?? 'Account'}</span>
              <button className={`${styles.btn} ${styles.ghost}`} onClick={onSignOut}>Sign out</button>
              <button className={`${styles.btn} ${styles.primary}`} onClick={() => onOpenApp()}>Open workspace →</button>
            </>
          ) : (
            <>
              <Link href="/signin" className={`${styles.btn} ${styles.ghost} ${styles.linkBtn}`}>Sign in</Link>
              <Link href="/signup" className={`${styles.btn} ${styles.primary} ${styles.linkBtn}`}>
                Get Started →
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className={`${styles.hamburger} ${drawerOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setDrawerOpen(p => !p)}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
        >
          <span/><span/><span/>
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`} aria-hidden={!drawerOpen}>
        <ul className={styles.drawerLinks} role="list">
          {(isApp ? APP_TABS.map(t => ({ label: t.label, href: '#', tab: t.tab })) : NAV_LINKS).map(link => (
            <li key={link.label}>
              {isApp ? (
                <button
                  className={`${styles.drawerLink} ${activeTab === link.tab ? styles.drawerLinkActive : ''}`}
                  onClick={() => { onTabChange?.(link.tab as AppTab); setDrawerOpen(false); }}
                >
                  {link.label}
                </button>
              ) : (
                <Link href={(link as typeof NAV_LINKS[0]).href} className={styles.drawerLink}
                  onClick={() => setDrawerOpen(false)}>
                  {link.label}
                  {(link as typeof NAV_LINKS[0]).badge && <span className={styles.badge}>{(link as typeof NAV_LINKS[0]).badge}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className={styles.drawerActions}>
          {isAuthenticated ? (
            <button className={`${styles.btn} ${styles.primary}`} style={{ width: '100%' }} onClick={() => { onOpenApp(); setDrawerOpen(false); }}>
              Open workspace →
            </button>
          ) : (
            <>
              <Link href="/signin" className={`${styles.btn} ${styles.ghost} ${styles.linkBtn}`} style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setDrawerOpen(false)}>Sign in</Link>
              <Link href="/signup" className={`${styles.btn} ${styles.primary} ${styles.linkBtn}`} style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setDrawerOpen(false)}>Get Started →</Link>
            </>
          )}
        </div>
      </div>
      {drawerOpen && <div className={styles.drawerBackdrop} onClick={() => setDrawerOpen(false)} aria-hidden="true"/>}
    </>
  );
}
