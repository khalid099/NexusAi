'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  AutoAwesomeRounded,
  BookmarkBorderRounded,
  CopyAllRounded,
  IosShareRounded,
  ScienceRounded
} from '@mui/icons-material';
import { apiRequest } from '@/lib/auth';
import { RESEARCH_POSTS, type ResearchPost } from '@/lib/mock-data/research';
import styles from './ResearchView.module.css';

interface ResearchViewProps {
  onToast: (msg: string) => void;
  onDiscuss?: (prompt: string) => void;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Reasoning', label: 'Reasoning' },
  { id: 'Multimodal', label: 'Multimodal' },
  { id: 'Alignment', label: 'Alignment' },
  { id: 'Efficiency', label: 'Efficiency' },
  { id: 'Open Source', label: 'Open Weights' },
];

const KEY_FINDINGS: Record<string, string[]> = {
  'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks': [
    'The model posts breakthrough reasoning performance on competition-grade math and science evaluations.',
    'Long-context retrieval and structured planning both improve over the prior generation.',
    'The paper highlights stronger chain-of-thought reliability under complex benchmark conditions.',
    'Results suggest a new frontier for research assistants, coding copilots, and tool-using agents.',
  ],
  'Scaling laws for multimodal models: new empirical findings': [
    'The paper shows multimodal gains taper earlier than expected as model size increases.',
    'Vision-language fusion quality depends heavily on dataset balance, not just total scale.',
    'A smaller but cleaner dataset can outperform a larger mixed-quality corpus in downstream tasks.',
    'The authors recommend architecture-aware scaling rather than brute-force compute increases.',
  ],
  'Claude Opus 4.6 sets new standard for instruction following': [
    'Opus 4.6 follows long, nested instructions with better consistency than earlier Claude variants.',
    'The release improves role adherence, formatting precision, and multi-turn memory stability.',
    'Performance gains are especially visible in enterprise writing and agent workflows.',
    'The results position Opus 4.6 as a premium option for controlled high-stakes outputs.',
  ],
  'Llama 4 Scout: open-weights model competitive with GPT-5.4': [
    'Meta pushes open-weight performance closer to top closed models on practical product tasks.',
    'The architecture improves multimodal grounding while keeping self-hosting attractive.',
    'Open deployment lowers cost and expands fine-tuning options for internal teams.',
    'The paper reinforces open models as viable for enterprise copilots and research systems.',
  ],
  'The hidden cost of AI hallucinations in enterprise workflows': [
    'Hallucinations create measurable rework across legal, finance, and documentation-heavy teams.',
    'The paper quantifies time overhead created by verification and manual correction loops.',
    'Structured review layers meaningfully reduce downstream operational cost.',
    'The findings support product patterns that emphasize traceability and evidence display.',
  ],
  'GPT-5.4 now supports native agent orchestration': [
    'Native orchestration reduces glue code needed for multi-step agent workflows.',
    'The framework improves tool routing, delegation, and state continuity.',
    'Parallel sub-task execution cuts time-to-answer for broad research prompts.',
    'This release strengthens the case for productized multi-agent UX layers.',
  ],
};

const MODEL_REFERENCES: Record<string, string[]> = {
  'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks': ['Gemini 2.5 Pro', 'Gemini Flash', 'Gemma 3'],
  'Scaling laws for multimodal models: new empirical findings': ['GPT-5.4', 'Gemini 2.5 Pro', 'Claude Opus 4.6'],
  'Claude Opus 4.6 sets new standard for instruction following': ['Claude Opus 4.6', 'Claude Sonnet 4.6', 'Claude Haiku 4.5'],
  'Llama 4 Scout: open-weights model competitive with GPT-5.4': ['Llama 4 Scout', 'Llama 4 Maverick', 'GPT-5.4'],
  'The hidden cost of AI hallucinations in enterprise workflows': ['Claude Opus 4.6', 'GPT-5.4', 'Gemini 2.5 Pro'],
  'GPT-5.4 now supports native agent orchestration': ['GPT-5.4', 'GPT-4o', 'Claude Opus 4.6'],
};

const IMPACT_NOTES: Record<string, string> = {
  'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks': 'High impact for advanced reasoning assistants, benchmark-driven procurement, and complex analytical workflows.',
  'Scaling laws for multimodal models: new empirical findings': 'Important for frontier model builders deciding where to spend multimodal training budgets.',
  'Claude Opus 4.6 sets new standard for instruction following': 'Strong product impact for enterprise agents that depend on faithful task execution and formatting.',
  'Llama 4 Scout: open-weights model competitive with GPT-5.4': 'Strategic impact for teams choosing between self-hosted infrastructure and closed APIs.',
  'The hidden cost of AI hallucinations in enterprise workflows': 'Critical operational signal for teams deploying AI into compliance-heavy environments.',
  'GPT-5.4 now supports native agent orchestration': 'High leverage update for product teams building agent-first experiences and workflow automation.',
};

const OVERVIEW_STATS: Record<string, Array<{ value: string; label: string }>> = {
  'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks': [
    { value: '83.2%', label: 'AIME 2025 score' },
    { value: '+6.4%', label: 'vs prior SOTA' },
    { value: '5M ctx', label: 'Context window' },
  ],
  'Scaling laws for multimodal models: new empirical findings': [
    { value: '3.1x', label: 'Data efficiency delta' },
    { value: 'Earlier plateau', label: 'Scaling signal' },
    { value: 'Vision + text', label: 'Primary scope' },
  ],
  'Claude Opus 4.6 sets new standard for instruction following': [
    { value: '+40%', label: 'Instruction reliability' },
    { value: '200K', label: 'Context window' },
    { value: 'Enterprise', label: 'Primary impact' },
  ],
  'Llama 4 Scout: open-weights model competitive with GPT-5.4': [
    { value: '128K', label: 'Context window' },
    { value: 'Open weights', label: 'License mode' },
    { value: 'Near parity', label: 'Benchmark signal' },
  ],
  'The hidden cost of AI hallucinations in enterprise workflows': [
    { value: '18%', label: 'Time overhead' },
    { value: 'High risk', label: 'Workflow exposure' },
    { value: 'Review layers', label: 'Recommended fix' },
  ],
  'GPT-5.4 now supports native agent orchestration': [
    { value: 'Native', label: 'Orchestration mode' },
    { value: 'Parallel', label: 'Task execution' },
    { value: 'Agent-first', label: 'Product fit' },
  ],
};

function buildCitation(post: ResearchPost) {
  return `${post.org} (${post.date}). "${post.title}". ${post.summary}`;
}

export default function ResearchView({ onToast, onDiscuss }: ResearchViewProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [posts, setPosts] = useState<ResearchPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const data = await apiRequest<ResearchPost[]>('/research/posts');
        if (!active) return;
        setPosts(data);
        setSelectedTitle((current) => current || data[0]?.title || '');
      } catch {
        if (!active) return;
        setPosts(RESEARCH_POSTS);
        setSelectedTitle((current) => current || RESEARCH_POSTS[0]?.title || '');
        onToast('Research feed fallback loaded');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, [onToast]);

  const filteredPosts = useMemo(() => (
    posts.filter((post) => {
      if (activeFilter === 'all') return true;

      const normalizedTag = (post.tag ?? '').toLowerCase();
      const normalizedFilter = activeFilter.toLowerCase();

      if (normalizedTag === normalizedFilter) return true;
      if (normalizedFilter === 'open weights' && (normalizedTag === 'open source' || normalizedTag === 'open weights')) return true;

      return false;
    })
  ), [activeFilter, posts]);

  const activePost = useMemo(() => {
    if (filteredPosts.length > 0) {
      return filteredPosts.find((post) => post.title === selectedTitle) ?? filteredPosts[0];
    }

    if (isLoading && posts.length === 0) {
      return RESEARCH_POSTS[0];
    }

    return undefined;
  }, [filteredPosts, isLoading, posts.length, selectedTitle]);

  const hasFilteredPosts = filteredPosts.length > 0;

  const activeFindings = activePost ? KEY_FINDINGS[activePost.title] ?? [] : [];
  const activeModels = activePost ? MODEL_REFERENCES[activePost.title] ?? [] : [];
  const overviewStats = activePost ? OVERVIEW_STATS[activePost.title] ?? [] : [];
  const citation = activePost ? buildCitation(activePost) : '';
  const discussPrompt = activePost
    ? `Discuss this research paper with me: "${activePost.title}" by ${activePost.org}. Summary: ${activePost.summary}`
    : '';

  return (
    <div className={styles.wrapper}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <h1>AI Research Feed</h1>
          <p>Curated breakthroughs with a premium reading layout and faster decision context.</p>
        </div>

        <div className={styles.topActions}>
          <div className={styles.weekBadge}>
            <span className={styles.dot} />
            {filteredPosts.length} papers this week
          </div>
          <button className={styles.subscribeBtn} onClick={() => onToast('Research subscription coming soon')}>
            Subscribe
          </button>
        </div>
      </header>

      <div className={styles.filterRow}>
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            className={`${styles.filterChip} ${activeFilter === filter.id ? styles.filterChipActive : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <aside className={styles.feedRail}>
          {hasFilteredPosts ? (
            filteredPosts.map((post, index) => (
              <button
                key={post.title}
                className={`${styles.feedItem} ${activePost?.title === post.title ? styles.feedItemActive : ''}`}
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => setSelectedTitle(post.title)}
              >
                <div className={styles.feedDate}>
                  <span>{post.date.split(' ')[0]}</span>
                  <strong>{post.date.split(' ')[1]}</strong>
                </div>

                <div className={styles.feedCopy}>
                  <div className={styles.feedMeta}>
                    <span>{post.org}</span>
                    {post.tag && <span className={styles.feedTag}>{post.tag}</span>}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                </div>
              </button>
            ))
          ) : (
            <div className={styles.emptyRail}>
              <strong>No papers in this filter</strong>
              <p>Try another category or switch back to `All` to see the full research feed.</p>
            </div>
          )}
        </aside>

        <main className={styles.detailPane}>
          {activePost ? (
            <>
              <section className={styles.heroCard}>
                <div className={styles.heroGlow} />
                <div className={styles.paperMeta}>
                  <span>{activePost.org}</span>
                  <span>|</span>
                  <span>{activePost.date}, 2026</span>
                  {activePost.tag && <span className={styles.paperBadge}>{activePost.tag.toUpperCase()}</span>}
                </div>

                <h2>{activePost.title}</h2>
                <p className={styles.paperSummary}>{activePost.summary}</p>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionLabel}>Overview</div>
                <p className={styles.overviewCopy}>
                  {activePost.org}&apos;s {activePost.title.toLowerCase()} signals a notable shift in frontier model performance and product strategy.
                  This brief is designed to highlight the result, why it matters, and which model decisions it should influence.
                </p>
                <div className={styles.overviewStats}>
                  {overviewStats.map((stat) => (
                    <div key={stat.label} className={styles.overviewStat}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionLabel}>Key Findings</div>
                <div className={styles.findingList}>
                  {activeFindings.map((finding, index) => (
                    <div key={finding} className={styles.findingItem} style={{ animationDelay: `${index * 70}ms` }}>
                      <span className={styles.findingIndex}>{index + 1}.</span>
                      <p>{finding}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.metaGrid}>
                <div className={styles.sectionCard}>
                  <div className={styles.sectionLabel}>Models Referenced</div>
                  <div className={styles.pillRow}>
                    {activeModels.map((model) => (
                      <span key={model} className={styles.modelPill}>
                        <ScienceRounded sx={{ fontSize: 15 }} />
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.sectionCard}>
                  <div className={styles.sectionLabel}>Impact Assessment</div>
                  <div className={styles.impactBox}>
                    <AutoAwesomeRounded sx={{ fontSize: 18 }} />
                    <p>{IMPACT_NOTES[activePost.title]}</p>
                  </div>
                </div>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionLabel}>Citation</div>
                <div className={styles.citationBox}>
                  <p>{citation}</p>
                  <button
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(citation);
                      onToast('Citation copied');
                    }}
                  >
                    <CopyAllRounded sx={{ fontSize: 16 }} />
                    Copy
                  </button>
                </div>
              </section>

              <div className={styles.actionBar}>
                <button
                  className={styles.discussBtn}
                  onClick={() => {
                    if (onDiscuss) {
                      onDiscuss(discussPrompt);
                      return;
                    }
                    onToast('Opening discussion in Chat Hub soon');
                  }}
                >
                  Discuss in Chat Hub
                </button>
                <div className={styles.utilityActions}>
                  <button className={styles.utilityBtn} onClick={() => onToast('Saved to your reading list')}>
                    <BookmarkBorderRounded sx={{ fontSize: 18 }} />
                    Save
                  </button>
                  <button className={styles.utilityBtn} onClick={() => onToast('Share sheet coming soon')}>
                    <IosShareRounded sx={{ fontSize: 18 }} />
                    Share
                  </button>
                </div>
              </div>
            </>
          ) : (
            <section className={`${styles.sectionCard} ${styles.emptyState}`}>
              <div className={styles.sectionLabel}>No Research Available</div>
              <h2>No papers match this filter</h2>
              <p>Is category mein abhi backend se koi research post nahi aa rahi. Doosra filter select karo ya `All` par wapas jao.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
