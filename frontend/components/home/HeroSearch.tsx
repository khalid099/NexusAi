'use client';
import { useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

/* ─── Types ─── */
interface SuggestionTab {
  id: string;
  icon: string;
  label: string;
  items: { icon: string; text: string }[];
}

export interface HeroSearchProps {
  onLaunch: (query: string) => void;
  onToast: (msg: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

/* ─── Suggestion data ─── */
const SUGGESTION_TABS: SuggestionTab[] = [
  {
    id: 'recruiting', icon: '👥', label: 'Recruiting',
    items: [
      { icon: '🔍', text: 'Monitor job postings at target companies' },
      { icon: '💰', text: 'Benchmark salary for a specific role' },
      { icon: '📋', text: 'Build a hiring pipeline tracker' },
      { icon: '❤️', text: 'Research a candidate before an interview' },
      { icon: '🗺️', text: 'Build an interactive talent market map' },
    ],
  },
  {
    id: 'prototype', icon: '⌨️', label: 'Create a prototype',
    items: [
      { icon: '🎨', text: 'Design a landing page wireframe' },
      { icon: '📱', text: 'Build a mobile app mockup' },
      { icon: '🔧', text: 'Create an API prototype in minutes' },
      { icon: '🖼️', text: 'Generate UI component library' },
      { icon: '⚡', text: 'Rapid prototype with AI assistance' },
    ],
  },
  {
    id: 'business', icon: '📦', label: 'Build a business',
    items: [
      { icon: '📊', text: 'Analyze market opportunity for my idea' },
      { icon: '💡', text: 'Generate a business plan outline' },
      { icon: '📈', text: 'Create a go-to-market strategy' },
      { icon: '🏆', text: 'Competitive analysis for my niche' },
      { icon: '💬', text: 'Write investor pitch deck content' },
    ],
  },
  {
    id: 'learn', icon: '🎓', label: 'Help me learn',
    items: [
      { icon: '🧠', text: 'Explain machine learning in simple terms' },
      { icon: '📚', text: 'Create a study plan for any subject' },
      { icon: '❓', text: 'Generate practice quiz questions' },
      { icon: '🗂️', text: 'Make flashcards from my notes' },
      { icon: '🗺️', text: 'Build a mind map for a complex topic' },
    ],
  },
  {
    id: 'research', icon: '🔎', label: 'Research',
    items: [
      { icon: '📄', text: 'Summarize a research paper for me' },
      { icon: '🔬', text: 'Compare AI models for my use case' },
      { icon: '📰', text: 'Find latest news on a topic' },
      { icon: '📑', text: 'Analyze a document and extract key points' },
      { icon: '🌐', text: 'Research a company or technology' },
    ],
  },
];

/* ─── Action tiles (bottom highlighted section) ─── */
const ACTION_TILES = [
  { icon: '🎨', label: 'Create image',    query: 'Create an image for me' },
  { icon: '🎵', label: 'Generate Audio',  query: 'Generate audio for me' },
  { icon: '🎬', label: 'Create video',    query: 'Create a video for me' },
  { icon: '📊', label: 'Create slides',   query: 'Create a slide deck for me' },
  { icon: '📐', label: 'Create Infographs', query: 'Create an infographic' },
  { icon: '❓', label: 'Create quiz',     query: 'Create a quiz for me' },
  { icon: '📁', label: 'Create Flashcards', query: 'Create flashcards for me' },
  { icon: '🧠', label: 'Create Mind map', query: 'Create a mind map for me' },
  { icon: '📈', label: 'Analyze Data',    query: 'Analyze data for me' },
  { icon: '✍️', label: 'Write content',  query: 'Help me write content' },
  { icon: '💻', label: 'Code Generation', query: 'Help me with code generation' },
  { icon: '📄', label: 'Document Analysis', query: 'Analyze a document for me' },
  { icon: '🌐', label: 'Translate',       query: 'Translate content for me' },
  { icon: '🔭', label: 'Just Exploring',  query: 'Help me explore AI models' },
];

/* ─── Icon button config ─── */
const ICON_BTNS = [
  { tip: 'Voice',       ic: '#7C3AED', lt: '#F3EEFF', bd: 'rgba(124,58,237,0.25)', type: 'mic',
    svg: <><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></> },
  { tip: 'Attach file', ic: '#D97706', lt: '#FFFBEB', bd: 'rgba(217,119,6,0.25)',  type: 'file',
    svg: <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/> },
  { tip: 'Image',       ic: '#2563EB', lt: '#EFF6FF', bd: 'rgba(37,99,235,0.25)',  type: 'image',
    svg: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></> },
  { tip: 'Download',    ic: '#0891B2', lt: '#E0F7FA', bd: 'rgba(8,145,178,0.25)',  type: 'download',
    svg: <><polyline points="8,17 12,21 16,17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></> },
  { tip: 'Video',       ic: '#DC2626', lt: '#FEF2F2', bd: 'rgba(220,38,38,0.22)',  type: 'video',
    svg: <><polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2"/></> },
  { tip: 'Chat',        ic: '#059669', lt: '#ECFDF5', bd: 'rgba(5,150,105,0.25)', type: 'chat',
    svg: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
];

/* ─── Mic hook ─── */
function useMic(setValue: (v: string) => void, onToast: (m: string) => void) {
  const [micActive, setMicActive] = useState(false);
  const recRef = useRef<unknown>(null);
  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const SR = (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) { onToast('Voice input needs Chrome or Edge'); return; }
    if (micActive) { (recRef.current as { stop: () => void } | null)?.stop(); setMicActive(false); return; }
    const r = new (SR as new () => { lang: string; interimResults: boolean; onresult: unknown; onend: unknown; start: () => void })();
    r.lang = 'en-US'; r.interimResults = true;
    r.onresult = (ev: { results: { [key: number]: { [key: number]: { transcript: string } } } }) =>
      setValue(Array.from({ length: ev.results.length }, (_, i) => ev.results[i][0].transcript).join(''));
    r.onend = () => setMicActive(false);
    r.start(); recRef.current = r; setMicActive(true);
  }, [micActive, onToast, setValue]);
  return { micActive, toggle };
}

/* ─── Main component ─── */
export function HeroSearch({ onLaunch, onToast, placeholder, showSuggestions = true }: HeroSearchProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState(SUGGESTION_TABS[0].id);
  const [agentActive, setAgentActive] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { micActive, toggle: toggleMic } = useMic(setValue, onToast);

  const go = () => {
    const q = value.trim();
    if (q) { onLaunch(q); setValue(''); setFocused(false); }
    else inputRef.current?.focus();
  };

  const handleIconAction = (type: string, e: React.MouseEvent) => {
    if (type === 'mic') { toggleMic(e); return; }
    if (type === 'file') { fileRef.current?.click(); return; }
    if (type === 'chat') { onLaunch("Let's chat"); return; }
    const labels: Record<string, string> = {
      image: 'Image upload coming soon!',
      download: 'Export coming soon!',
      video: 'Video input coming soon!',
    };
    onToast(labels[type] ?? 'Coming soon!');
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const showPanel = focused && showSuggestions && !value;
  const currentTab = SUGGESTION_TABS.find(t => t.id === activeTab)!;

  return (
    <Box sx={{ width: '100%', maxWidth: 680, position: 'relative', mb: 2, zIndex: 100 }}>

      {/* ── Search card ── */}
      <Paper
        elevation={0}
        sx={{
          border: '1.5px solid',
          borderColor: focused ? 'primary.main' : 'rgba(0,0,0,0.14)',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'border-color 0.22s, box-shadow 0.22s',
          boxShadow: focused
            ? '0 0 0 4px rgba(200,98,42,0.1), 0 2px 12px rgba(0,0,0,0.09)'
            : '0 2px 12px rgba(0,0,0,0.09), 0 8px 32px rgba(0,0,0,0.05)',
        }}
      >
        {/* Top row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: '18px', pt: '14px', pb: '6px' }}>
          <Box
            component="textarea"
            ref={inputRef}
            placeholder={placeholder ?? 'Click here and type anything — or just say hi 👋'}
            value={value}
            rows={1}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setValue(e.target.value);
              autoGrow(e.target);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); }
            }}
            sx={{
              flex: 1, border: 'none', background: 'transparent',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.97rem', color: 'text.primary', outline: 'none',
              resize: 'none', lineHeight: 1.55,
              minHeight: '26px', maxHeight: '160px', p: 0, overflowY: 'auto',
              '&::placeholder': { color: '#9E9B93', fontSize: '0.93rem' },
            }}
          />
          {/* Avatar icons */}
          <Box sx={{ display: 'flex', gap: '5px', flexShrink: 0, mt: '2px' }}>
            {[
              { bg: '#14b8a6', title: 'Upload', action: () => fileRef.current?.click(),
                icon: <><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></> },
              { bg: '#1c1a16', title: 'More', action: () => onToast('More options coming soon!'),
                icon: <><circle cx="12" cy="5" r="1" fill="white"/><circle cx="12" cy="12" r="1" fill="white"/><circle cx="12" cy="19" r="1" fill="white"/></> },
            ].map(btn => (
              <Tooltip key={btn.title} title={btn.title} arrow>
                <ButtonBase
                  onClick={btn.action}
                  sx={{
                    width: 26, height: 26, borderRadius: '50%', background: btn.bg,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    {btn.icon}
                  </svg>
                </ButtonBase>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Bottom bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: '10px', pb: '9px', pt: '6px' }}>
          {/* Icon boxes */}
          {ICON_BTNS.map(btn => (
            <Tooltip key={btn.tip} title={btn.tip} arrow>
              <ButtonBase
                onClick={(e) => handleIconAction(btn.type, e)}
                sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: micActive && btn.type === 'mic' ? '#dc2626' : btn.bd,
                  background: micActive && btn.type === 'mic' ? '#dc2626' : btn.lt,
                  flexShrink: 0, transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.06)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    background: btn.ic, borderColor: btn.ic,
                    '& svg': { stroke: '#fff !important' },
                  },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke={micActive && btn.type === 'mic' ? '#fff' : btn.ic}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"
                  style={micActive && btn.type === 'mic' ? { animation: 'micPulse 0.9s ease-in-out infinite' } : undefined}>
                  {btn.svg}
                </svg>
              </ButtonBase>
            </Tooltip>
          ))}

          {/* Separator */}
          <Box sx={{ width: '1px', height: '22px', background: 'rgba(0,0,0,0.1)', flexShrink: 0, mx: '2px' }} />

          {/* Agent chip */}
          <ButtonBase
            onClick={() => setAgentActive(p => !p)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              px: '0.7rem', pl: '0.55rem', py: '0.28rem',
              borderRadius: '2rem', border: '1.5px solid',
              borderColor: agentActive ? '#1c1a16' : 'rgba(0,0,0,0.14)',
              background: agentActive ? '#1c1a16' : '#F4F2EE',
              color: agentActive ? '#fff' : '#5A5750',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.18s',
              '&:hover': { background: '#fdf1eb', borderColor: '#c8622a', color: '#c8622a' },
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Agent
            <Box component="span" sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%',
              background: agentActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              fontSize: '0.65rem', fontWeight: 700, ml: '1px',
            }}>+</Box>
          </ButtonBase>

          <Box sx={{ flex: 1 }} />

          {/* Let's go button */}
          <ButtonBase
            onClick={go}
            sx={{
              background: '#C8622A', color: '#fff', border: 'none',
              px: '1.15rem', py: '0.52rem', borderRadius: '2rem',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0,
              boxShadow: '0 2px 10px rgba(200,98,42,0.3)', letterSpacing: '-0.01em',
              transition: 'all 0.18s',
              '&:hover': { background: '#A34D1E', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(200,98,42,0.38)' },
              '&:active': { transform: 'translateY(0) scale(0.97)' },
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Let&apos;s go
          </ButtonBase>
        </Box>
      </Paper>

      {/* ── Suggestions panel ── */}
      <Fade in={showPanel} timeout={220}>
        <Paper
          elevation={0}
          sx={{
            width: '100%', mt: '8px', borderRadius: '16px', overflow: 'hidden',
            border: '1.5px solid rgba(0,0,0,0.14)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
            display: showPanel ? 'block' : 'none',
          }}
        >
          {/* Tabs */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '2px',
            px: '12px', pt: '10px', pb: 0,
            overflowX: 'auto', borderBottom: '1px solid rgba(0,0,0,0.08)',
            '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
          }}>
            {SUGGESTION_TABS.map(tab => (
              <ButtonBase
                key={tab.id}
                onMouseDown={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  px: '0.8rem', py: '0.38rem',
                  borderRadius: '20px 20px 0 0',
                  border: '1px solid',
                  borderColor: activeTab === tab.id ? 'rgba(0,0,0,0.14)' : 'transparent',
                  borderBottom: activeTab === tab.id ? '1px solid #fff' : '1px solid transparent',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? 'text.primary' : 'text.secondary',
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
                  position: 'relative', bottom: '-1px', transition: 'all 0.14s',
                  '&:hover': { color: 'text.primary', background: '#ECEAE4' },
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </ButtonBase>
            ))}
          </Box>

          {/* Items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', p: '4px 8px 6px' }}>
            {currentTab.items.map((item, i) => (
              <ButtonBase
                key={i}
                onMouseDown={(e) => { e.preventDefault(); setValue(item.text); inputRef.current?.focus(); }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  px: '0.85rem', py: '0.55rem', borderRadius: '10px',
                  color: 'text.secondary', fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: '0.86rem', lineHeight: 1.4, width: '100%', textAlign: 'left',
                  transition: 'background 0.13s',
                  '&:hover': { background: '#F4F2EE', color: 'text.primary', '& .arrow': { opacity: 1, transform: 'translateX(0)' } },
                }}
              >
                <Box sx={{
                  width: 28, height: 28, borderRadius: '8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                  flexShrink: 0, background: '#ECEAE4',
                }}>
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1, textAlign: 'left' }}>{item.text}</Box>
                <Box className="arrow" sx={{ opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.14s', color: '#9E9B93', fontSize: '0.78rem', flexShrink: 0 }}>
                  →
                </Box>
              </ButtonBase>
            ))}
          </Box>

          {/* Footer */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '5px',
            px: '14px', py: '8px 10px',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.7rem', color: '#9E9B93',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <Typography variant="inherit" component="span">
              Click any suggestion to fill the search box, then press <strong>Let&apos;s go</strong>
            </Typography>
          </Box>
        </Paper>
      </Fade>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onToast(`📎 "${f.name}" attached`);
          e.target.value = '';
        }}
      />
    </Box>
  );
}

/* ─── Action Tiles (the highlighted bottom grid) ─── */
export function ActionTiles({ onLaunch }: { onLaunch: (q: string) => void }) {
  return (
    <Box
      sx={{
        display: 'flex', flexWrap: 'wrap', gap: '10px',
        justifyContent: 'center', maxWidth: 900, mt: 1,
      }}
      role="list"
    >
      {ACTION_TILES.map((tile, i) => (
        <ButtonBase
          key={tile.label}
          role="listitem"
          onClick={() => onLaunch(tile.query)}
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '16px',
            px: '18px', py: '14px',
            minWidth: '100px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            animation: 'tileIn 0.4s ease both',
            animationDelay: `${0.05 + i * 0.04}s`,
            '@keyframes tileIn': {
              from: { opacity: 0, transform: 'translateY(10px) scale(0.92)' },
              to: { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
            '&:hover': {
              transform: 'translateY(-4px) scale(1.04)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              borderColor: 'rgba(200,98,42,0.3)',
              background: '#fdf1eb',
            },
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          <Box component="span" sx={{ fontSize: '1.6rem', lineHeight: 1 }} aria-hidden="true">
            {tile.icon}
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.74rem', fontWeight: 600,
              color: 'text.secondary', whiteSpace: 'nowrap', lineHeight: 1,
            }}
          >
            {tile.label}
          </Typography>
        </ButtonBase>
      ))}
    </Box>
  );
}

export default HeroSearch;
