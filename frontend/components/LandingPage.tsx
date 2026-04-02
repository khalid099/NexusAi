'use client';
import { MODELS } from '@/lib/models';
import { Model } from '@/lib/types';
import HeroSearch from './HeroSearch';
import ModelCard from './ModelCard';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onLaunch: (query: string) => void;
  onSelectModel: (model: Model) => void;
  onOpenModal: (modelId: string) => void;
  onToast: (msg: string) => void;
}

const ACTION_TILES = [
  { icon: '🍊', label: 'Create image',    query: 'Create an image for me' },
  { icon: '🎵', label: 'Generate Audio',  query: 'Generate audio for me' },
  { icon: '🎬', label: 'Create video',    query: 'Create a video for me' },
  { icon: '📊', label: 'Create slides',   query: 'Create a slide deck for me' },
  { icon: '📐', label: 'Create Infographs', query: 'Create an infographic' },
  { icon: '❓', label: 'Create quiz',     query: 'Create a quiz for me' },
  { icon: '📁', label: 'Create Flashcards', query: 'Create flashcards for me' },
  { icon: '🧠', label: 'Create Mind map', query: 'Create a mind map for me' },
  { icon: '📈', label: 'Analyze Data',    query: 'Analyze data for me' },
  { icon: '✍️', label: 'Write content',   query: 'Help me write content' },
  { icon: '💻', label: 'Code Generation', query: 'Help me with code generation' },
  { icon: '📄', label: 'Document Analysis', query: 'Analyze a document for me' },
  { icon: '🌐', label: 'Translate',       query: 'Translate content for me' },
  { icon: '🔭', label: 'Just Exploring',  query: 'Help me explore AI models' },
];

const STATS = [
  { value: '525+', label: 'AI Models' },
  { value: '82K',  label: 'Builders' },
  { value: '28',   label: 'AI Labs' },
  { value: '4.8⭐', label: 'Avg Rating' },
];

const LABS_LIST = [
  { id: 'openai',    name: 'OpenAI',         icon: '⬛', color: '#000',     models: 'GPT-5.4, DALL·E 4, Whisper' },
  { id: 'anthropic', name: 'Anthropic',      icon: '✦',  color: '#C8622A',  models: 'Claude Opus 4.6, Haiku 4.5' },
  { id: 'google',   name: 'Google DeepMind', icon: '✶',  color: '#4285F4',  models: 'Gemini 2.5 Pro, Gemma 3' },
  { id: 'xai',      name: 'xAI',            icon: '✕',  color: '#111',     models: 'Grok-4, Grok-3' },
  { id: 'deepseek', name: 'DeepSeek',        icon: '🔷', color: '#1D6FE8',  models: 'R2, V3, Coder v3' },
  { id: 'mistral',  name: 'Mistral / Lama',  icon: '🌊', color: '#F5821F',  models: 'Large 3, Codestral' },
  { id: 'alibaba',  name: 'Alibaba (Qwen)',  icon: '🔶', color: '#FF6A00',  models: 'Qwen3, QVQ-Max' },
  { id: 'nvidia',   name: 'NVIDIA NIM',      icon: '🟢', color: '#76B900',  models: 'Llama-3.1, Phi-4' },
];

const COMPARISON_MODELS = [
  { name: 'GPT-5.4',           org: 'OpenAI',    icon: '🧠', live: true,  ctx: '1.05M', input: '$2.50', output: '$10',   multi: true,  speed: 'moderate', best: 'High-precision professional tasks' },
  { name: 'Claude Opus 4.6',   org: 'Anthropic', icon: '✦',  live: true,  ctx: '200K',  input: '$15',   output: '$75',   multi: true,  speed: 'moderate', best: 'Agents, advanced coding' },
  { name: 'Claude Sonnet 4.5', org: 'Anthropic', icon: '✦',  live: true,  ctx: '200K',  input: '$3',    output: '$15',   multi: true,  speed: 'fast',     best: 'Code tasks, prose writing' },
  { name: 'Claude Haiku 4.5',  org: 'Anthropic', icon: '✦',  live: true,  ctx: '200K',  input: '$0.25', output: '$1.25', multi: true,  speed: 'fastest',  best: 'Real-time, high-volume' },
  { name: 'Gemini 2.5 Pro',    org: 'Google',    icon: '✶',  live: true,  ctx: '2M',    input: '$7',    output: '$21',   multi: true,  speed: 'fast',     best: 'Long-context reasoning' },
  { name: 'Grok-4 Fast',       org: 'xAI',       icon: '✕',  live: false, ctx: '256K',  input: '$3',    output: '$15',   multi: true,  speed: 'fast',     best: 'Real-time data access' },
  { name: 'Llama 4 Maverick',  org: 'Meta',      icon: '🦙', live: false, ctx: '1M',    input: '$0.19', output: '$0.85', multi: true,  speed: 'fast',     best: 'Open-source general model' },
  { name: 'DeepSeek V3',       org: 'DeepSeek',  icon: '🔷', live: false, ctx: '128K',  input: '$0.27', output: '$1.10', multi: false, speed: 'fast',     best: 'Low-cost code & reasoning' },
];

const TRENDING = [
  { name: 'Claude Opus 4.6 & Sonnet 4.6', org: 'Anthropic', icon: '✦', iconBg: '#FDF1EB', badge: 'new',  desc: 'Anthropic\'s latest dual release with hybrid reasoning and 200K context.' },
  { name: 'Gemini 3 Pro — Thought Signatures', org: 'Google DeepMind', icon: '✶', iconBg: '#E8F5E9', badge: 'new',  desc: 'Google\'s breakthrough model with thought-chain transparency.' },
  { name: 'GPT-4.1 — Native Computer-Use Agents', org: 'OpenAI', icon: '🧠', iconBg: '#EEF2FD', badge: 'hot',  desc: 'OpenAI\'s computer-use capable agents using simplified fine-tuning.' },
  { name: 'Grok-4 → Fast 4-Agent Architecture', org: 'xAI', icon: '✕', iconBg: '#F5F5F5', badge: 'hot',  desc: 'xAI\'s 4-agent parallel processing system with real-time web access.' },
  { name: 'Llama 4 Maverick — pro8 MoE', org: 'Meta AI', icon: '🦙', iconBg: '#F0F4FF', badge: 'open', desc: 'Meta\'s mixture-of-experts model with 17B active params out of 400B total.' },
  { name: 'Devstral v1 — Frontend Coding Agent', org: 'Mistral AI', icon: '🌊', iconBg: '#F0F8FF', badge: 'beta', desc: 'The fastest coding agent optimised for frontend dev.' },
];

const BUDGET_TIERS = [
  { tier: 'Free & Open Source', price: '$0', color: '#22c55e', models: ['Llama 4 Scout', 'Gemma 3', 'DeepSeek V3', 'Mistral 7B'], count: 47 },
  { tier: 'Budget — Under $0.50/M', price: '$0–0.50', color: '#3b82f6', models: ['Claude Haiku 4.5', 'Gemini Flash', 'Qwen 3', 'GPT-4o Mini'], count: 31 },
  { tier: 'Mid-Range — $1–$5/M', price: '$1–5', color: '#f59e0b', models: ['Claude Sonnet 4.5', 'Gemini 2.5 Pro', 'GPT-4.1', 'Mistral Large'], count: 28 },
  { tier: 'Premium — $5+/M', price: '$5+', color: '#C8622A', models: ['Claude Opus 4.6', 'GPT-5.4', 'Gemini Ultra', 'o3'], count: 19 },
];

const USE_CASES = [
  { icon: '💻', label: 'Code Generation', models: 'Claude Opus 4.6, GPT-5.4, DeepSeek Coder v3', query: 'Help me with code generation' },
  { icon: '🎨', label: 'Image Generation', models: 'DALL·E 4, Stable Diffusion XL, Midjourney v7', query: 'Create an image for me' },
  { icon: '🤖', label: 'AI Agents', models: 'Claude 4.6, GPT-4.1, Grok-4 Fast', query: 'Build an AI agent' },
  { icon: '📄', label: 'Document Analysis', models: 'Gemini 2.5 Pro, Claude Opus, GPT-5.4', query: 'Analyze this document' },
  { icon: '🎬', label: 'Video Generation', models: 'Sora, Runway Gen-4, Kling v2', query: 'Generate a video' },
  { icon: '🌐', label: 'Multilingual / Translation', models: 'Gemini 2.5, DeepL, Mistral Large', query: 'Translate content for me' },
];

export default function LandingPage({ onLaunch, onSelectModel, onOpenModal, onToast }: LandingPageProps) {
  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.liveDot}/>
          347 models live · Updated daily
        </div>

        <h1 className={styles.heroTitle}>
          Find your perfect<br/>
          <span className={styles.accent}>AI model</span><br/>
          with guided discovery
        </h1>

        <p className={styles.heroSub}>
          You don&apos;t need to know anything about AI to get started. Just<br/>
          click the box below — we&apos;ll do the rest together. ✨
        </p>

        <HeroSearch onLaunch={onLaunch} onToast={onToast} />

        {/* Action tiles */}
        <div className={styles.tileGrid}>
          {ACTION_TILES.map(a => (
            <button key={a.label} className={styles.tile} onClick={() => onLaunch(a.query)}>
              <span className={styles.tileIcon}>{a.icon}</span>
              <span className={styles.tileLabel}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {STATS.map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED MODELS ── */}
      <section className={`${styles.section} ${styles.altBg}`}>
        <div className={styles.sectionHead}>
          <h2>Featured Models</h2>
          <span className={styles.secLink} onClick={() => onLaunch('Browse all models')}>View all →</span>
        </div>
        <div className={styles.modelsGrid}>
          {MODELS.slice(0, 6).map(m => (
            <ModelCard key={m.id} model={m} onSelect={onSelectModel} onOpenModal={onOpenModal} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}><h2>Built for every builder</h2></div>
        <div className={styles.featuresGrid}>
          {[
            { icon: '🔍', title: 'Guided Discovery', desc: 'Tell us your goals and we\'ll recommend the right model with the perfect prompt.' },
            { icon: '📐', title: 'Prompt Engineering', desc: 'Every model includes tailored prompt tips so you get the best output from day one.' },
            { icon: '🤖', title: 'Agent Builder', desc: 'Step-by-step agent creation for automation, agentic workflows and enterprise deployments.' },
            { icon: '💳', title: 'Flexible Pricing', desc: 'Free tiers, pay-per-use, and enterprise plans. Only pay for what you use.' },
            { icon: '⭐', title: 'User Reviews', desc: 'Verified reviews from real developers and businesses to help you choose with confidence.' },
            { icon: '📰', title: 'Research Feed', desc: 'Daily curated AI research news from labs, papers, and model releases.' },
          ].map(f => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI LABS ── */}
      <section className={`${styles.section} ${styles.altBg}`}>
        <div className={styles.sectionHead}>
          <h2>Browse by AI Lab</h2>
          <span className={styles.secLink} onClick={() => onLaunch('See all labs')}>See all →</span>
        </div>
        <div className={styles.labsGrid}>
          {LABS_LIST.map(lab => (
            <div key={lab.id} className={styles.labCard} onClick={() => onLaunch(`Models from ${lab.name}`)}>
              <div className={styles.labIcon} style={{ color: lab.color }}>{lab.icon}</div>
              <div className={styles.labName}>{lab.name}</div>
              <div className={styles.labModels}>{lab.models}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Flagship Model Comparison</h2>
          <span className={styles.secLink} onClick={() => onLaunch('Compare all models')}>Compare all →</span>
        </div>
        <p className={styles.compSubtitle}>Input/Output prices per 1M tokens.</p>
        <div className={styles.tableWrap}>
          <table className={styles.cmpTable}>
            <thead>
              <tr><th>Model</th><th>Live</th><th>Context</th><th>Input $/M</th><th>Output $/M</th><th>Multimodal</th><th>Speed</th><th>Best for</th></tr>
            </thead>
            <tbody>
              {COMPARISON_MODELS.map((m, i) => (
                <tr key={i} onClick={() => onLaunch(`Tell me about ${m.name}`)}>
                  <td><span className={styles.cmpIcon}>{m.icon}</span> <strong>{m.name}</strong><br/><span className={styles.cmpOrg}>{m.org}</span></td>
                  <td>{m.live ? <span className={styles.liveChip}>Live</span> : <span className={styles.betaChip}>Beta</span>}</td>
                  <td><span className={styles.ctxChip}>{m.ctx}</span></td>
                  <td className={styles.price}>{m.input}</td>
                  <td className={styles.price} style={{ color: '#c8622a' }}>{m.output}</td>
                  <td>{m.multi ? '✅' : '❌'}</td>
                  <td><span className={`${styles.speedChip} ${styles['speed_' + m.speed.replace('-','')]}`}>{m.speed}</span></td>
                  <td className={styles.bestFor}>{m.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className={`${styles.section} ${styles.altBg}`}>
        <div className={styles.sectionHead}>
          <h2>🔥 Trending This Week</h2>
          <span className={styles.secLink} onClick={() => onLaunch('Show trending models')}>View feed →</span>
        </div>
        <div className={styles.trendingGrid}>
          {TRENDING.map(t => (
            <div key={t.name} className={styles.trendCard} onClick={() => onLaunch(`Tell me about ${t.name}`)}>
              <div className={styles.trendHeader}>
                <div className={styles.trendIcon} style={{ background: t.iconBg }}>{t.icon}</div>
                <div>
                  <div className={styles.trendOrg}>{t.org}</div>
                  <div className={styles.trendName}>{t.name}</div>
                </div>
                <span className={`${styles.badge} ${styles['badge_' + t.badge]}`}>{t.badge}</span>
              </div>
              <p className={styles.trendDesc}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUDGET ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}><h2>Find Models by Budget</h2></div>
        <div className={styles.budgetGrid}>
          {BUDGET_TIERS.map(b => (
            <div key={b.tier} className={styles.budgetCard} style={{ borderTopColor: b.color }} onClick={() => onLaunch(`Show ${b.tier} models`)}>
              <div className={styles.budgetTier}>{b.tier}</div>
              <div className={styles.budgetPrice} style={{ color: b.color }}>{b.price}</div>
              <div className={styles.budgetModels}>{b.models.join(', ')}</div>
              <div className={styles.budgetCount}>{b.count} models available</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className={`${styles.section} ${styles.altBg}`}>
        <div className={styles.sectionHead}><h2>Quick-Start by Use Case</h2></div>
        <div className={styles.useCaseGrid}>
          {USE_CASES.map(u => (
            <div key={u.label} className={styles.useCaseCard} onClick={() => onLaunch(u.query)}>
              <div className={styles.useCaseIcon}>{u.icon}</div>
              <div>
                <div className={styles.useCaseLabel}>{u.label}</div>
                <div className={styles.useCaseModels}>{u.models}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className={styles.newsletter}>
        <div className={styles.nlInner}>
          <p className={styles.nlEyebrow}>STAY AHEAD OF THE CURVE</p>
          <h2>New models drop every week.<br/>Don&apos;t miss a release.</h2>
          <p className={styles.nlSub}>Weekly digest: new model releases, benchmark comparisons, pricing changes, and prompt tips — straight to your inbox.</p>
          <div className={styles.nlForm}>
            <input className={styles.nlInput} type="email" placeholder="your@email.com" />
            <button className={styles.nlBtn} onClick={() => onToast('Newsletter coming soon!')}>Subscribe free →</button>
          </div>
          <p className={styles.nlNote}>No spam. Unsubscribe any time. Trusted by 82K+ builders.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>NexusAI Model Marketplace</span>
        <div className={styles.footerLinks}>
          <a href="#">Models</a><a href="#">Research</a><a href="#">API</a>
          <a href="#">Privacy</a><a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
