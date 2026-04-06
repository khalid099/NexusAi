'use client';
import { useState } from 'react';
import { MODELS } from '@/lib/mock-data';
import styles from './ModelModal.module.css';

interface ModelModalProps {
  modelId: string | null;
  defaultTab?: string;
  onClose: () => void;
  onChat: (modelId: string) => void;
  onToast: (msg: string) => void;
}

type Tab = 'overview' | 'guide' | 'pricing' | 'prompt' | 'agent' | 'reviews';

export default function ModelModal({ modelId, defaultTab = 'overview', onClose, onChat, onToast }: ModelModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab as Tab);
  const model = MODELS.find(m => m.id === modelId);
  if (!model) return null;

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.icon} style={{ background: model.iconBg }}>{model.icon}</div>
          <div className={styles.titleBlock}>
            <h2>{model.name}</h2>
            <p>by {model.org} · {model.tags[0]?.label} model</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge badge-${model.badge}`}>{model.badge}</span>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(['overview','guide','pricing','prompt','agent','reviews'] as Tab[]).map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabOn : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>
          {tab === 'overview' && (
            <div>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <h4>Description</h4>
                  <p>{model.desc}</p>
                </div>
                <div className={styles.detailCard}>
                  <h4>Specs</h4>
                  <p><strong>Context:</strong> {model.ctx} tokens<br/>
                  <strong>Latency:</strong> {model.latency}<br/>
                  <strong>Price:</strong> {model.price}</p>
                </div>
              </div>
              {(model.mmlu || model.humaneval) && (
                <div className={styles.detailCard} style={{ marginTop: '1rem' }}>
                  <h4>Benchmarks</h4>
                  <div className={styles.benchGrid}>
                    {model.mmlu && <div className={styles.benchItem}><strong>{model.mmlu}</strong><span>MMLU</span></div>}
                    {model.humaneval && <div className={styles.benchItem}><strong>{model.humaneval}</strong><span>HumanEval</span></div>}
                    {model.math && <div className={styles.benchItem}><strong>{model.math}</strong><span>MATH</span></div>}
                    <div className={styles.benchItem}><strong>{model.rating}⭐</strong><span>Rating</span></div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => { onChat(model.id); onClose(); }}>
                  Chat with {model.name} →
                </button>
                <button className="btn btn-ghost" onClick={() => onToast('API docs coming soon!')}>
                  View API docs
                </button>
              </div>
            </div>
          )}

          {tab === 'guide' && (
            <div>
              <h4 style={{ fontFamily: "'Syne',sans-serif", marginBottom: '1rem' }}>How to Use {model.name}</h4>
              {[
                { n: 1, title: 'Get API Access', body: 'Sign up for NexusAI (free). Go to Settings → API Keys and create a new key.' },
                { n: 2, title: 'Choose your method', body: 'REST API, official SDK (Python/Node.js/Go), or no-code via Playground.' },
                { n: 3, title: 'Send your first request', body: `Call /v1/chat with model: "${model.id}" and your messages array.` },
                { n: 4, title: 'Optimise & scale', body: 'Use streaming for UX, cache repeated calls, set max_tokens to control costs.' },
              ].map(step => (
                <div key={step.n} className={styles.agentStep}>
                  <div className={styles.stepNum}>{step.n}</div>
                  <div><h5>{step.title}</h5><p>{step.body}</p></div>
                </div>
              ))}
            </div>
          )}

          {tab === 'pricing' && (
            <div>
              <h4 style={{ fontFamily: "'Syne',sans-serif", marginBottom: '1rem' }}>Pricing Plans</h4>
              <div className={styles.pricingGrid}>
                {[
                  { tier: 'Free', price: '$0', unit: '/month', feats: ['100 requests/day', '8K context', 'Community support'] },
                  { tier: 'Pro', price: '$19', unit: '/month', feats: ['10,000 requests/day', 'Full context window', 'Priority support', 'Analytics dashboard'], featured: true },
                  { tier: 'Enterprise', price: 'Custom', unit: '', feats: ['Unlimited requests', 'SLA guarantee', 'Dedicated instance', 'Custom fine-tuning'] },
                ].map(p => (
                  <div key={p.tier} className={`${styles.priceCard} ${p.featured ? styles.featured : ''}`}>
                    {p.featured && <div className={styles.featTag}>Most popular</div>}
                    <div className={styles.priceTier}>{p.tier}</div>
                    <div className={styles.priceAmt}>{p.price}</div>
                    <div className={styles.priceUnit}>{p.unit}</div>
                    <ul className={styles.priceFeats}>{p.feats.map(f => <li key={f}>{f}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'prompt' && (
            <div>
              <h4 style={{ fontFamily: "'Syne',sans-serif", marginBottom: '0.5rem' }}>Prompt Engineering Guide</h4>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1rem' }}>Best practices for getting great results from {model.name}.</p>
              {[
                { label: 'System prompt', code: `You are a helpful assistant specialising in [domain].\nAlways respond in [format].\nKeep responses [length].` },
                { label: 'Task prompt', code: `Task: [what you want]\nContext: [relevant background]\nFormat: [output structure]\nConstraints: [any limits]` },
              ].map(box => (
                <div key={box.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', marginBottom: '1rem', position: 'relative' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', fontWeight: 600, marginBottom: '0.5rem' }}>{box.label}</div>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--blue)', whiteSpace: 'pre-wrap', display: 'block', lineHeight: 1.6 }}>{box.code}</code>
                  <button style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.25rem 0.65rem', fontSize: '0.7rem', border: '1px solid var(--border2)', borderRadius: 6, background: 'var(--white)', cursor: 'pointer' }}
                    onClick={() => { navigator.clipboard.writeText(box.code); onToast('Copied to clipboard!'); }}>
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'agent' && (
            <div>
              <h4 style={{ fontFamily: "'Syne',sans-serif", marginBottom: '1rem' }}>Build an Agent with {model.name}</h4>
              {[
                { n: 1, title: 'Define your objective', body: 'What should the agent do? Be specific: "Summarise incoming emails and draft replies."' },
                { n: 2, title: 'Set up tools', body: 'Connect external APIs (search, database, calendar) using function calling.' },
                { n: 3, title: 'Write the system prompt', body: 'Give the agent a clear role, constraints, and output format.' },
                { n: 4, title: 'Test & iterate', body: 'Run the agent with test inputs. Check for hallucinations and edge cases.' },
                { n: 5, title: 'Deploy', body: 'Use NexusAI webhooks to trigger your agent from any event or schedule.' },
              ].map(step => (
                <div key={step.n} className={styles.agentStep}>
                  <div className={styles.stepNum}>{step.n}</div>
                  <div><h5>{step.title}</h5><p>{step.body}</p></div>
                </div>
              ))}
              <button className="btn btn-primary" onClick={() => onToast('Agent builder coming soon!')}>
                Launch Agent Builder →
              </button>
            </div>
          )}

          {tab === 'reviews' && (
            <div>
              {[
                { name: 'Sarah K.', role: 'Product Manager', rating: 5, text: `${model.name} has been a game changer for our team. The quality of outputs is consistently excellent.` },
                { name: 'Dev T.', role: 'Software Engineer', rating: 5, text: `Best model for code generation I've used. It understands context across large codebases.` },
                { name: 'Maria L.', role: 'Content Strategist', rating: 4, text: `Great for long-form content. Sometimes verbose but easy to guide with good prompts.` },
              ].map((r, i) => (
                <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{r.role}</div></div>
                    <span style={{ color: '#E8A020' }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text2)', lineHeight: 1.6 }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
