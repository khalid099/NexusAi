'use client';
import { AGENT_TEMPLATES as TEMPLATES, TAG_COLORS as TAG_CLS } from '@/lib/mock-data';
import styles from './AgentBuilder.module.css';

interface AgentBuilderProps {
  onOpenModal: (modelId: string, tab?: string) => void;
  onChatAction: (msg: string) => void;
  onToast: (msg: string) => void;
}

export default function AgentBuilder({ onOpenModal, onChatAction, onToast }: AgentBuilderProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <div>
          <h2>Agent Builder</h2>
          <p>Create powerful AI agents using any model. Pick a template or start from scratch.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenModal('gpt5', 'agent')}>+ New Agent</button>
      </div>

      <div className={styles.helpBanner}>
        <div style={{ fontSize: '1.5rem' }}>✦</div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Not sure where to start?</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Chat with our AI guide — describe what you want your agent to do and get a personalised setup plan.</div>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
          onClick={() => onChatAction('Help me build an AI agent — walk me through it')}>
          Ask the Hub →
        </button>
      </div>

      <div className={styles.templatesLabel}>Agent Templates</div>

      <div className={styles.grid}>
        {TEMPLATES.map(t => (
          <div key={t.title} className={styles.templateCard} onClick={() => onOpenModal(t.model, 'agent')}>
            <div className={styles.templateIcon}>{t.icon}</div>
            <h4>{t.title}</h4>
            <p>{t.desc}</p>
            <div className={styles.templateTags}>
              {t.tags.map(tag => (
                <span key={tag} className={`tag ${TAG_CLS[tag] || 't-blue'}`}>{tag}</span>
              ))}
            </div>
            <div className={styles.templateCta}>Use template →</div>
          </div>
        ))}

        {/* Build from scratch */}
        <div className={styles.scratchCard} onClick={() => onOpenModal('gpt5', 'agent')}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div>
          <h4>Build from Scratch</h4>
          <p>Start with any model and a blank canvas — full control over every detail.</p>
        </div>
      </div>

      {/* Workflow steps */}
      <div className={styles.workflowSection}>
        <h3>How Agent Workflows Work</h3>
        <div className={styles.workflowSteps}>
          {[
            { n: 1, icon: '⚡', title: 'Trigger', desc: 'User input, schedule, webhook, or API call starts the workflow.' },
            { n: 2, icon: '🔍', title: 'Fetch Data', desc: 'Pull from external APIs, databases, or uploaded files.' },
            { n: 3, icon: '🧠', title: 'AI Processing', desc: 'Route to the best model via NexusAI\'s intelligent model router.' },
            { n: 4, icon: '📤', title: 'Generate Output', desc: 'Return results as text, JSON, email, webhook, or saved file.' },
          ].map(s => (
            <div key={s.n} className={styles.workflowStep}>
              <div className={styles.workflowNum}>{s.n}</div>
              <div className={styles.workflowIcon}>{s.icon}</div>
              <h5>{s.title}</h5>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
