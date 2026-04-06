'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  getNavCopy,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  resolveLanguage,
} from '@/lib/language';
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
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
}

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
  onOpenAuthModal,
}: NavProps) {
  const isApp = activeView === 'app';
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [languageCode, setLanguageCode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return resolveLanguage(storedLanguage ?? window.navigator.language).code;
  });
  const languageMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const selectedLanguage = resolveLanguage(languageCode);
    document.documentElement.lang = selectedLanguage.code;
    document.documentElement.dir = selectedLanguage.dir;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage.code);
  }, [languageCode]);

  useEffect(() => {
    if (!languageMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [languageMenuOpen]);

  const selectedLanguage = resolveLanguage(languageCode);
  const copy = getNavCopy(languageCode);

  const navLinks: { label: string; href: string; tab: AppTab; badge?: string }[] = [
    { label: copy.chatHub, href: '/chat', tab: 'chat' },
    { label: copy.marketplace, href: '/marketplace', tab: 'marketplace' },
    { label: copy.discoverNew, href: '/discover', tab: 'research', badge: copy.newBadge },
    { label: copy.agents, href: '/agents', tab: 'agents' },
  ];

  const appTabs: { label: string; tab: AppTab }[] = [
    { label: copy.chat, tab: 'chat' },
    { label: copy.marketplace, tab: 'marketplace' },
    { label: copy.agents, tab: 'agents' },
    { label: copy.discover, tab: 'research' },
  ];

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div
          className={styles.logo}
          onClick={() => onNavigate('landing')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => event.key === 'Enter' && onNavigate('landing')}
        >
          <div className={styles.logoMark}>
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <path d="M7 1 L13 7 L7 13 L1 7 Z" />
            </svg>
          </div>
          <span className={styles.logoText}>NexusAI</span>
          <span className={styles.logoDot} />
        </div>

        {isApp ? (
          <ul className={styles.navLinks} role="list">
            {appTabs.map(({ label, tab }) => (
              <li key={tab}>
                <button
                  className={`${styles.navLink} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => onTabChange?.(tab)}
                >
                  {label}
                  {activeTab === tab && <span className={styles.activePill} aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={styles.navLinks} role="list">
            {navLinks.map((link) => (
              <li key={link.tab}>
                <button
                  type="button"
                  className={styles.navLink}
                  style={{ textDecoration: 'none' }}
                  onClick={() => onOpenApp(link.tab)}
                >
                  {link.label}
                  {link.badge && <span className={styles.badge}>{link.badge}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          <div className={styles.languageMenu} ref={languageMenuRef}>
            <button
              type="button"
              className={`${styles.languageButton} ${languageMenuOpen ? styles.languageButtonOpen : ''}`}
              onClick={() => setLanguageMenuOpen((open) => !open)}
              aria-expanded={languageMenuOpen}
              aria-haspopup="menu"
              aria-label={copy.appLanguage}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.93 9h-3.1a15.7 15.7 0 0 0-1.39-5.02A8.04 8.04 0 0 1 18.93 11ZM12 4.07c.93 1.07 2.07 3.33 2.55 6.93H9.45C9.93 7.4 11.07 5.14 12 4.07ZM4.07 13h3.1a15.7 15.7 0 0 0 1.39 5.02A8.04 8.04 0 0 1 4.07 13Zm3.1-2h-3.1a8.04 8.04 0 0 1 4.49-5.02A15.7 15.7 0 0 0 7.17 11Zm4.83 8.93c-.93-1.07-2.07-3.33-2.55-6.93h5.1C14.07 16.6 12.93 18.86 12 19.93ZM15.83 13h3.1a8.04 8.04 0 0 1-4.49 5.02A15.7 15.7 0 0 0 15.83 13Z"
                  fill="currentColor"
                />
              </svg>
              <span>{selectedLanguage.shortLabel}</span>
              <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.languageCaret}>
                <path
                  d="M5.25 7.5 10 12.25 14.75 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {languageMenuOpen && (
              <div className={styles.languageDropdown} role="menu" aria-label={copy.appLanguage}>
                <p className={styles.languageTitle}>{copy.appLanguage}</p>
                <ul className={styles.languageList} role="list">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <li key={option.code}>
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={selectedLanguage.code === option.code}
                        className={`${styles.languageOption} ${
                          selectedLanguage.code === option.code ? styles.languageOptionActive : ''
                        }`}
                        onClick={() => {
                          setLanguageCode(option.code);
                          setLanguageMenuOpen(false);
                        }}
                      >
                        <span className={styles.languageCode}>{option.shortLabel}</span>
                        <span className={styles.languageLabel}>{option.nativeLabel}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {isApp ? (
            <>
              <button className={`${styles.btn} ${styles.ghost}`} onClick={() => onToast?.('API docs coming soon!')}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {copy.api}
              </button>
              <button className={`${styles.btn} ${styles.primary}`} onClick={() => onToast?.('Upgrade coming soon!')}>
                {copy.upgrade} -&gt;
              </button>
            </>
          ) : isAuthenticated ? (
            <>
              <span className={styles.userChip}>{userLabel ?? copy.account}</span>
              <button className={`${styles.btn} ${styles.ghost}`} onClick={onSignOut}>
                {copy.signOut}
              </button>
              <button className={`${styles.btn} ${styles.primary}`} onClick={() => onOpenApp()}>
                {copy.openWorkspace} -&gt;
              </button>
            </>
          ) : (
            <>
              <button type="button" className={`${styles.btn} ${styles.ghost} ${styles.linkBtn}`} onClick={() => onOpenAuthModal?.('signin')}>
                {copy.signIn}
              </button>
              <button type="button" className={`${styles.btn} ${styles.primary} ${styles.linkBtn}`} onClick={() => onOpenAuthModal?.('signup')}>
                {copy.getStarted} -&gt;
              </button>
            </>
          )}
        </div>

        <button
          className={`${styles.hamburger} ${drawerOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setDrawerOpen((open) => !open)}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`} aria-hidden={!drawerOpen}>
        <ul className={styles.drawerLinks} role="list">
          {(isApp ? appTabs.map((tab) => ({ label: tab.label, href: '#', tab: tab.tab, badge: undefined as string | undefined })) : navLinks).map((link) => (
            <li key={link.label}>
              {isApp ? (
                <button
                  className={`${styles.drawerLink} ${activeTab === link.tab ? styles.drawerLinkActive : ''}`}
                  onClick={() => {
                    onTabChange?.(link.tab as AppTab);
                    setDrawerOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.drawerLink}
                  onClick={() => {
                    onOpenApp(link.tab as AppTab);
                    setDrawerOpen(false);
                  }}
                >
                  {link.label}
                  {link.badge && <span className={styles.badge}>{link.badge}</span>}
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.mobileLanguageSection}>
          <p className={styles.mobileLanguageTitle}>{copy.appLanguage}</p>
          <div className={styles.mobileLanguageGrid}>
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                className={`${styles.mobileLanguageOption} ${
                  selectedLanguage.code === option.code ? styles.mobileLanguageOptionActive : ''
                }`}
                onClick={() => setLanguageCode(option.code)}
              >
                <span className={styles.mobileLanguageCode}>{option.shortLabel}</span>
                <span className={styles.mobileLanguageLabel}>{option.nativeLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.drawerActions}>
          {isAuthenticated ? (
            <button
              className={`${styles.btn} ${styles.primary}`}
              style={{ width: '100%' }}
              onClick={() => {
                onOpenApp();
                setDrawerOpen(false);
              }}
            >
              {copy.openWorkspace} -&gt;
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`${styles.btn} ${styles.ghost} ${styles.linkBtn}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  onOpenAuthModal?.('signin');
                  setDrawerOpen(false);
                }}
              >
                {copy.signIn}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.primary} ${styles.linkBtn}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  onOpenAuthModal?.('signup');
                  setDrawerOpen(false);
                }}
              >
                {copy.getStarted} -&gt;
              </button>
            </>
          )}
        </div>
      </div>

      {drawerOpen && <div className={styles.drawerBackdrop} onClick={() => setDrawerOpen(false)} aria-hidden="true" />}
    </>
  );
}
