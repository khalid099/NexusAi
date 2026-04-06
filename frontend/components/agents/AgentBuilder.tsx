'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AddRounded,
  ArrowOutwardRounded,
  AutoAwesomeRounded,
  DeleteRounded,
  DescriptionRounded,
  InsightsRounded,
  MailRounded,
  PlayArrowRounded,
  RocketLaunchRounded,
  SearchRounded,
  SmartToyRounded,
  TuneRounded,
} from '@mui/icons-material';
import { AGENT_TEMPLATES as TEMPLATES, TAG_COLORS as TAG_CLS } from '@/lib/mock-data';
import { apiRequest, readAccessToken } from '@/lib/auth';
import AgentWizard from './AgentWizard';
import styles from './AgentBuilder.module.css';

interface AgentBuilderProps {
  onOpenModal: (modelId: string, tab?: string) => void;
  onChatAction: (msg: string) => void;
  onToast: (msg: string) => void;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  config?: Record<string, unknown>;
  _count?: { executions: number };
}

interface AgentExecution {
  id: string;
  status: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string | null;
  createdAt: string;
  finishedAt?: string | null;
}

interface AgentDetail extends Agent {
  executions: AgentExecution[];
}

interface AgentChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  meta?: string;
}

const LANES = [
  { id: 'use_cases', label: 'Use cases' },
  { id: 'business', label: 'Build a business' },
  { id: 'learn', label: 'Help me learn' },
  { id: 'monitor', label: 'Monitor the situation' },
  { id: 'research', label: 'Research' },
  { id: 'content', label: 'Create content' },
  { id: 'analyze', label: 'Analyze & research' },
];

const LANE_PROMPTS: Record<string, string[]> = {
  use_cases: [
    'Build a space exploration timeline app',
    'Prototype an AI chatbot demo application',
    'Create a project management Kanban board',
    'Design a product recommendation workflow',
  ],
  business: [
    'Create a real-time stock market tracker',
    'Build a customer onboarding assistant',
    'Draft a sales automation agent system',
    'Set up a lead qualification workflow',
  ],
  learn: [
    'Teach me how agent workflows work end-to-end',
    'Show how tool calling changes agent design',
    'Explain memory and planning for AI agents',
    'Walk me through evaluation strategies',
  ],
  monitor: [
    'Monitor AI launches from top labs each morning',
    'Track pricing changes across major models',
    'Watch critical support tickets and summarize trends',
    'Alert me when a competitor changes positioning',
  ],
  research: [
    'Research the best stack for an internal AI assistant',
    'Compare copilots for software teams',
    'Investigate agent use cases for healthcare ops',
    'Map the top players in browser automation',
  ],
  content: [
    'Create a blog-writing agent for our brand',
    'Design a LinkedIn content assistant',
    'Build an email campaign drafting workflow',
    'Generate ad-copy variations from one brief',
  ],
  analyze: [
    'Review a PR and flag risky changes',
    'Summarize insights from spreadsheets',
    'Create a document intelligence reviewer',
    'Analyze customer conversations for patterns',
  ],
};

const WORKFLOW_STEPS = [
  {
    icon: <RocketLaunchRounded fontSize="small" />,
    title: 'Trigger',
    desc: 'Start from user input, schedule, webhook, or product event.',
  },
  {
    icon: <SearchRounded fontSize="small" />,
    title: 'Gather context',
    desc: 'Collect files, APIs, docs, and memory before the agent acts.',
  },
  {
    icon: <SmartToyRounded fontSize="small" />,
    title: 'Think & route',
    desc: 'Choose the best template, model, and execution path for the task.',
  },
  {
    icon: <InsightsRounded fontSize="small" />,
    title: 'Deliver output',
    desc: 'Return plans, content, reports, or automations with clean handoff.',
  },
];

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ARCHIVED: 'Archived',
};

const STATUS_DOT: Record<string, string> = {
  DRAFT: styles.dotDraft,
  ACTIVE: styles.dotActive,
  PAUSED: styles.dotPaused,
  ARCHIVED: styles.dotArchived,
};

export default function AgentBuilder({ onOpenModal, onChatAction, onToast }: AgentBuilderProps) {
  const [activeLane, setActiveLane] = useState('use_cases');
  const [prompt, setPrompt] = useState('');
  const isAuthenticated = Boolean(readAccessToken());

  // My Agents state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardPrefillName, setWizardPrefillName] = useState('');
  const [wizardPrefillDesc, setWizardPrefillDesc] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [agentDetailLoading, setAgentDetailLoading] = useState(false);
  const [agentChatInput, setAgentChatInput] = useState('');
  const [agentChatMessages, setAgentChatMessages] = useState<AgentChatMessage[]>([]);

  // Run/deploy state
  const [runningId, setRunningId] = useState<string | null>(null);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const suggestions = useMemo(() => LANE_PROMPTS[activeLane] ?? [], [activeLane]);
  const activeTemplate = TEMPLATES[0];

  const readExecutionOutput = useCallback((execution: AgentExecution) => {
    const output = execution.output ?? {};
    const message = output.message;
    if (typeof message === 'string' && message.trim()) return message;

    const aiOutput = output.aiOutput;
    if (typeof aiOutput === 'string' && aiOutput.trim()) return aiOutput;

    if (execution.error) return execution.error;
    return 'Execution completed.';
  }, []);

  const mapExecutionsToChat = useCallback((executions: AgentExecution[]) => (
    executions
      .slice()
      .reverse()
      .flatMap((execution) => {
        const inputMessage = execution.input?.message;
        const userContent = typeof inputMessage === 'string' && inputMessage.trim()
          ? inputMessage
          : 'Run agent';
        const statusLabel = execution.status === 'COMPLETED' ? 'Completed' : execution.status;

        return [
          {
            id: `${execution.id}-user`,
            role: 'user' as const,
            content: userContent,
            meta: new Date(execution.createdAt).toLocaleString(),
          },
          {
            id: `${execution.id}-agent`,
            role: 'agent' as const,
            content: readExecutionOutput(execution),
            meta: statusLabel,
          },
        ];
      })
  ), [readExecutionOutput]);

  const loadAgents = useCallback(async () => {
    const token = readAccessToken();
    if (!token) {
      setAgents([]);
      setAgentsLoading(false);
      return;
    }
    setAgentsLoading(true);
    try {
      const data = await apiRequest<Agent[]>('/agents');
      setAgents(data);
      setSelectedAgentId((current) => {
        if (current && data.some((agent) => agent.id === current)) return current;
        return data[0]?.id ?? null;
      });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Could not load agents');
    } finally {
      setAgentsLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    if (!selectedAgentId) {
      setSelectedAgent(null);
      setAgentChatMessages([]);
      return;
    }

    let active = true;

    async function loadAgentDetail() {
      setAgentDetailLoading(true);
      try {
        const detail = await apiRequest<AgentDetail>(`/agents/${selectedAgentId}`);
        if (!active) return;
        setSelectedAgent(detail);
        setAgentChatMessages(mapExecutionsToChat(detail.executions ?? []));
      } catch (err) {
        if (!active) return;
        onToast(err instanceof Error ? err.message : 'Could not load agent details');
      } finally {
        if (active) {
          setAgentDetailLoading(false);
        }
      }
    }

    void loadAgentDetail();

    return () => {
      active = false;
    };
  }, [mapExecutionsToChat, onToast, selectedAgentId]);

  const openWizard = (prefillName = '', prefillDesc = '') => {
    setWizardPrefillName(prefillName);
    setWizardPrefillDesc(prefillDesc);
    setShowWizard(true);
  };

  const handleDeploy = async (id: string, name: string) => {
    setDeployingId(id);
    try {
      await apiRequest(`/agents/${id}/deploy`, { method: 'POST' });
      onToast(`"${name}" deployed`);
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: 'ACTIVE' } : a));
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Deploy failed');
    } finally {
      setDeployingId(null);
    }
  };

  const handleRun = async (id: string, name: string) => {
    setRunningId(id);
    try {
      const result = await apiRequest<{ executionId: string; status: string }>(`/agents/${id}/run`, {
        method: 'POST',
        body: JSON.stringify({ input: {} }),
      });
      setAgents((prev) => prev.map((agent) => (
        agent.id === id
          ? {
              ...agent,
              _count: { executions: (agent._count?.executions ?? 0) + 1 },
              updatedAt: new Date().toISOString(),
            }
          : agent
      )));
      onToast(`"${name}" started - execution ${result.executionId.slice(0, 8)}`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      await apiRequest(`/agents/${id}`, { method: 'DELETE' });
      onToast(`"${name}" deleted`);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      setSelectedAgentId((current) => (current === id ? null : current));
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAgentChatSend = async () => {
    const nextPrompt = agentChatInput.trim();
    if (!selectedAgentId || !nextPrompt) {
      onToast('Choose an agent and type a message first');
      return;
    }

    const draftId = `draft-${Date.now()}`;
    setAgentChatMessages((prev) => [
      ...prev,
      {
        id: `${draftId}-user`,
        role: 'user',
        content: nextPrompt,
        meta: 'Sending...',
      },
    ]);
    setAgentChatInput('');

    try {
      const result = await apiRequest<{ executionId: string; status: string; agentName: string }>(`/agents/${selectedAgentId}/run`, {
        method: 'POST',
        body: JSON.stringify({ input: { message: nextPrompt } }),
      });

      let execution = await apiRequest<AgentExecution>(`/agents/executions/${result.executionId}`);

      if (execution.status === 'RUNNING' || execution.status === 'PENDING') {
        for (let attempt = 0; attempt < 8; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 700));
          execution = await apiRequest<AgentExecution>(`/agents/executions/${result.executionId}`);
          if (execution.status !== 'RUNNING' && execution.status !== 'PENDING') {
            break;
          }
        }
      }

      setAgentChatMessages((prev) => [
        ...prev.map((message) =>
          message.id === `${draftId}-user`
            ? { ...message, meta: new Date().toLocaleString() }
            : message
        ),
        {
          id: `${draftId}-agent`,
          role: 'agent',
          content: readExecutionOutput(execution),
          meta: execution.status === 'COMPLETED' ? 'Completed' : execution.status,
        },
      ]);

      void loadAgents();
      const detail = await apiRequest<AgentDetail>(`/agents/${selectedAgentId}`);
      setSelectedAgent(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Agent chat failed';
      setAgentChatMessages((prev) => [
        ...prev.map((item) =>
          item.id === `${draftId}-user`
            ? { ...item, meta: 'Failed' }
            : item
        ),
        {
          id: `${draftId}-agent`,
          role: 'agent',
          content: message,
          meta: 'Failed',
        },
      ]);
      onToast(message);
    }
  };

  const launchPrompt = (value?: string) => {
    const nextPrompt = (value ?? prompt).trim();
    if (!nextPrompt) {
      onToast('Describe what your agent should do first');
      return;
    }
    onChatAction(nextPrompt);
    onToast('Opening agent workflow in chat');
  };

  return (
    <div className={styles.wrapper}>
      {/* ── Agent Wizard ── */}
      {showWizard && (
        <AgentWizard
          prefillName={wizardPrefillName}
          prefillDesc={wizardPrefillDesc}
          onClose={() => setShowWizard(false)}
          onCreated={() => { setShowWizard(false); void loadAgents(); }}
          onToast={onToast}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brandCard}>
          <div className={styles.brandIcon}>AI</div>
          <div>
            <h2>Agent Builder</h2>
            <p>Create powerful AI agents using any model. Pick a template or start from scratch.</p>
          </div>
        </div>

        <button className={styles.primaryButton} onClick={() => openWizard()}>
          <AddRounded fontSize="small" />
          <span>New Agent</span>
        </button>

        <div className={styles.helpCard}>
          <div className={styles.helpHeader}>
            <AutoAwesomeRounded fontSize="small" />
            <span>Not sure where to start?</span>
          </div>
          <p>Chat with our AI guide, describe what you want your agent to do, and get a personalized setup plan.</p>
          <button
            className={styles.secondaryButton}
            onClick={() => onChatAction('Help me build an AI agent and walk me through the setup')}
          >
            Ask the Hub
            <ArrowOutwardRounded fontSize="small" />
          </button>
        </div>

        {/* ── My Agents List ── */}
        <div className={styles.myAgentsPanel}>
          <div className={styles.myAgentsHead}>
            <span className={styles.myAgentsLabel}>My Agents</span>
            {agentsLoading && <span className={styles.loadingDot} />}
          </div>

          {!isAuthenticated && (
            <p className={styles.guestNote}>Sign in to create & manage agents</p>
          )}

          {isAuthenticated && !agentsLoading && agents.length === 0 && (
            <p className={styles.guestNote}>No agents yet — create your first one above</p>
          )}

          {agents.map((agent) => (
            <div key={agent.id} className={styles.agentRow}>
              <div className={styles.agentRowInfo}>
                <span className={`${styles.statusDot} ${STATUS_DOT[agent.status] ?? styles.dotDraft}`} />
                <div className={styles.agentRowName}>{agent.name}</div>
                <div className={styles.agentRowMeta}>
                  {STATUS_LABEL[agent.status] ?? agent.status}
                  {agent._count && ` · ${agent._count.executions} runs`}
                </div>
              </div>
              <div className={styles.agentRowActions}>
                {agent.status !== 'ACTIVE' && (
                  <button
                    className={styles.agentBtn}
                    title="Deploy"
                    disabled={deployingId === agent.id}
                    onClick={() => handleDeploy(agent.id, agent.name)}
                  >
                    <RocketLaunchRounded style={{ fontSize: 13 }} />
                  </button>
                )}
                <button
                  className={styles.agentBtn}
                  title="Run"
                  disabled={runningId === agent.id}
                  onClick={() => handleRun(agent.id, agent.name)}
                >
                  <PlayArrowRounded style={{ fontSize: 13 }} />
                </button>
                <button
                  className={`${styles.agentBtn} ${styles.agentBtnDanger}`}
                  title="Delete"
                  disabled={deletingId === agent.id}
                  onClick={() => handleDelete(agent.id, agent.name)}
                >
                  <DeleteRounded style={{ fontSize: 13 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Agent orchestration</div>
            <h1>Agent works for you.</h1>
            <p>Your AI agent takes care of planning, execution, and delivery in one guided workspace.</p>
          </div>
        </section>

        <section className={styles.composerCard}>
          <div className={styles.composerTop}>
            <textarea
              className={styles.composerInput}
              placeholder="What should we work on next?"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={2}
            />
          </div>

          <div className={styles.composerBar}>
            <div className={styles.iconActions}>
              <button type="button" className={styles.iconAction} onClick={() => onToast('Voice planning coming soon')}>
                <SmartToyRounded fontSize="small" />
              </button>
              <button type="button" className={styles.iconAction} onClick={() => onToast('Tool connection coming soon')}>
                <TuneRounded fontSize="small" />
              </button>
              <button type="button" className={styles.iconAction} onClick={() => onToast('Docs upload coming soon')}>
                <DescriptionRounded fontSize="small" />
              </button>
              <button type="button" className={styles.iconAction} onClick={() => onToast('Email workflow coming soon')}>
                <MailRounded fontSize="small" />
              </button>
            </div>

            <button className={styles.launchButton} onClick={() => launchPrompt()}>
              <ArrowOutwardRounded fontSize="small" />
            </button>
          </div>

          <div className={styles.laneRow}>
            {LANES.map((lane) => (
              <button
                key={lane.id}
                className={`${styles.laneChip} ${activeLane === lane.id ? styles.laneChipActive : ''}`}
                onClick={() => setActiveLane(lane.id)}
              >
                {lane.label}
              </button>
            ))}
          </div>

          <div className={styles.suggestionList}>
            {suggestions.map((item) => (
              <button
                key={item}
                className={styles.suggestionItem}
                onClick={() => {
                  setPrompt(item);
                  launchPrompt(item);
                }}
              >
                <span className={styles.suggestionIcon}>✦</span>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.templatesSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>Agent templates</span>
              <h3>{agents.length > 0 ? 'Your agents & starting points' : 'Ready-made starting points'}</h3>
            </div>
            <button className={styles.shuffleButton} onClick={() => openWizard()}>
              + New
            </button>
          </div>

          <div className={styles.templateGrid}>
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className={`${styles.templateCard} ${styles.customAgentCard}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className={styles.templateIcon}>
                  <SmartToyRounded fontSize="small" />
                </div>
                <div className={styles.customAgentMeta}>
                  <span className={`${styles.statusDot} ${STATUS_DOT[agent.status] ?? styles.dotDraft}`} />
                  <span>{STATUS_LABEL[agent.status] ?? agent.status}</span>
                  <span>·</span>
                  <span>{agent._count?.executions ?? 0} runs</span>
                </div>
                <h4>{agent.name}</h4>
                <p>{agent.description?.trim() || 'Custom agent ready for deployment, testing, and execution.'}</p>
                <div className={styles.templateTags}>
                  <span className={`tag ${TAG_CLS.Agent || 't-blue'}`}>Custom</span>
                  <span className={`tag ${TAG_CLS.Automation || 't-green'}`}>Live fetch</span>
                </div>
                <div className={styles.customAgentActions}>
                  {agent.status !== 'ACTIVE' && (
                    <button
                      type="button"
                      className={styles.agentCardBtn}
                      disabled={deployingId === agent.id}
                      onClick={() => handleDeploy(agent.id, agent.name)}
                    >
                      <RocketLaunchRounded style={{ fontSize: 14 }} />
                      <span>{deployingId === agent.id ? 'Deploying...' : 'Deploy'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.agentCardBtn}
                    disabled={runningId === agent.id}
                    onClick={() => handleRun(agent.id, agent.name)}
                  >
                    <PlayArrowRounded style={{ fontSize: 14 }} />
                    <span>{runningId === agent.id ? 'Running...' : 'Run'}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.agentCardBtn} ${styles.agentCardBtnDanger}`}
                    disabled={deletingId === agent.id}
                    onClick={() => handleDelete(agent.id, agent.name)}
                  >
                    <DeleteRounded style={{ fontSize: 14 }} />
                    <span>{deletingId === agent.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}

            {TEMPLATES.map((template, index) => (
              <button
                key={template.title}
                className={styles.templateCard}
                style={{ animationDelay: `${(agents.length + index) * 70}ms` }}
                onClick={() => openWizard(template.title, template.desc)}
              >
                <div className={styles.templateIcon}>{template.icon}</div>
                <h4>{template.title}</h4>
                <p>{template.desc}</p>
                <div className={styles.templateTags}>
                  {template.tags.map((tag) => (
                    <span key={tag} className={`tag ${TAG_CLS[tag] || 't-blue'}`}>{tag}</span>
                  ))}
                </div>
              </button>
            ))}

            <button className={styles.scratchCard} onClick={() => openWizard()}>
              <span>+</span>
              <strong>Build from Scratch</strong>
            </button>
          </div>
        </section>

        <section className={styles.liveAgentSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>Created agent chat</span>
              <h3>Talk to your agent live</h3>
            </div>
          </div>

          {agents.length === 0 ? (
            <p className={styles.guestNote}>Create an agent first, then you can test it here.</p>
          ) : (
            <div className={styles.liveAgentGrid}>
              <div className={styles.agentLibrary}>
                <div className={styles.agentLibraryTitle}>My Agents</div>
                <div className={styles.agentLibraryList}>
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      className={`${styles.agentLibraryItem} ${selectedAgentId === agent.id ? styles.agentLibraryItemActive : ''}`}
                      onClick={() => setSelectedAgentId(agent.id)}
                    >
                      <div>
                        <div className={styles.agentLibraryName}>{agent.name}</div>
                        <div className={styles.agentLibraryMeta}>
                          {STATUS_LABEL[agent.status] ?? agent.status}
                          <span>·</span>
                          <span>{agent._count?.executions ?? 0} runs</span>
                        </div>
                      </div>
                      <span className={`${styles.statusDot} ${STATUS_DOT[agent.status] ?? styles.dotDraft}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.agentChatCard}>
                {selectedAgent ? (
                  <>
                    <div className={styles.agentChatHead}>
                      <div>
                        <div className={styles.agentChatTitle}>{selectedAgent.name}</div>
                        <div className={styles.agentChatSub}>
                          {selectedAgent.description?.trim() || 'Custom agent live preview'}
                        </div>
                      </div>
                      <div className={styles.agentChatStats}>
                        <span>{STATUS_LABEL[selectedAgent.status] ?? selectedAgent.status}</span>
                        <span>·</span>
                        <span>{selectedAgent._count?.executions ?? selectedAgent.executions?.length ?? 0} runs</span>
                      </div>
                    </div>

                    <div className={styles.agentChatFeed}>
                      {agentDetailLoading ? (
                        <div className={styles.agentChatEmpty}>Loading agent conversation...</div>
                      ) : agentChatMessages.length === 0 ? (
                        <div className={styles.agentChatEmpty}>Send the first message to start testing this agent.</div>
                      ) : (
                        agentChatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`${styles.agentBubbleRow} ${message.role === 'user' ? styles.agentBubbleRowUser : ''}`}
                          >
                            <div className={`${styles.agentBubble} ${message.role === 'user' ? styles.agentBubbleUser : styles.agentBubbleAgent}`}>
                              <div>{message.content}</div>
                              {message.meta && <span className={styles.agentBubbleMeta}>{message.meta}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className={styles.agentChatComposer}>
                      <textarea
                        className={styles.agentChatInput}
                        placeholder={`Message ${selectedAgent.name}...`}
                        value={agentChatInput}
                        onChange={(event) => setAgentChatInput(event.target.value)}
                        rows={3}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void handleAgentChatSend();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.agentSendButton}
                        onClick={() => void handleAgentChatSend()}
                      >
                        <PlayArrowRounded style={{ fontSize: 16 }} />
                        <span>Send to agent</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.agentChatEmpty}>Select a created agent to open its live chat.</div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className={styles.workflowSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>Execution flow</span>
              <h3>How agent workflows move</h3>
            </div>
          </div>

          <div className={styles.workflowGrid}>
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.title} className={styles.workflowCard} style={{ animationDelay: `${index * 80}ms` }}>
                <div className={styles.workflowTop}>
                  <span className={styles.workflowNum}>0{index + 1}</span>
                  <div className={styles.workflowIcon}>{step.icon}</div>
                </div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
