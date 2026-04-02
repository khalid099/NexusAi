'use client';
import { useState } from 'react';
import { MODELS, LABS } from '@/lib/models';
import { Model } from '@/lib/types';
import ModelCard from './ModelCard';
import styles from './Marketplace.module.css';

interface MarketplaceProps {
  onSelectModel: (model: Model) => void;
  onOpenModal: (modelId: string, tab?: string) => void;
  onToast: (msg: string) => void;
}

const FILTERS = ['all', 'language', 'vision', 'code', 'image', 'audio', 'open'];

export default function Marketplace({ onSelectModel, onOpenModal, onToast }: MarketplaceProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeLab, setActiveLab] = useState('');
  const [maxPrice, setMaxPrice] = useState(100);
  const [minRating, setMinRating] = useState(0);

  const filtered = MODELS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.org.toLowerCase().includes(search.toLowerCase()) ||
      m.desc.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || m.category.includes(filter) ||
      (filter === 'open' && m.badge === 'open');
    const matchLab = !activeLab || m.lab === activeLab;
    return matchSearch && matchFilter && matchLab;
  });

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Model Marketplace</span>
        <div className={styles.searchWrap}>
          <div className={styles.searchInner}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, color: 'var(--text3)', marginLeft: 12 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className={styles.searchInput} placeholder="Search models, capabilities…" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className={styles.filterRow}>
          {FILTERS.map(f => (
            <button key={f} className={`${styles.mfil} ${filter === f ? styles.mfilOn : ''}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Labs bar */}
      <div className={styles.labsBar}>
        <span className={styles.labsLbl}>AI Labs</span>
        <button className={`${styles.labPill} ${!activeLab ? styles.labOn : ''}`} onClick={() => setActiveLab('')}>
          🏛 All <span className={styles.labCount}>{MODELS.length}</span>
        </button>
        {LABS.map(lab => (
          <button key={lab.id} className={`${styles.labPill} ${activeLab === lab.id ? styles.labOn : ''}`}
            onClick={() => setActiveLab(activeLab === lab.id ? '' : lab.id)}>
            {lab.icon} {lab.name} <span className={styles.labCount}>{lab.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div style={{ background: 'var(--accent-lt)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '0.875rem', marginBottom: '1rem', cursor: 'pointer' }}
            onClick={() => onToast('Opening AI guide…')}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>✦ Need help choosing?</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.4 }}>Chat with our AI guide for a personalised recommendation in 60 seconds.</div>
          </div>
          {[
            { title: 'Provider', items: ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral'] },
            { title: 'Pricing Model', items: ['Pay-per-use', 'Subscription', 'Free tier', 'Enterprise'] },
          ].map(sec => (
            <div key={sec.title} className={styles.filterSec}>
              <div className={styles.filterTitle}>{sec.title}</div>
              {sec.items.map(item => (
                <label key={item} className={styles.mktCheck}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)', width: 13, height: 13, cursor: 'pointer' }} />
                  {item}
                </label>
              ))}
            </div>
          ))}
          <div className={styles.filterSec}>
            <div className={styles.filterTitle}>Quick Guides</div>
            {[
              { icon: '📐', text: 'Prompt tips', tab: 'prompt' },
              { icon: '🤖', text: 'Agent creation', tab: 'agent' },
              { icon: '💰', text: 'Pricing comparison', tab: 'pricing' },
            ].map(g => (
              <button key={g.text} className={styles.guideBtn} onClick={() => onOpenModal('gpt5', g.tab)}>
                {g.icon} {g.text}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
              No models match your search. Try different filters.
            </div>
          ) : filtered.map(m => (
            <ModelCard key={m.id} model={m} onSelect={onSelectModel} onOpenModal={onOpenModal} />
          ))}
        </div>
      </div>
    </div>
  );
}
