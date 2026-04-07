'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AddRounded,
  ArrowOutwardRounded,
  AutoAwesomeRounded,
  DeleteRounded,
  InsightsRounded,
  PlayArrowRounded,
  RocketLaunchRounded,
  SearchRounded,
  SmartToyRounded,
} from '@mui/icons-material';
import { AGENT_TEMPLATES as TEMPLATES, TAG_COLORS as TAG_CLS } from '@/lib/mock-data';
import { apiRequest, readAccessToken } from '@/lib/auth';
import AgentWizard from './AgentWizard';
import styles from './AgentBuilder.module.css';
import { ChatAttachment } from '@/lib/types';

// ── Composer controls (mirrors Chat's HeroSearch toolbar) ──────────────────
const COMPOSER_CONTROLS = [
  { type: 'mic',         tip: 'Voice prompt',   color: '#7c3aed', bg: '#f3e8ff', border: 'rgba(124,58,237,0.22)' },
  { type: 'file',        tip: 'Attach file',    color: '#d97706', bg: '#fff7ed', border: 'rgba(217,119,6,0.22)' },
  { type: 'image',       tip: 'Image workflow', color: '#2563eb', bg: '#eff6ff', border: 'rgba(37,99,235,0.22)' },
  { type: 'voiceTyping', tip: 'Voice typing',   color: '#0891b2', bg: '#ecfeff', border: 'rgba(8,145,178,0.22)' },
  { type: 'video',       tip: 'Camera / Video', color: '#dc2626', bg: '#fef2f2', border: 'rgba(220,38,38,0.22)' },
  { type: 'screen',      tip: 'Screen sharing', color: '#059669', bg: '#ecfdf5', border: 'rgba(5,150,105,0.22)' },
] as const;

async function createAttachment(kind: ChatAttachment['kind'], file: Blob, name: string): Promise<ChatAttachment> {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    name,
    size: file.size,
    mimeType: file instanceof File ? file.type : '',
    url: URL.createObjectURL(file),
    blob: file,
  };
}

// SVG icons matching Chat toolbar
function ComposerIcon({ type }: { type: typeof COMPOSER_CONTROLS[number]['type'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'mic') return <svg viewBox="0 0 24 24" width="15" height="15" {...common}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>;
  if (type === 'file') return <svg viewBox="0 0 24 24" width="15" height="15" {...common}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
  if (type === 'image') return <svg viewBox="0 0 24 24" width="15" height="15" {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
  if (type === 'voiceTyping') return <svg viewBox="0 0 24 24" width="15" height="15" {...common}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
  if (type === 'video') return <svg viewBox="0 0 24 24" width="15" height="15" {...common}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
  if (type === 'screen') return <svg viewBox="0 0 24 24" width="15" height="15" {...common}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
  return null;
}

function useVoiceTypingComposer(setValue: (v: string) => void, onToast: (m: string) => void) {
  const [typingActive, setTypingActive] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const toggle = useCallback(() => {
    if (typingActive) {
      recRef.current?.stop();
      recRef.current = null;
      setTypingActive(false);
      return;
    }
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) { onToast('Voice typing not supported in this browser'); return; }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join('');
      setValue(transcript);
    };
    rec.onerror = () => { setTypingActive(false); recRef.current = null; };
    rec.onend = () => { setTypingActive(false); recRef.current = null; };
    rec.start();
    recRef.current = rec;
    setTypingActive(true);
  }, [typingActive, onToast, setValue]);

  return { typingActive, toggle };
}

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

  // Composer toolbar state (mirrors Chat)
  const [composerAttachment, setComposerAttachment] = useState<ChatAttachment | null>(null);
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [micRecording, setMicRecording] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);
  const imageCameraRef = useRef<HTMLInputElement>(null);
  const micRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const { typingActive, toggle: toggleVoiceTyping } = useVoiceTypingComposer(setPrompt, onToast);

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

  // ── Composer toolbar handlers ─────────────────────────────────────────────
  useEffect(() => {
    if (!cameraMenuOpen) return;
    const close = () => setCameraMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [cameraMenuOpen]);

  useEffect(() => {
    if (!imageMenuOpen) return;
    const close = () => setImageMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [imageMenuOpen]);

  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const attachFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, kind: ChatAttachment['kind'], label: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const attachment = await createAttachment(kind, file, file.name);
    setComposerAttachment(attachment);
    if (!prompt.trim()) setPrompt(`Analyze the attached ${label} "${file.name}" and help me build an agent around it.`);
    onToast(`${label} attached: ${file.name}`);
    event.target.value = '';
  }, [prompt, onToast]);

  const handleMic = useCallback(async () => {
    if (micRecording) {
      micRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        micRecorderRef.current = null;
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        if (!chunks.length) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm';
        const att = await createAttachment('audio', blob, `voice-note-${Date.now()}.${ext}`);
        setComposerAttachment(att);
        if (!prompt.trim()) setPrompt('Transcribe this voice note and build an agent task from it.');
        onToast('Voice note ready');
        setMicRecording(false);
      };
      recorder.start();
      micRecorderRef.current = recorder;
      setMicRecording(true);
    } catch {
      onToast('Microphone access denied');
    }
  }, [micRecording, prompt, onToast]);

  const handleScreenShare = useCallback(async () => {
    if (screenRecording) {
      screenRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        screenRecorderRef.current = null;
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
        if (!chunks.length) return;
        const blob = new Blob(chunks, { type: 'video/webm' });
        const att = await createAttachment('video', blob, `screen-${Date.now()}.webm`);
        setComposerAttachment(att);
        if (!prompt.trim()) setPrompt('Analyze this screen recording and suggest an agent workflow based on what you see.');
        onToast('Screen recording saved');
        setScreenRecording(false);
      };
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (recorder.state === 'recording') { recorder.requestData(); recorder.stop(); }
      });
      recorder.start();
      screenRecorderRef.current = recorder;
      setScreenRecording(true);
    } catch {
      setScreenRecording(false);
      onToast('Screen sharing cancelled');
    }
  }, [screenRecording, prompt, onToast]);

  const handleComposerAction = useCallback((type: typeof COMPOSER_CONTROLS[number]['type']) => {
    if (type === 'mic') { void handleMic(); return; }
    if (type === 'file') { fileInputRef.current?.click(); return; }
    if (type === 'image') { setImageMenuOpen((o) => !o); return; }
    if (type === 'voiceTyping') { toggleVoiceTyping(); return; }
    if (type === 'video') { setCameraMenuOpen((o) => !o); return; }
    if (type === 'screen') { void handleScreenShare(); return; }
  }, [handleMic, handleScreenShare, toggleVoiceTyping]);

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
            <div className={styles.iconActions} style={{ position: 'relative', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {COMPOSER_CONTROLS.map((ctrl) => {
                const isActive =
                  (ctrl.type === 'mic' && micRecording) ||
                  (ctrl.type === 'voiceTyping' && typingActive) ||
                  (ctrl.type === 'screen' && screenRecording);
                const isMenuOpen =
                  (ctrl.type === 'video' && cameraMenuOpen) ||
                  (ctrl.type === 'image' && imageMenuOpen);

                if (ctrl.type === 'image') {
                  return (
                    <div key={ctrl.type} style={{ position: 'relative' }}>
                      <button
                        type="button"
                        title={ctrl.tip}
                        className={styles.iconAction}
                        onClick={() => handleComposerAction(ctrl.type)}
                        style={{
                          color: isMenuOpen ? '#fff' : ctrl.color,
                          background: isMenuOpen ? ctrl.color : ctrl.bg,
                          border: `1.5px solid ${isMenuOpen ? ctrl.color : ctrl.border}`,
                        }}
                      >
                        <ComposerIcon type={ctrl.type} />
                      </button>
                      {imageMenuOpen && (
                        <div className={styles.composerPopup}>
                          <button type="button" className={styles.composerPopupItem} onClick={() => { setImageMenuOpen(false); imageInputRef.current?.click(); }}>
                            <span className={styles.composerPopupIcon} style={{ background: '#eff6ff' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </span>
                            <span><strong>Upload Image</strong><br /><small>Choose from device</small></span>
                          </button>
                          <button type="button" className={styles.composerPopupItem} onClick={() => imageCameraRef.current?.click()}>
                            <span className={styles.composerPopupIcon} style={{ background: '#f0fdf4' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            </span>
                            <span><strong>Take Photo</strong><br /><small>Capture from camera</small></span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (ctrl.type === 'video') {
                  return (
                    <div key={ctrl.type} style={{ position: 'relative' }}>
                      <button
                        type="button"
                        title={ctrl.tip}
                        className={styles.iconAction}
                        onClick={() => handleComposerAction(ctrl.type)}
                        style={{
                          color: isMenuOpen ? '#fff' : ctrl.color,
                          background: isMenuOpen ? ctrl.color : ctrl.bg,
                          border: `1.5px solid ${isMenuOpen ? ctrl.color : ctrl.border}`,
                        }}
                      >
                        <ComposerIcon type={ctrl.type} />
                      </button>
                      {cameraMenuOpen && (
                        <div className={styles.composerPopup}>
                          <button type="button" className={styles.composerPopupItem} onClick={() => cameraPhotoRef.current?.click()}>
                            <span className={styles.composerPopupIcon} style={{ background: '#eff6ff' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            </span>
                            <span><strong>Take Photo</strong><br /><small>Capture from camera</small></span>
                          </button>
                          <button type="button" className={styles.composerPopupItem} onClick={() => cameraVideoRef.current?.click()}>
                            <span className={styles.composerPopupIcon} style={{ background: '#fef2f2' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                            </span>
                            <span><strong>Record Video</strong><br /><small>Record from camera</small></span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={ctrl.type}
                    type="button"
                    title={ctrl.tip}
                    className={styles.iconAction}
                    onClick={() => handleComposerAction(ctrl.type)}
                    style={{
                      color: isActive ? '#fff' : ctrl.color,
                      background: isActive ? ctrl.color : ctrl.bg,
                      border: `1.5px solid ${isActive ? ctrl.color : ctrl.border}`,
                    }}
                  >
                    <ComposerIcon type={ctrl.type} />
                  </button>
                );
              })}

              {/* Hidden file inputs */}
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => attachFile(e, 'file', 'file')} />
              <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => attachFile(e, 'image', 'image')} />
              <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => attachFile(e, 'video', 'video')} />
              <input ref={cameraPhotoRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { setCameraMenuOpen(false); attachFile(e, 'image', 'photo'); }} />
              <input ref={cameraVideoRef} type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { setCameraMenuOpen(false); attachFile(e, 'video', 'video'); }} />
              <input ref={imageCameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { setImageMenuOpen(false); attachFile(e, 'image', 'photo'); }} />
            </div>

            <button className={styles.launchButton} onClick={() => launchPrompt()}>
              <ArrowOutwardRounded fontSize="small" />
            </button>
          </div>

          {/* Attachment chip */}
          {composerAttachment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, px: 4, paddingBottom: 8, paddingLeft: 4 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: '#f7f2ee', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.78rem', color: '#5a4a3a', fontWeight: 600 }}>
                <span>{composerAttachment.kind === 'image' ? '🖼' : composerAttachment.kind === 'video' ? '🎬' : composerAttachment.kind === 'audio' ? '🎙' : '📎'}</span>
                <span>{composerAttachment.name}</span>
                <button
                  type="button"
                  onClick={() => setComposerAttachment(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9b93', fontSize: '1rem', lineHeight: 1, padding: 0, marginLeft: 2 }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

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
