'use client';
import { useEffect, useRef, useState } from 'react';
import { MODELS } from '@/lib/mock-data';
import { Model } from '@/lib/types';
import { HeroSearch, ActionTiles } from '@/components/home/HeroSearch';
import ModelCard from '@/components/marketplace/ModelCard';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onLaunch: (query: string) => void;
  onSelectModel: (model: Model) => void;
  onOpenModal: (modelId: string) => void;
  onToast: (msg: string) => void;
}

/* ─────────────────── Data ─────────────────── */

const STATS = [
  { value: '525+', label: 'AI Models',  icon: '🤖' },
  { value: '82K',  label: 'Builders',   icon: '👥' },
  { value: '28',   label: 'AI Labs',    icon: '🔬' },
  { value: '4.8★', label: 'Avg Rating', icon: '⭐' },
];

const LABS = [
  { name: 'OpenAI',         emoji: '⬛', color: '#111111', sub: 'GPT-5.4 · DALL·E 4 · Sora 2' },
  { name: 'Anthropic',      emoji: '✦',  color: '#c8622a', sub: 'Opus 4.6 · Sonnet 4.6 · Haiku' },
  { name: 'Google DeepMind',emoji: '✶',  color: '#4285f4', sub: 'Gemini 3.1 Pro · Veo 3 · Gemma' },
  { name: 'xAI (Grok)',     emoji: '✕',  color: '#222222', sub: 'Grok-4 Fast · Grok-Imagine' },
  { name: 'DeepSeek',       emoji: '🔷', color: '#1d6fe8', sub: 'V3 · R1 · Coder v3' },
  { name: 'Meta (Llama)',   emoji: '🦙', color: '#1877f2', sub: 'Llama 4 Maverick · Scout' },
  { name: 'Alibaba (Qwen)', emoji: '🔶', color: '#ff6a00', sub: 'Qwen3-Max · QVQ · Coder' },
  { name: 'Mistral',        emoji: '🌊', color: '#f5821f', sub: 'Large 3 · Devstral 2 · Codestral' },
  { name: 'NVIDIA NIM',     emoji: '🟢', color: '#76b900', sub: 'Nemotron Ultra · Nano · Phi-4' },
  { name: 'GLM (Zhipu)',    emoji: '🔷', color: '#5c6bc0', sub: 'GLM-5 · GLM-4.7 · CogVideoX' },
  { name: 'Moonshot (Kimi)',emoji: '🌙', color: '#6c63ff', sub: 'k2.5 · k2-Thinking' },
];

const COMPARISON = [
  { name: 'GPT-5.4',           org: 'OpenAI',    ctx: '1.05M', inp: '$2.50', out: '$10',   multi: true,  speed: 'moderate', best: 'High-precision professional tasks' },
  { name: 'Claude Opus 4.6',   org: 'Anthropic', ctx: '200K',  inp: '$15',   out: '$75',   multi: true,  speed: 'moderate', best: 'Agents, advanced coding' },
  { name: 'Claude Sonnet 4.6', org: 'Anthropic', ctx: '200K',  inp: '$3',    out: '$15',   multi: true,  speed: 'fast',     best: 'Code, writing, analysis' },
  { name: 'Claude Haiku 4.5',  org: 'Anthropic', ctx: '200K',  inp: '$0.25', out: '$1.25', multi: true,  speed: 'fastest',  best: 'Real-time, high-volume tasks' },
  { name: 'Gemini 3.1 Pro',    org: 'Google',    ctx: '5M',    inp: '$7',    out: '$21',   multi: true,  speed: 'fast',     best: 'Long-context reasoning' },
  { name: 'Grok-4 Fast',       org: 'xAI',       ctx: '256K',  inp: '$3',    out: '$15',   multi: true,  speed: 'fast',     best: 'Real-time X data access' },
  { name: 'Llama 4 Maverick',  org: 'Meta',      ctx: '1M',    inp: '$0.19', out: '$0.85', multi: true,  speed: 'fast',     best: 'Open-source general model' },
  { name: 'DeepSeek V3',       org: 'DeepSeek',  ctx: '128K',  inp: '$0.27', out: '$1.10', multi: false, speed: 'fast',     best: 'Low-cost code & reasoning' },
  { name: 'Devstral 2',        org: 'Mistral',   ctx: '256K',  inp: '$0.35', out: '$1.50', multi: false, speed: 'fastest',  best: 'Fastest coding agent' },
];

const TRENDING = [
  { badge: 'NEW',  badgeCls: 'new',  org: 'Anthropic',      name: 'Claude Opus 4.6 & Sonnet 4.6',         desc: 'Adaptive Thinking + 1M token context (beta). Most intelligent Claude for coding and agentic tasks.',    query: 'Tell me about Claude Opus 4.6' },
  { badge: '🔥 HOT', badgeCls: 'hot', org: 'Google DeepMind', name: 'Gemini 3.1 Pro — Thought Signatures',    desc: 'Thought Signatures bring new transparency to deep reasoning. 5M context for ultra-long documents.',        query: 'Tell me about Gemini 3.1 Pro' },
  { badge: '🤖 AGENT', badgeCls: 'agent', org: 'OpenAI',    name: 'GPT-5.4 — Native Agent Use',             desc: 'GPT-5.4 introduces native agent use: operates browsers, apps, and files autonomously.',                  query: 'Tell me about GPT-5.4' },
  { badge: '⚡ REAL-TIME', badgeCls: 'realtime', org: 'xAI', name: 'Grok-4 Fast — 4-Agent Architecture',   desc: '4-agent parallel processing with real-time X data and 2M context. Unique for real-time analysis.',         query: 'Tell me about Grok-4' },
  { badge: '🔓 OPEN',  badgeCls: 'open', org: 'Meta AI',    name: 'Llama 4 Maverick — 400B MoE',           desc: "Meta's 400B Mixture-of-Experts with native multimodal. Free to self-host, full commercial licence.",     query: 'Tell me about Llama 4' },
  { badge: '💻 CODE',  badgeCls: 'code', org: 'Mistral AI', name: 'Devstral 2 — Fastest Coding Agent',      desc: 'Mistral\'s coding agent with 256K context, multi-file edits, and codebase navigation. Blazing fast.',    query: 'Tell me about Devstral 2' },
];

const BUDGET_TIERS = [
  { tier: 'Free & Open Source', price: '$0',    accent: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', models: 'Llama 4 Maverick, Gemma 3, DeepSeek V3, Mistral 7B', count: 47 },
  { tier: 'Budget — <$0.50/M',  price: '$0–.5', accent: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', models: 'Claude Haiku 4.5, Gemini Flash, Nemotron Nano, Qwen3', count: 31 },
  { tier: 'Mid-Range — $1–5/M', price: '$1–5',  accent: '#f59e0b', bg: '#fffbeb', border: '#fde68a', models: 'Claude Sonnet 4.6, Gemini 3.1 Pro, GPT-5.4, Mistral Large', count: 28 },
  { tier: 'Premium — $5+/M',    price: '$5+',   accent: '#c8622a', bg: '#fdf1eb', border: '#fcd0b5', models: 'Claude Opus 4.6, Sora 2 Pro, gpt-image-1.5', count: 19 },
];

const USE_CASES = [
  { icon: '💻', label: 'Code Generation',   sub: 'Claude Opus 4.6 · Devstral 2 · GPT-5.4',       query: 'Help me with code generation' },
  { icon: '🎨', label: 'Image Generation',  sub: 'gpt-image-1.5 · Grok-Imagine · Gemini Flash Image', query: 'Create an image for me' },
  { icon: '🤖', label: 'AI Agents',         sub: 'GPT-5.4 · Claude Opus 4.6 · Grok-4 Fast',       query: 'Build an AI agent for me' },
  { icon: '📄', label: 'Document Analysis', sub: 'Claude Sonnet 4.6 · Gemini 3.1 Pro · GPT-5.4',   query: 'Analyze this document for me' },
  { icon: '🎬', label: 'Video Generation',  sub: 'Sora 2 Pro · Veo 3.1 · Grok-Imagine-Video',     query: 'Generate a video for me' },
  { icon: '🔊', label: 'Voice & Audio',     sub: 'Gemini-TTS · ElevenLabs · Whisper v3',           query: 'Add voice and audio to my project' },
  { icon: '🌍', label: 'Multilingual',      sub: 'Qwen3-Max (119 langs) · Gemini Flash-Lite · GLM', query: 'Translate content for global markets' },
  { icon: '🔢', label: 'Math & Research',   sub: 'DeepSeek-R1 · QwQ-32B · Gemini 3.1 Pro',        query: 'Help me with math and research' },
];

const FEATURES = [
  { icon: '🧭', title: 'Guided Discovery Chat',    desc: "Tell us your goals — we'll ask questions and recommend the perfect model. No overwhelming lists." },
  { icon: '📐', title: 'Prompt Engineering Guide', desc: 'Every model includes tailored prompt templates and examples so you get the best output from day one.' },
  { icon: '🤖', title: 'Agent Builder',            desc: 'Step-by-step agent creation guides — system prompts, tool config, memory setup, and deployment.' },
  { icon: '💰', title: 'Flexible Pricing',          desc: 'Free tiers, pay-per-use, subscriptions, and enterprise plans. Transparent pricing, no hidden fees.' },
  { icon: '⭐', title: 'User Reviews & Ratings',    desc: 'Verified reviews from real builders, benchmark scores, and I/O specs to help you choose confidently.' },
  { icon: '🔬', title: 'Research Feed',             desc: 'Daily curated AI research, model releases, and breakthroughs from top labs — stay ahead of the curve.' },
];

/* ─── Intersection-observer hook for reveal animations ─── */
function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─────────────────── Component ─────────────────── */
export default function LandingPage({ onLaunch, onSelectModel, onOpenModal, onToast }: LandingPageProps) {
  const [email, setEmail] = useState('');

  const featuredModels = MODELS.slice(0, 6);

  /* section reveal refs */
  const featuredRv  = useReveal();
  const featuresRv  = useReveal();
  const labsRv      = useReveal();
  const cmpRv       = useReveal();
  const trendRv     = useReveal();
  const budgetRv    = useReveal();
  const usecaseRv   = useReveal();

  return (
    <div className={styles.page}>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className={styles.hero}>
        {/* Animated mesh bg */}
        <div className={styles.heroMesh} aria-hidden="true"/>
        <div className={styles.heroGrid} aria-hidden="true"/>

        <div className={styles.eyebrow}>
          <span className={styles.liveDot} aria-hidden="true"/>
          <span>347 models live</span>
          <span className={styles.eyebrowSep}>·</span>
          <span>Updated daily</span>
        </div>

        <h1 className={styles.heroTitle}>
          Find your perfect<br/>
          <span className={styles.accentGradient}>AI model</span><br/>
          with guided discovery
        </h1>

        <p className={styles.heroSub}>
          You don&apos;t need to know anything about AI to get started.{' '}
          Just click the box below — we&apos;ll do the rest together. ✨
        </p>

        <HeroSearch onLaunch={onLaunch} onToast={onToast} />

        {/* Quick action tiles — MUI reusable component */}
        <ActionTiles onLaunch={onLaunch} />

        {/* Stats strip */}
        <div className={styles.statsRow} role="list">
          {STATS.map((s, i) => (
            <div key={s.label} className={styles.stat} style={{ animationDelay: `${0.6 + i * 0.08}s` }} role="listitem">
              <span className={styles.statIcon} aria-hidden="true">{s.icon}</span>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FEATURED MODELS ══════════════════ */}
      <section
        ref={featuredRv.ref as React.RefObject<HTMLElement>}
        className={`${styles.section} ${styles.altBg} ${featuredRv.visible ? styles.revealed : ''}`}
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Handpicked for you</p>
            <h2 className={styles.sectionTitle}>Featured Models</h2>
          </div>
          <button className={styles.secLink} onClick={() => onLaunch('Browse all AI models')}>
            Browse all 525 →
          </button>
        </div>
        <div className={styles.modelsGrid}>
          {featuredModels.map(m => (
            <ModelCard key={m.id} model={m} onSelect={onSelectModel} onOpenModal={onOpenModal} />
          ))}
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section
        ref={featuresRv.ref as React.RefObject<HTMLElement>}
        className={`${styles.section} ${featuresRv.visible ? styles.revealed : ''}`}
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Everything you need</p>
            <h2 className={styles.sectionTitle}>Built for every builder</h2>
          </div>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={styles.featureCard} style={{ animationDelay: `${i * 0.07}s` }}>
              <span className={styles.featureIcon} aria-hidden="true">{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
              <div className={styles.featureHoverBar} aria-hidden="true"/>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ AI LABS ══════════════════ */}
      <section
        ref={labsRv.ref as React.RefObject<HTMLElement>}
        className={`${styles.section} ${styles.altBg} ${labsRv.visible ? styles.revealed : ''}`}
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>28 labs and counting</p>
            <h2 className={styles.sectionTitle}>Browse by AI Lab</h2>
          </div>
          <button className={styles.secLink} onClick={() => onLaunch('Show all AI labs')}>See all labs →</button>
        </div>
        <div className={styles.labsGrid}>
          {LABS.map((lab, i) => (
            <button
              key={lab.name}
              className={styles.labCard}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => onLaunch(`Show models from ${lab.name}`)}
            >
              <span className={styles.labEmoji} aria-hidden="true" style={{ color: lab.color }}>{lab.emoji}</span>
              <span className={styles.labName}>{lab.name}</span>
              <span className={styles.labSub}>{lab.sub}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════ COMPARISON TABLE ══════════════════ */}
      <section
        ref={cmpRv.ref as React.RefObject<HTMLElement>}
        className={`${styles.section} ${cmpRv.visible ? styles.revealed : ''}`}
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Side by side</p>
            <h2 className={styles.sectionTitle}>Flagship Model Comparison</h2>
          </div>
          <button className={styles.secLink} onClick={() => onLaunch('Compare all AI models')}>Compare all →</button>
        </div>
        <p className={styles.cmpNote}>Input/Output prices per 1M tokens. * Beta pricing may change.</p>
        <div className={styles.tableWrap}>
          <table className={styles.cmpTable}>
            <thead>
              <tr>
                <th>Model</th><th>Context</th><th>Input $/M</th><th>Output $/M</th>
                <th>Multimodal</th><th>Speed</th><th>Best for</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((m, i) => (
                <tr key={i} onClick={() => onLaunch(`Tell me about ${m.name}`)} tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onLaunch(`Tell me about ${m.name}`)}>
                  <td>
                    <div className={styles.cmpModel}>
                      <strong>{m.name}</strong>
                      <span className={styles.cmpOrg}>{m.org}</span>
                    </div>
                  </td>
                  <td><span className={styles.ctxChip}>{m.ctx}</span></td>
                  <td className={styles.priceIn}>{m.inp}</td>
                  <td className={styles.priceOut}>{m.out}</td>
                  <td className={styles.multiCell}>{m.multi ? '✅' : '—'}</td>
                  <td><span className={`${styles.speedChip} ${styles[('speed_' + m.speed.replace('-', '')) as keyof typeof styles]}`}>{m.speed}</span></td>
                  <td className={styles.bestFor}>{m.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ══════════════════ TRENDING ══════════════════ */}
      <section
        ref={trendRv.ref as React.RefObject<HTMLElement>}
        className={`${styles.section} ${styles.altBg} ${trendRv.visible ? styles.revealed : ''}`}
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>What&apos;s happening now</p>
            <h2 className={styles.sectionTitle}>🔥 Trending This Week</h2>
          </div>
          <button className={styles.secLink} onClick={() => onLaunch('Show trending models')}>View research feed →</button>
        </div>
        <div className={styles.trendGrid}>
          {TRENDING.map((t, i) => (
            <button key={i} className={styles.trendCard} style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => onLaunch(t.query)}>
              <div className={styles.trendTop}>
                <span className={`${styles.trendBadge} ${styles[('badge_' + t.badgeCls) as keyof typeof styles]}`}>{t.badge}</span>
                <span className={styles.trendOrg}>{t.org}</span>
              </div>
              <h3 className={styles.trendName}>{t.name}</h3>
              <p className={styles.trendDesc}>{t.desc}</p>
              <span className={styles.trendCta}>Learn more →</span>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════ BUDGET ══════════════════ */}
      <section
        ref={budgetRv.ref as React.RefObject<HTMLElement>}
        className={`${styles.section} ${budgetRv.visible ? styles.revealed : ''}`}
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Right model for your budget</p>
            <h2 className={styles.sectionTitle}>Find Models by Budget</h2>
          </div>
        </div>
        <div className={styles.budgetGrid}>
          {BUDGET_TIERS.map((b, i) => (
            <button key={i} className={styles.budgetCard}
              style={{ '--accent': b.accent, '--bg': b.bg, '--border': b.border, animationDelay: `${i * 0.07}s` } as React.CSSProperties}
              onClick={() => onLaunch(`Show ${b.tier} models`)}>
              <div className={styles.budgetTierLabel}>{b.tier}</div>
              <div className={styles.budgetPrice}>{b.price}<span className={styles.budgetPer}>/1M tokens</span></div>
              <p className={styles.budgetModels}>{b.models}</p>
              <div className={styles.budgetFooter}>
                <span className={styles.budgetCount}>{b.count} models</span>
                <span className={styles.budgetArrow}>→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════ USE CASES ══════════════════ */}
      <section
        ref={usecaseRv.ref as React.RefObject<HTMLElement>}
        className={`${styles.section} ${styles.altBg} ${usecaseRv.visible ? styles.revealed : ''}`}
      >
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Jump right in</p>
            <h2 className={styles.sectionTitle}>Quick-Start by Use Case</h2>
          </div>
        </div>
        <div className={styles.useCaseGrid}>
          {USE_CASES.map((u, i) => (
            <button key={i} className={styles.useCaseCard} style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => onLaunch(u.query)}>
              <span className={styles.useCaseIcon} aria-hidden="true">{u.icon}</span>
              <div className={styles.useCaseBody}>
                <span className={styles.useCaseLabel}>{u.label}</span>
                <span className={styles.useCaseSub}>{u.sub}</span>
              </div>
              <span className={styles.useCaseArrow} aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════ NEWSLETTER ══════════════════ */}
      <section className={styles.newsletter}>
        <div className={styles.nlGlow} aria-hidden="true"/>
        <div className={styles.nlInner}>
          <p className={styles.nlEyebrow}>✦ Stay ahead of the curve</p>
          <h2 className={styles.nlTitle}>
            New models drop every week.<br/>
            <span className={styles.nlAccent}>Don&apos;t miss a release.</span>
          </h2>
          <p className={styles.nlSub}>
            Weekly digest: new releases, benchmark comparisons, pricing changes,
            and prompt engineering tips — straight to your inbox.
          </p>
          <div className={styles.nlForm}>
            <input
              className={styles.nlInput}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onToast('✅ Subscribed! Welcome to NexusAI Weekly.'); }}
              aria-label="Email address"
            />
            <button
              className={styles.nlBtn}
              onClick={() => { if (email) onToast('✅ Subscribed! Welcome to NexusAI Weekly.'); else onToast('Please enter your email first.'); }}
            >
              Subscribe free →
            </button>
          </div>
          <p className={styles.nlNote}>No spam. Unsubscribe any time. Trusted by 82K+ builders.</p>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <div className={styles.footerLogoMark}>
                <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1 L13 7 L7 13 L1 7 Z"/></svg>
              </div>
              <span>NexusAI</span>
            </div>
            <p className={styles.footerTagline}>The AI model marketplace for every builder.</p>
            <div className={styles.footerSocials}>
              {['𝕏', 'in', '⭑'].map(s => (
                <button key={s} className={styles.socialBtn} onClick={() => onToast('Coming soon!')}>{s}</button>
              ))}
            </div>
          </div>

          <div className={styles.footerCols}>
            <div className={styles.footerCol}>
              <h4>Product</h4>
              <a href="#" onClick={e => { e.preventDefault(); onLaunch('Browse all models'); }}>Models</a>
              <a href="#" onClick={e => { e.preventDefault(); onLaunch('Browse by AI Lab'); }}>Labs</a>
              <a href="#" onClick={e => { e.preventDefault(); onLaunch('Compare AI models'); }}>Compare</a>
              <a href="#" onClick={e => { e.preventDefault(); onLaunch('Build an AI agent'); }}>Agents</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Resources</h4>
              <a href="#">API Docs</a>
              <a href="#">Research Feed</a>
              <a href="#">Prompt Library</a>
              <a href="#">Changelog</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2026 NexusAI. All rights reserved.</span>
          <span className={styles.footerStatus}>
            <span className={styles.footerDot}/>
            All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}
