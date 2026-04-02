'use client';
import { useState, useRef } from 'react';
import styles from './HeroSearch.module.css';

interface HeroSearchProps {
  onLaunch: (query: string) => void;
  onToast: (msg: string) => void;
}

export default function HeroSearch({ onLaunch, onToast }: HeroSearchProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const go = () => {
    const q = value.trim();
    if (q) onLaunch(q);
    else inputRef.current?.focus();
  };

  const toggleMic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { onToast('Voice input needs Chrome or Edge'); return; }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = true;
    r.onresult = (ev: any) => setValue([...ev.results].map((x: any) => x[0].transcript).join(''));
    r.start();
  };

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Click here and type anything — or just say hi 👋"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') go(); }}
        />
        <div className={styles.tools}>
          {/* Mic */}
          <button className={styles.tool} title="Voice" onClick={toggleMic}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </button>
          {/* Screen/Upload */}
          <button className={styles.tool} title="Upload file" onClick={() => onToast('File upload coming soon!')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8,21 16,21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          {/* Video */}
          <button className={styles.tool} title="Video input" onClick={() => onToast('Video input coming soon!')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </button>
          {/* Chat */}
          <button className={styles.tool} title="Start chat" onClick={() => onLaunch('Let\'s chat')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          {/* Attachment */}
          <button className={styles.tool} title="Attach" onClick={() => onToast('Attachment coming soon!')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          {/* Image */}
          <button className={styles.tool} title="Image input" onClick={() => onToast('Image upload coming soon!')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </button>
        </div>
        <div className={styles.sep}/>
        <button className={styles.goBtn} onClick={go}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Let&apos;s go
        </button>
      </div>
    </div>
  );
}
