'use client';
import { useState } from 'react';
import { CloseRounded } from '@mui/icons-material';
import { apiRequest, readAccessToken } from '@/lib/auth';
import styles from './AgentWizard.module.css';

interface AgentWizardProps {
  prefillName?: string;
  prefillDesc?: string;
  onClose: () => void;
  onCreated: () => void;
  onToast: (msg: string) => void;
}

// ── Step 1 data ──────────────────────────────────────────
const AGENT_TYPES = [
  { id: 'support',   icon: '🎧', label: 'Customer Support' },
  { id: 'research',  icon: '🔍', label: 'Research & Data' },
  { id: 'code',      icon: '💻', label: 'Code & Dev' },
  { id: 'sales',     icon: '🧳', label: 'Sales & CRM' },
  { id: 'content',   icon: '✍️',  label: 'Content & Writing' },
  { id: 'ops',       icon: '⚙️',  label: 'Operations' },
  { id: 'finance',   icon: '📊', label: 'Finance & Reports' },
  { id: 'other',     icon: '✳️',  label: 'Something else' },
];

const AUDIENCE_TYPES = [
  { id: 'customers',   label: 'Customers / end-users' },
  { id: 'team',        label: 'My team internally' },
  { id: 'me',          label: 'Just me' },
  { id: 'api',         label: 'Other systems / APIs' },
];

const OUTPUT_TYPES = [
  { id: 'text',    label: 'Text / reports' },
  { id: 'actions', label: 'Actions (send, update, create)' },
  { id: 'data',    label: 'Structured data / JSON' },
  { id: 'mixed',   label: 'Mixed' },
];

const TRIGGER_TYPES = [
  { id: 'manual',   label: 'Manual (user sends message)' },
  { id: 'schedule', label: 'Scheduled (cron)' },
  { id: 'webhook',  label: 'Webhook / API call' },
  { id: 'event',    label: 'Product event' },
];

const JOB_SUGGESTIONS = [
  'Answer customer questions and escalate unresolved issues',
  'Search the web and write structured research reports',
  'Review code for bugs and suggest improvements',
  'Draft emails, posts, and marketing content',
  'Summarise meetings and extract action items',
];

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly',     label: 'Friendly' },
  { id: 'concise',      label: 'Concise' },
  { id: 'detailed',     label: 'Detailed' },
  { id: 'casual',       label: 'Casual' },
];

const LANG_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'ur', label: 'Urdu' },
  { id: 'ar', label: 'Arabic' },
  { id: 'fr', label: 'French' },
  { id: 'es', label: 'Spanish' },
  { id: 'de', label: 'German' },
];

// ── Step 3 data ──────────────────────────────────────────
const TOOL_OPTIONS = [
  { id: 'web_search',  icon: '🌐', label: 'Web Search',        desc: 'Search the internet for up-to-date info' },
  { id: 'code_exec',   icon: '⚡', label: 'Code Execution',    desc: 'Run Python, JS, shell scripts' },
  { id: 'file_read',   icon: '📁', label: 'File Reader',       desc: 'Read PDFs, CSVs, docs uploaded by user' },
  { id: 'email',       icon: '📧', label: 'Email',             desc: 'Send and read emails via Gmail / Outlook' },
  { id: 'calendar',    icon: '📅', label: 'Calendar',          desc: 'Create events, check availability' },
  { id: 'crm',         icon: '📋', label: 'CRM',               desc: 'Read and update Salesforce / HubSpot' },
  { id: 'slack',       icon: '💬', label: 'Slack',             desc: 'Post messages, read channels' },
  { id: 'database',    icon: '🗄️', label: 'Database',          desc: 'Query internal SQL / NoSQL databases' },
  { id: 'image_gen',   icon: '🖼️', label: 'Image Generation',  desc: 'Generate images via DALL-E / Stable Diffusion' },
];

// ── Step 4 data ──────────────────────────────────────────
const MEMORY_OPTIONS = [
  { id: 'none',      label: 'No memory',          desc: 'Each session starts fresh' },
  { id: 'session',   label: 'Session memory',      desc: 'Remembers context within one conversation' },
  { id: 'user',      label: 'Per-user memory',     desc: 'Remembers each user across sessions' },
  { id: 'global',    label: 'Shared memory',        desc: 'All users share a knowledge base' },
];

// ── Step 6 data ──────────────────────────────────────────
const DEPLOY_TARGETS = [
  { id: 'web',     icon: '🌐', label: 'Web Widget',     desc: 'Embed on any website' },
  { id: 'api',     icon: '⚡', label: 'REST API',        desc: 'Call via HTTP from your app' },
  { id: 'slack',   icon: '💬', label: 'Slack Bot',       desc: 'Deploy to a Slack workspace' },
  { id: 'email',   icon: '📧', label: 'Email Assistant', desc: 'Respond to incoming emails' },
];

const MODEL_OPTIONS = [
  { id: 'claude-opus-4-6',   label: 'Claude Opus 4.6',   hint: 'Best reasoning' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', hint: 'Balanced' },
  { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  hint: 'Fastest' },
  { id: 'gpt-4o',            label: 'GPT-4o',            hint: 'OpenAI' },
];

const STEP_TABS = [
  { n: 1, label: 'Purpose' },
  { n: 2, label: 'System Prompt' },
  { n: 3, label: 'Tools & APIs' },
  { n: 4, label: 'Memory' },
  { n: 5, label: 'Test' },
  { n: 6, label: 'Deploy' },
];

// ── Wizard state ─────────────────────────────────────────
interface WizardState {
  // Step 1
  name: string;
  agentType: string;
  mainJob: string;
  audience: string;
  outputType: string;
  trigger: string;
  tone: string;
  language: string;
  // Step 2
  systemPrompt: string;
  // Step 3
  tools: string[];
  // Step 4
  memory: string;
  // Step 5
  testMessage: string;
  // Step 6
  model: string;
  deployTarget: string;
  agentName: string;
}

const INIT: WizardState = {
  name: '',
  agentType: '',
  mainJob: '',
  audience: '',
  outputType: '',
  trigger: '',
  tone: 'professional',
  language: 'en',
  systemPrompt: '',
  tools: [],
  memory: 'session',
  testMessage: '',
  model: 'claude-sonnet-4-6',
  deployTarget: 'api',
  agentName: '',
};

function buildSystemPrompt(s: WizardState): string {
  const type = AGENT_TYPES.find((t) => t.id === s.agentType)?.label ?? s.agentType;
  const tone = TONE_OPTIONS.find((t) => t.id === s.tone)?.label ?? s.tone;
  return `You are a ${type} AI agent named "${s.name || 'Assistant'}".

Your main job: ${s.mainJob || 'Help users with their requests.'}

Audience: ${AUDIENCE_TYPES.find((a) => a.id === s.audience)?.label ?? 'General users'}
Output style: ${OUTPUT_TYPES.find((o) => o.id === s.outputType)?.label ?? 'Text'}
Tone: ${tone}

Always be helpful, accurate, and stay within your defined scope.`;
}

export default function AgentWizard({ prefillName = '', prefillDesc = '', onClose, onCreated, onToast }: AgentWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<WizardState>({
    ...INIT,
    name: prefillName,
    mainJob: prefillDesc,
    agentName: prefillName,
  });

  const set = (patch: Partial<WizardState>) => setState((prev) => ({ ...prev, ...patch }));

  const toggleTool = (id: string) => {
    set({ tools: state.tools.includes(id) ? state.tools.filter((t) => t !== id) : [...state.tools, id] });
  };

  // Auto-generate system prompt when entering step 2
  const goToStep = (n: number) => {
    if (n === 2 && !state.systemPrompt) {
      set({ systemPrompt: buildSystemPrompt(state) });
    }
    setStep(n);
  };

  const next = () => goToStep(Math.min(step + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleCreate = async () => {
    const finalName = (state.agentName || state.name).trim();
    if (!finalName) { onToast('Agent name is required'); return; }

    const token = readAccessToken();
    if (!token) {
      onToast('You must be signed in to create an agent');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: finalName,
        description: state.mainJob.trim().slice(0, 500) || undefined,
        config: {
          modelId: state.model,
          agentType: state.agentType,
          systemPrompt: state.systemPrompt,
          tools: state.tools,
          memory: state.memory,
          trigger: state.trigger,
          deployTarget: state.deployTarget,
          tone: state.tone,
          language: state.language,
          steps: [],
        },
      };

      const created = await apiRequest<{ id: string; name: string }>('/agents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onToast(`✓ Agent "${created.name}" created`);
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create agent';
      onToast(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>✦</div>
            <div>
              <div className={styles.headerTitle}>Define your agent&apos;s purpose</div>
              <div className={styles.headerSub}>Step {step} of 6</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseRounded fontSize="small" />
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className={styles.tabBar}>
          {STEP_TABS.map((t) => (
            <button
              key={t.n}
              className={`${styles.tab} ${step === t.n ? styles.tabActive : ''} ${step > t.n ? styles.tabDone : ''}`}
              onClick={() => goToStep(t.n)}
            >
              <span className={styles.tabNum}>{step > t.n ? '✓' : t.n}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* ── STEP 1: PURPOSE ── */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>STEP 1 OF 6</div>
              <p className={styles.stepDesc}>Answer a few quick questions — we&apos;ll use your answers to build the perfect agent.</p>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}><span>👤</span> QUESTION 1 OF 7 — What do you want to call your agent?</div>
                <input
                  className={styles.qInput}
                  placeholder="e.g. Support Bot, Research Assistant, Code Reviewer…"
                  value={state.name}
                  onChange={(e) => set({ name: e.target.value, agentName: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}><span>🤖</span> QUESTION 2 OF 7 — What kind of agent is this?</div>
                <div className={styles.chipGrid}>
                  {AGENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.chip} ${state.agentType === t.id ? styles.chipActive : ''}`}
                      onClick={() => set({ agentType: t.id })}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}><span>🎯</span> QUESTION 3 OF 7 — What&apos;s the main job? <span className={styles.hint}>(in plain English)</span></div>
                <textarea
                  className={styles.qTextarea}
                  placeholder="e.g. Answer customer questions, handle returns, and create support tickets for issues we can't resolve."
                  value={state.mainJob}
                  onChange={(e) => set({ mainJob: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <div className={styles.suggestions}>
                  {JOB_SUGGESTIONS.map((s) => (
                    <button key={s} className={styles.suggestion} onClick={() => set({ mainJob: s })}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}><span>👥</span> QUESTION 4 OF 7 — Who will be talking to this agent?</div>
                <div className={styles.chipGrid}>
                  {AUDIENCE_TYPES.map((a) => (
                    <button
                      key={a.id}
                      className={`${styles.chip} ${state.audience === a.id ? styles.chipActive : ''}`}
                      onClick={() => set({ audience: a.id })}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}><span>📤</span> QUESTION 5 OF 7 — What does the agent output?</div>
                <div className={styles.chipGrid}>
                  {OUTPUT_TYPES.map((o) => (
                    <button
                      key={o.id}
                      className={`${styles.chip} ${state.outputType === o.id ? styles.chipActive : ''}`}
                      onClick={() => set({ outputType: o.id })}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}><span>⚡</span> QUESTION 6 OF 7 — How is it triggered?</div>
                <div className={styles.chipGrid}>
                  {TRIGGER_TYPES.map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.chip} ${state.trigger === t.id ? styles.chipActive : ''}`}
                      onClick={() => set({ trigger: t.id })}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}><span>🗣️</span> QUESTION 7 OF 7 — Tone & language</div>
                <div className={styles.twoCol}>
                  <div>
                    <div className={styles.subLabel}>Tone</div>
                    <div className={styles.chipGrid}>
                      {TONE_OPTIONS.map((t) => (
                        <button
                          key={t.id}
                          className={`${styles.chip} ${state.tone === t.id ? styles.chipActive : ''}`}
                          onClick={() => set({ tone: t.id })}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className={styles.subLabel}>Language</div>
                    <div className={styles.chipGrid}>
                      {LANG_OPTIONS.map((l) => (
                        <button
                          key={l.id}
                          className={`${styles.chip} ${state.language === l.id ? styles.chipActive : ''}`}
                          onClick={() => set({ language: l.id })}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: SYSTEM PROMPT ── */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>STEP 2 OF 6</div>
              <p className={styles.stepDesc}>We've pre-filled a system prompt based on your answers. Edit it to be more specific.</p>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}>System Prompt</div>
                <textarea
                  className={styles.promptTextarea}
                  value={state.systemPrompt}
                  onChange={(e) => set({ systemPrompt: e.target.value })}
                  rows={12}
                  placeholder="You are an AI assistant that..."
                />
                <div className={styles.promptHint}>
                  💡 Tip: Be specific about scope, tone, and what the agent should NOT do.
                </div>
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}>Model</div>
                <div className={styles.modelGrid}>
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      className={`${styles.modelCard} ${state.model === m.id ? styles.modelCardActive : ''}`}
                      onClick={() => set({ model: m.id })}
                    >
                      <div className={styles.modelName}>{m.label}</div>
                      <div className={styles.modelHint}>{m.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: TOOLS & APIs ── */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>STEP 3 OF 6</div>
              <p className={styles.stepDesc}>Select the tools your agent can use. You can connect real APIs after creation.</p>

              <div className={styles.toolGrid}>
                {TOOL_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    className={`${styles.toolCard} ${state.tools.includes(t.id) ? styles.toolCardActive : ''}`}
                    onClick={() => toggleTool(t.id)}
                  >
                    <div className={styles.toolIcon}>{t.icon}</div>
                    <div className={styles.toolName}>{t.label}</div>
                    <div className={styles.toolDesc}>{t.desc}</div>
                    {state.tools.includes(t.id) && <div className={styles.toolCheck}>✓</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 4: MEMORY ── */}
          {step === 4 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>STEP 4 OF 6</div>
              <p className={styles.stepDesc}>Choose how your agent remembers past interactions.</p>

              <div className={styles.memoryGrid}>
                {MEMORY_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    className={`${styles.memoryCard} ${state.memory === m.id ? styles.memoryCardActive : ''}`}
                    onClick={() => set({ memory: m.id })}
                  >
                    <div className={styles.memoryLabel}>{m.label}</div>
                    <div className={styles.memoryDesc}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 5: TEST ── */}
          {step === 5 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>STEP 5 OF 6</div>
              <p className={styles.stepDesc}>Send a test message to preview how your agent will respond.</p>

              <div className={styles.testPreview}>
                <div className={styles.testPromptBox}>
                  <div className={styles.testLabel}>System Prompt Preview</div>
                  <pre className={styles.testPromptText}>{state.systemPrompt || '(no system prompt set)'}</pre>
                </div>

                <div className={styles.qBlock}>
                  <div className={styles.qLabel}>Test Message</div>
                  <div className={styles.testInputRow}>
                    <input
                      className={styles.qInput}
                      placeholder="e.g. Hello! What can you help me with?"
                      value={state.testMessage}
                      onChange={(e) => set({ testMessage: e.target.value })}
                    />
                  </div>
                  <div className={styles.testNote}>
                    🔒 Live testing available after agent is created and a real API key is configured.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: DEPLOY ── */}
          {step === 6 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>STEP 6 OF 6</div>
              <p className={styles.stepDesc}>Choose where to deploy your agent and give it a final name.</p>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}>Final Agent Name</div>
                <input
                  className={styles.qInput}
                  placeholder="e.g. Support Bot"
                  value={state.agentName}
                  onChange={(e) => set({ agentName: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className={styles.qBlock}>
                <div className={styles.qLabel}>Deploy Target</div>
                <div className={styles.deployGrid}>
                  {DEPLOY_TARGETS.map((d) => (
                    <button
                      key={d.id}
                      className={`${styles.deployCard} ${state.deployTarget === d.id ? styles.deployCardActive : ''}`}
                      onClick={() => set({ deployTarget: d.id })}
                    >
                      <div className={styles.deployIcon}>{d.icon}</div>
                      <div className={styles.deployLabel}>{d.label}</div>
                      <div className={styles.deployDesc}>{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.summaryBox}>
                <div className={styles.summaryTitle}>Agent Summary</div>
                <div className={styles.summaryRow}><span>Name</span><strong>{state.agentName || state.name || '—'}</strong></div>
                <div className={styles.summaryRow}><span>Type</span><strong>{AGENT_TYPES.find((t) => t.id === state.agentType)?.label ?? '—'}</strong></div>
                <div className={styles.summaryRow}><span>Model</span><strong>{MODEL_OPTIONS.find((m) => m.id === state.model)?.label ?? '—'}</strong></div>
                <div className={styles.summaryRow}><span>Tools</span><strong>{state.tools.length > 0 ? state.tools.join(', ') : 'None'}</strong></div>
                <div className={styles.summaryRow}><span>Memory</span><strong>{MEMORY_OPTIONS.find((m) => m.id === state.memory)?.label ?? '—'}</strong></div>
                <div className={styles.summaryRow}><span>Deploy</span><strong>{DEPLOY_TARGETS.find((d) => d.id === state.deployTarget)?.label ?? '—'}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <div className={styles.dots}>
            {STEP_TABS.map((t) => (
              <span key={t.n} className={`${styles.dot} ${step === t.n ? styles.dotActive : step > t.n ? styles.dotDone : ''}`} />
            ))}
          </div>
          <div className={styles.footerActions}>
            {step > 1 && (
              <button className={styles.backBtn} onClick={prev}>← Back</button>
            )}
            {step < 6 ? (
              <button className={styles.nextBtn} onClick={next}>Next →</button>
            ) : (
              <button className={styles.createBtn} onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating…' : '🚀 Create Agent'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
