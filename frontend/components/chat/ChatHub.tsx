'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AttachFileRounded,
  ComputerRounded,
  AutoAwesomeRounded,
  ImageOutlined,
  MicRounded,
  MovieCreationOutlined,
} from '@mui/icons-material';
import { CATEGORY_PROMPTS } from '@/lib/mock-data';
import { apiRequest, getApiBaseUrl, readAccessToken } from '@/lib/auth';
import { clearPendingChatDraft, readPendingChatDraft } from '@/lib/chat-draft';
import { AuthProfile, ChatAttachment, ChatMessage, Model } from '@/lib/types';
import styles from './ChatHub.module.css';

interface ChatHubProps {
  models: Model[];
  onSwitchTab: (tab: 'chat' | 'marketplace' | 'agents' | 'research') => void;
  initialQuery?: string;
  activeModel: Model | null;
  onModelChange: (model: Model) => void;
  onOpenModal: (modelId: string, tab?: string) => void;
  onToast: (msg: string) => void;
  currentUser: AuthProfile | null;
}

interface PersistedGuestChat {
  modelId: string;
  messages: ChatMessage[];
}

interface ChatHistoryItem {
  id: string;
}

interface ChatSessionResponse {
  id: string;
  messages: Array<{
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    createdAt: string;
  }>;
}

const GREET_CHIPS = [
  'What can I build with AI?',
  'Compare GPT-4o vs Claude',
  'Best model for coding',
  'Create an image',
  'Explain RAG simply',
  'Best free open-source model',
];

const CAT_TABS = [
  { id: 'use_cases', label: 'Use cases' },
  { id: 'monitor', label: 'Monitor' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'business', label: 'Business plan' },
  { id: 'create', label: 'Create content' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'learn', label: 'Learn' },
];

const WELCOME_ACTIONS = [
  { title: 'Write content', meta: 'Emails, posts, stories', prompt: 'Help me write polished content for my project' },
  { title: 'Create images', meta: 'Art, photos, concepts', prompt: 'Create image ideas and prompts for my campaign' },
  { title: 'Build something', meta: 'Apps, tools, workflows', prompt: 'Help me build a new product or workflow' },
  { title: 'Automate work', meta: 'Save hours every week', prompt: 'Design an AI workflow to automate repetitive tasks' },
  { title: 'Analyze data', meta: 'Reports, files, metrics', prompt: 'Analyze my data and explain the key insights' },
  { title: 'Just exploring', meta: 'Show what is possible', prompt: 'Show me the best AI use cases for my goals' },
];

const RIGHT_PANEL_GROUPS = [
  {
    title: 'Navigation & tools',
    items: [
      { label: 'Browse Marketplace', action: 'marketplace' as const },
      { label: 'Build an Agent', action: 'agent' as const },
      { label: 'How to use Guide', action: 'guide' as const },
      { label: 'Prompt Engineering', action: 'prompt' as const },
      { label: 'View Pricing', action: 'pricing' as const },
      { label: 'AI Models Analysis', action: 'compare' as const },
    ],
  },
  {
    title: 'Create & generate',
    items: [
      { label: 'Create image', action: 'image' as const },
      { label: 'Generate Audio', action: 'audio' as const },
      { label: 'Create video', action: 'video' as const },
      { label: 'Create slides', action: 'slides' as const },
      { label: 'Create infographs', action: 'infograph' as const },
      { label: 'Create quiz', action: 'quiz' as const },
      { label: 'Create Flashcards', action: 'flashcards' as const },
      { label: 'Create Mind map', action: 'mindmap' as const },
    ],
  },
  {
    title: 'Analyze & write',
    items: [
      { label: 'Analyze data', action: 'analyze' as const },
      { label: 'Write content', action: 'write' as const },
      { label: 'Code Generation', action: 'code' as const },
      { label: 'Document Analysis', action: 'document' as const },
      { label: 'Translate', action: 'translate' as const },
    ],
  },
];

const GUEST_CHAT_KEY = 'nexusai.guestChat';
const AUTH_SESSION_KEY = 'nexusai.activeChatSessionId';

function buildAiReply(msg: string, model: Model): string {
  const l = msg.toLowerCase();
  if (l.includes('compare') || l.includes('vs')) {
    return `Great question! Here's a quick comparison between top models:\n\n**Claude Opus 4.6** excels at long-context reasoning and nuanced writing.\n**GPT-5.4** leads in code generation and multimodal tasks.\n**Gemini 2.5 Pro** has the largest context window (2M tokens) and native search grounding.\n\nFor your use case, I'd recommend starting with **${model.name}** given your context. Want me to go deeper on any of these?`;
  }
  if (l.includes('code') || l.includes('build') || l.includes('develop')) {
    return `For coding tasks, **${model.name}** is an excellent choice. It excels at:\n\n- Code generation in 20+ languages\n- Debugging and explaining complex code\n- Architecture and design patterns\n- Code review and refactoring\n\nTry: "Write a Next.js API route that fetches data from an external API with error handling"`;
  }
  if (l.includes('image') || l.includes('picture') || l.includes('art')) {
    return `For image generation, I'd recommend **DALL-E 4** or **Midjourney v7**.\n\n- **DALL-E 4**: photorealistic images with strong prompt-following\n- **Stable Diffusion XL**: open-source and highly customizable\n\nWant me to open the image generation models in the marketplace?`;
  }
  return `I understand you're looking for help with: "${msg}"\n\nWith **${model.name}**, I can help you with this. Here are a few approaches:\n\n1. Direct approach: provide your context and get an answer\n2. Guided workflow: use the Agent Builder to create a repeatable process\n3. Template library: start from a ready-made prompt\n\nWhat would you like to explore first?`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapFrontendModelToBackend(modelId?: string) {
  switch (modelId) {
    case 'claude-opus':
      return 'claude-opus-4-6';
    case 'claude-haiku':
      return 'claude-sonnet-4-6';
    case 'gemini31-pro':
      return 'gemini-1.5-pro';
    default:
      return 'gpt-4o';
  }
}

function mapBackendMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === 'ai' ? 'assistant' : 'user',
    content: message.content || buildAttachmentSummary(message.attachments),
  }));
}

function createAttachment(kind: ChatAttachment['kind'], file: File | Blob, fallbackName: string): ChatAttachment {
  const typedFile = file as File;
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    name: typedFile.name || fallbackName,
    url: URL.createObjectURL(file),
    mimeType: file.type || undefined,
  };
}

function buildAttachmentSummary(attachments?: ChatAttachment[]) {
  if (!attachments?.length) return '';

  return attachments.map((attachment) => {
    switch (attachment.kind) {
      case 'audio':
        return `[Voice note: ${attachment.name}]`;
      case 'image':
        return `[Image: ${attachment.name}]`;
      case 'video':
        return `[Video: ${attachment.name}]`;
      default:
        return `[File: ${attachment.name}]`;
    }
  }).join('\n');
}

function renderMessageContent(content: string) {
  return content.split('\n').map((line, i, lines) => (
    <span key={`line-${i}`}>
      {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
        j % 2 === 1 ? <strong key={`part-${i}-${j}`}>{part}</strong> : part,
      )}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

function mapSessionMessages(messages: ChatSessionResponse['messages']): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role === 'ASSISTANT' ? 'ai' : 'user',
    content: message.content,
    time: formatTime(message.createdAt),
  }));
}

function readGuestChat(): PersistedGuestChat | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(GUEST_CHAT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PersistedGuestChat;
  } catch {
    window.sessionStorage.removeItem(GUEST_CHAT_KEY);
    return null;
  }
}

export default function ChatHub({
  models,
  onSwitchTab,
  initialQuery,
  activeModel,
  onModelChange,
  onOpenModal,
  onToast,
  currentUser,
}: ChatHubProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuery || '');
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [catTab, setCatTab] = useState('use_cases');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const initialQueryHandledRef = useRef(false);
  const lastInitialQueryRef = useRef('');
  const initialDraftRef = useRef(readPendingChatDraft());
  const activeModelIdRef = useRef(activeModel?.id ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const isGuest = Boolean(currentUser?.isGuest);

  useEffect(() => {
    activeModelIdRef.current = activeModel?.id ?? '';
  }, [activeModel?.id]);

  useEffect(() => {
    let active = true;

    async function bootstrapChat() {
      if (isGuest) {
        const guestChat = readGuestChat();
        if (guestChat?.messages?.length) {
          if (guestChat.modelId && guestChat.modelId !== activeModelIdRef.current) {
            const nextModel = models.find((model) => model.id === guestChat.modelId);
            if (nextModel) {
              onModelChange(nextModel);
            }
          }
          if (active) {
            setMessages(guestChat.messages);
          }
        }
        if (active) setIsBootstrapped(true);
        return;
      }

      const token = readAccessToken();
      if (!token || initialQuery) {
        if (active) setIsBootstrapped(true);
        return;
      }

      try {
        const history = await apiRequest<ChatHistoryItem[]>('/chat/history');
        const preferredSessionId =
          (typeof window !== 'undefined' ? window.sessionStorage.getItem(AUTH_SESSION_KEY) : null) ??
          history[0]?.id;

        if (!preferredSessionId) {
          if (active) setIsBootstrapped(true);
          return;
        }

        const session = await apiRequest<ChatSessionResponse>(`/chat/sessions/${preferredSessionId}`);
        if (active && session?.messages?.length) {
          setSessionId(session.id);
          setMessages(mapSessionMessages(session.messages));
        }
      } catch {
        onToast('Unable to restore chat history');
      } finally {
        if (active) setIsBootstrapped(true);
      }
    }

    bootstrapChat();

    return () => {
      active = false;
    };
  }, [initialQuery, isGuest, models, onModelChange, onToast]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (!isGuest || typeof window === 'undefined') return;
    if (!activeModel) return;

    const payload: PersistedGuestChat = {
      modelId: activeModel.id,
      messages,
    };

    window.sessionStorage.setItem(GUEST_CHAT_KEY, JSON.stringify(payload));
  }, [activeModel, isGuest, messages]);

  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;
    window.sessionStorage.setItem(AUTH_SESSION_KEY, sessionId);
  }, [sessionId]);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const sendAuthenticatedMessage = useCallback(async (text: string, attachments: ChatAttachment[] = []) => {
    const token = readAccessToken();
    if (!token) {
      onToast('Your session expired. Please sign in again.');
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `${Date.now()}`,
      role: 'user',
      content: text,
      time: timestamp,
      attachments,
    };
    const assistantMessageId = `ai-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'ai',
      content: '',
      time: timestamp,
    };

    const nextMessages = [...messages, userMessage];
    setMessages((current) => [...current, userMessage, assistantPlaceholder]);
    setInput('');
    setTyping(true);

    const response = await fetch(`${getApiBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: activeModel?.backendModelId ?? mapFrontendModelToBackend(activeModel?.id),
        sessionId,
        messages: mapBackendMessages(nextMessages),
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Unable to reach chat service');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let assistantText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const eventChunk of events) {
        const line = eventChunk
          .split('\n')
          .find((entry) => entry.startsWith('data: '));

        if (!line) continue;

        const payload = JSON.parse(line.slice(6)) as {
          type: 'session' | 'delta' | 'done' | 'error';
          content?: string;
          sessionId?: string;
          message?: string;
        };

        if (payload.type === 'session' && payload.sessionId) {
          setSessionId(payload.sessionId);
        }

        if (payload.type === 'delta' && payload.content) {
          assistantText += payload.content;
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: assistantText }
                : message,
            ));
        }

        if (payload.type === 'error') {
          throw new Error(payload.message ?? 'Chat stream failed');
        }
      }
    }
  }, [activeModel?.backendModelId, activeModel?.id, messages, onToast, sessionId]);

  const sendGuestMessage = useCallback(async (text: string, attachments: ChatAttachment[] = []) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `${Date.now()}`,
      role: 'user',
      content: text,
      time: timestamp,
      attachments,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    const aiMessage: ChatMessage = {
      id: `${Date.now() + 1}`,
      role: 'ai',
      content: buildAiReply(text, activeModel ?? {
        id: 'assistant',
        name: 'NexusAI',
        org: 'NexusAI',
        icon: 'AI',
        iconBg: '#f3efe9',
        badge: 'beta',
        desc: '',
        tags: [],
        rating: 0,
        reviews: 0,
        price: 'Custom',
        category: [],
        lab: 'NexusAI',
        ctx: 'N/A',
        latency: 'Standard',
      }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((current) => [...current, aiMessage]);
  }, [activeModel]);

  const sendMessage = useCallback(async (text?: string, attachmentsOverride?: ChatAttachment[]) => {
    const msg = (text || input).trim();
    const attachments = attachmentsOverride ?? pendingAttachments;
    const fallbackText = msg || buildAttachmentSummary(attachments);
    if ((!fallbackText && attachments.length === 0) || typing) return;

    try {
      if (isGuest) {
        await sendGuestMessage(fallbackText, attachments);
      } else {
        await sendAuthenticatedMessage(fallbackText, attachments);
      }
      if (!attachmentsOverride) {
        setPendingAttachments([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message';
      onToast(message);
    } finally {
      setTyping(false);
    }
  }, [input, isGuest, onToast, pendingAttachments, sendAuthenticatedMessage, sendGuestMessage, typing]);

  useEffect(() => {
    if (!isBootstrapped) return;

    const pendingDraft = initialDraftRef.current;
    const launchQuery = initialQuery || pendingDraft?.query || '';
    const hasDraftAttachments = Boolean(pendingDraft?.attachments?.length);
    if (!launchQuery && !hasDraftAttachments) return;
    if (initialQueryHandledRef.current && lastInitialQueryRef.current === launchQuery) return;

    initialQueryHandledRef.current = true;
    lastInitialQueryRef.current = launchQuery;

    if (hasDraftAttachments && pendingDraft) {
      setPendingAttachments(pendingDraft.attachments);
      clearPendingChatDraft();
      initialDraftRef.current = null;
      void sendMessage(launchQuery, pendingDraft.attachments);
      return;
    }

    clearPendingChatDraft();
    initialDraftRef.current = null;
    void sendMessage(launchQuery);
  }, [initialQuery, isBootstrapped, sendMessage]);

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    m.org.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );

  const handleAttachment = useCallback((kind: 'file' | 'image' | 'video', file?: File | null) => {
    if (!file) return;

    const attachment = createAttachment(kind, file, file.name);
    const templates = {
      file: `Review the attached file "${file.name}" and summarize the key insights.`,
      image: `Analyze the uploaded image "${file.name}" and help me turn it into a strong creative brief.`,
      video: `Use the uploaded video "${file.name}" to suggest captions, highlights, and a content strategy.`,
    };

    setPendingAttachments((current) => [...current, attachment]);
    setInput(templates[kind]);
    onToast(`${file.name} attached to your draft`);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, [onToast]);

  const handleVoiceInput = useCallback(async () => {
    if (recording) {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      }
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      onToast('Voice notes are not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        mediaRecorderRef.current = null;
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        if (chunks.length === 0) {
          setRecording(false);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm';
        const attachment = createAttachment('audio', blob, `voice-note-${Date.now()}.${extension}`);

        setPendingAttachments((current) => {
          const filtered = current.filter((item) => item.kind !== 'audio');
          return [...filtered, attachment];
        });
        setInput((current) => current.trim() || 'Please listen to my voice note and respond to it.');
        onToast('Voice note added to your message');
        setRecording(false);
      };

      recorder.onerror = () => {
        mediaRecorderRef.current = null;
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setRecording(false);
        onToast('Unable to finish the voice note');
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      onToast('Recording voice note...');
    } catch {
      onToast('Unable to access your microphone');
    }
  }, [onToast, recording]);

  const handlePromptBoost = useCallback(() => {
    setInput((current) => {
      const next = current.trim();
      if (!next) {
        onToast('Write something first, then I can enhance it');
        return current;
      }

      onToast('Prompt boosted');
      return `Help me with this request in a clear, structured, and high-quality way:\n${next}`;
    });
  }, [onToast]);

  const handleScreenShare = useCallback(async () => {
    if (screenRecording) {
      if (screenRecorderRef.current?.state === 'recording') {
        screenRecorderRef.current.requestData();
        screenRecorderRef.current.stop();
      }
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      onToast('Screen sharing is not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      const track = stream.getVideoTracks()[0];
      const label = track?.label || `screen-${Date.now()}`;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        screenRecorderRef.current = null;
        screenStreamRef.current?.getTracks().forEach((item) => item.stop());
        screenStreamRef.current = null;

        if (chunks.length === 0) {
          setScreenRecording(false);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
        const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const attachment = createAttachment('video', blob, `${label}.${extension}`);

        setPendingAttachments((current) => [...current, attachment]);
        setInput((current) => current.trim() || `I recorded my screen "${label}". Please review the recording and help me with what happened on screen.`);
        setScreenRecording(false);
        onToast('Screen recording saved to your message');
      };

      recorder.onerror = () => {
        screenRecorderRef.current = null;
        screenStreamRef.current?.getTracks().forEach((item) => item.stop());
        screenStreamRef.current = null;
        setScreenRecording(false);
        onToast('Unable to finish the screen recording');
      };

      track?.addEventListener('ended', () => {
        if (screenRecorderRef.current?.state === 'recording') {
          screenRecorderRef.current.requestData();
          screenRecorderRef.current.stop();
        }
      });

      recorder.start();
      screenRecorderRef.current = recorder;
      setScreenRecording(true);
      onToast('Screen recording started');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Screen sharing was cancelled';
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenRecording(false);
      onToast(message);
    }
  }, [onToast, screenRecording]);

  const inputActions = [
    { id: 'mic', label: recording ? 'Stop recording' : 'Record voice note', icon: <MicRounded fontSize="small" />, onClick: handleVoiceInput },
    { id: 'file', label: 'Attach file', icon: <AttachFileRounded fontSize="small" />, onClick: () => fileInputRef.current?.click() },
    { id: 'image', label: 'Attach image', icon: <ImageOutlined fontSize="small" />, onClick: () => imageInputRef.current?.click() },
    { id: 'video', label: 'Attach video', icon: <MovieCreationOutlined fontSize="small" />, onClick: () => videoInputRef.current?.click() },
    { id: 'screen', label: screenRecording ? 'Stop screen recording' : 'Record screen', icon: <ComputerRounded fontSize="small" />, onClick: () => void handleScreenShare() },
    { id: 'fx', label: 'Enhance prompt', icon: <AutoAwesomeRounded fontSize="small" />, onClick: handlePromptBoost },
  ];

  const handleRightAction = useCallback((action: string) => {
    if (!activeModel) return;

    switch (action) {
      case 'marketplace':
        onSwitchTab('marketplace');
        return;
      case 'agent':
        onOpenModal(activeModel.id, 'agent');
        return;
      case 'guide':
        void sendMessage('Show me how to use NexusAI effectively');
        return;
      case 'prompt':
        onOpenModal(activeModel.id, 'prompt');
        return;
      case 'pricing':
        onOpenModal(activeModel.id, 'pricing');
        return;
      case 'compare':
        void sendMessage('Compare all top AI models for pricing, context, and quality');
        return;
      case 'image':
        void sendMessage('Create an image for me');
        return;
      case 'audio':
        void sendMessage('Generate audio for my project');
        return;
      case 'video':
        void sendMessage('Create a video concept and workflow');
        return;
      case 'slides':
        void sendMessage('Create slides for my presentation');
        return;
      case 'infograph':
        void sendMessage('Create an infographic outline for this topic');
        return;
      case 'quiz':
        void sendMessage('Create a quiz for this topic');
        return;
      case 'flashcards':
        void sendMessage('Create flashcards from this topic');
        return;
      case 'mindmap':
        void sendMessage('Create a mind map for this topic');
        return;
      case 'analyze':
        void sendMessage('Analyze my data and summarize the findings');
        return;
      case 'write':
        void sendMessage('Help me write content');
        return;
      case 'code':
        void sendMessage('Help me with code generation');
        return;
      case 'document':
        void sendMessage('Analyze a document for me');
        return;
      case 'translate':
        void sendMessage('Translate this content for me');
        return;
      default:
        onToast('Coming soon');
    }
  }, [activeModel, onOpenModal, onSwitchTab, onToast, sendMessage]);

  const removePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((current) => {
      const next = current.filter((attachment) => attachment.id !== attachmentId);
      const removed = current.find((attachment) => attachment.id === attachmentId);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return next;
    });
  }, []);

  const playAudioAttachment = useCallback((attachmentId: string) => {
    const audio = audioRefs.current[attachmentId];
    if (!audio) return;

    void audio.play().catch(() => {
      onToast('Tap the play control to start the audio note');
    });
  }, [onToast]);

  if (!activeModel) {
    return (
      <div className={styles.appPage}>
        <div className={styles.appBody}>
          <main className={styles.central}>
            <div className={styles.chatArea}>
              <section className={styles.heroBoard}>
                <div className={styles.heroBadge}>Loading workspace</div>
                <div className={styles.heroCopy}>
                  <h2>Loading live model catalog...</h2>
                  <p>Please wait while we connect the chat experience to your backend model inventory.</p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appPage}>
      <div className={styles.appBody}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div className={styles.sbKicker}>Models</div>
            <div className={styles.sbHead}>
              <h3>Model gallery</h3>
              <span>{models.length}</span>
            </div>
            <p>Search, pin, and switch between your favorite reasoning engines.</p>
            <input
              className={styles.sbSearch}
              placeholder="Search 525 models..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>

          <div className={styles.sbList}>
            {filteredModels.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`${styles.sbModel} ${m.id === activeModel.id ? styles.sbModelOn : ''}`}
                onClick={() => onModelChange(m)}
              >
                <div className={styles.sbModelMain}>
                  <div className={styles.sbMi} style={{ background: m.iconBg }}>{m.icon}</div>
                  <div className={styles.sbCopy}>
                    <div className={styles.sbMn}>{m.name}</div>
                    <div className={styles.sbMs}>
                      <span className={`${styles.sdot} ${styles.live}`} />
                      {m.org}
                    </div>
                  </div>
                </div>
                <span className={styles.sbArrow}>+</span>
              </button>
            ))}
          </div>
        </aside>

        <main className={styles.central}>
          <div className={styles.chatArea} ref={chatAreaRef}>
            {messages.length === 0 && (
              <section className={styles.heroBoard}>
                <div className={styles.heroGlow} />
                <div className={styles.heroBadge}>Workspace guide</div>
                <div className={styles.greetAvatar}>AI</div>
                <div className={styles.heroCopy}>
                  <h2>{isGuest ? 'Explore what AI can build for you' : "Welcome back. Let's make progress."}</h2>
                  <p>
                    {isGuest
                      ? 'No setup needed. Start with a use case, launch a starter flow, or ask anything in plain language.'
                      : 'Choose a lane, kick off a prompt, and turn ideas into drafts, prototypes, and research in one place.'}
                  </p>
                </div>

                <div className={styles.welcomePanel}>
                  <div className={styles.welcomeLabel}>Start with a guided lane</div>
                  <div className={styles.welcomeGrid}>
                    {WELCOME_ACTIONS.map((action, index) => (
                      <button
                        key={action.title}
                        type="button"
                        className={styles.welcomeCard}
                        style={{ animationDelay: `${index * 80}ms` }}
                        onClick={() => void sendMessage(action.prompt)}
                      >
                        <span className={styles.welcomeIcon}>{index + 1}</span>
                        <strong>{action.title}</strong>
                        <span>{action.meta}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.gchips}>
                  {GREET_CHIPS.map((chip) => (
                    <button key={chip} type="button" className={styles.gchip} onClick={() => void sendMessage(chip)}>
                      {chip}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}>
                <div className={styles.msgAv}>{msg.role === 'user' ? 'You' : 'AI'}</div>
                <div>
                  <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                    {renderMessageContent(msg.content)}
                    {msg.attachments?.length ? (
                      <div className={styles.attachmentStack}>
                        {msg.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={`${styles.attachmentCard} ${attachment.kind === 'audio' ? styles.attachmentCardClickable : ''}`}
                            onClick={attachment.kind === 'audio' ? () => playAudioAttachment(attachment.id) : undefined}
                            role={attachment.kind === 'audio' ? 'button' : undefined}
                            tabIndex={attachment.kind === 'audio' ? 0 : undefined}
                            onKeyDown={attachment.kind === 'audio'
                              ? (event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    playAudioAttachment(attachment.id);
                                  }
                                }
                              : undefined}
                          >
                            <div className={styles.attachmentName}>{attachment.name}</div>
                            {attachment.kind === 'image' && (
                              <img src={attachment.url} alt={attachment.name} className={styles.attachmentImage} />
                            )}
                            {attachment.kind === 'video' && (
                              <video src={attachment.url} controls className={styles.attachmentVideo} />
                            )}
                            {attachment.kind === 'audio' && (
                              <audio
                                ref={(node) => {
                                  audioRefs.current[attachment.id] = node;
                                }}
                                src={attachment.url}
                                controls
                                className={styles.attachmentAudio}
                              />
                            )}
                            {attachment.kind === 'file' && (
                              <a href={attachment.url} download={attachment.name} className={styles.attachmentFile}>
                                Download file
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className={styles.msgMeta}>
                    {msg.time} · {msg.role === 'ai' ? activeModel.name : 'You'}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className={`${styles.msg} ${styles.msgAi}`}>
                <div className={styles.msgAv}>AI</div>
                <div className={styles.typingInd}>
                  <div className={styles.td} />
                  <div className={styles.td} />
                  <div className={styles.td} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.inpArea}>
            <div className={styles.inpShell}>
              <div className={styles.inpRow}>
                <div className={styles.inpWrap}>
                  {pendingAttachments.length > 0 && (
                    <div className={styles.previewTray}>
                      {pendingAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className={`${styles.previewCard} ${attachment.kind === 'audio' ? styles.attachmentCardClickable : ''}`}
                          onClick={attachment.kind === 'audio' ? () => playAudioAttachment(attachment.id) : undefined}
                        >
                          <button
                            type="button"
                            className={styles.previewRemove}
                            onClick={() => removePendingAttachment(attachment.id)}
                          >
                            ×
                          </button>
                          <div className={styles.previewName}>{attachment.name}</div>
                          {attachment.kind === 'image' && (
                            <img src={attachment.url} alt={attachment.name} className={styles.previewImage} />
                          )}
                          {attachment.kind === 'video' && (
                            <video src={attachment.url} controls className={styles.previewVideo} />
                          )}
                          {attachment.kind === 'audio' && (
                            <audio
                              ref={(node) => {
                                audioRefs.current[attachment.id] = node;
                              }}
                              src={attachment.url}
                              controls
                              className={styles.previewAudio}
                            />
                          )}
                          {attachment.kind === 'file' && (
                            <div className={styles.previewFile}>File ready to send</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    id="chat-input"
                    className={styles.inpTextarea}
                    placeholder="Describe your project, ask a question, or just say hi..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void sendMessage();
                      }
                    }}
                    rows={1}
                  />
                  <div className={styles.inpBar}>
                    <input
                      ref={fileInputRef}
                      hidden
                      type="file"
                      onChange={(e) => handleAttachment('file', e.target.files?.[0])}
                    />
                    <input
                      ref={imageInputRef}
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAttachment('image', e.target.files?.[0])}
                    />
                    <input
                      ref={videoInputRef}
                      hidden
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleAttachment('video', e.target.files?.[0])}
                    />
                    {inputActions.map((action) => (
                      <button
                        key={action.id}
                        className={styles.itool}
                        type="button"
                        aria-label={action.label}
                        title={action.label}
                        onClick={action.onClick}
                      >
                        {action.icon}
                      </button>
                    ))}
                    <button className={styles.modelSel} type="button" onClick={() => onOpenModal(activeModel.id)}>
                      <span>{activeModel.name}</span>
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button type="button" className={styles.sendBtn} onClick={() => void sendMessage()}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>

              <div className={styles.cpanel}>
                <div className={styles.cpanelTabs}>
                  {CAT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`${styles.cpanelTab} ${catTab === tab.id ? styles.cpanelTabActive : ''}`}
                      onClick={() => setCatTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className={styles.cpanelPrompts}>
                  {(CATEGORY_PROMPTS[catTab] || []).map((prompt) => (
                    <button key={prompt} type="button" className={styles.cpanelPrompt} onClick={() => void sendMessage(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className={styles.rpanel}>
          <div className={styles.modelCard}>
            <div className={styles.rpLbl}>Quick cockpit</div>
            <div className={styles.modelCardHead}>
              <div className={styles.modelBadge} style={{ background: activeModel.iconBg }}>{activeModel.icon}</div>
              <div>
                <div className={styles.modelTitle}>{activeModel.name}</div>
                <div className={styles.modelOrg}>by {activeModel.org}</div>
              </div>
              <span className={styles.modelState}>{isGuest ? 'Guest' : 'Saved'}</span>
            </div>
            <p className={styles.modelDesc}>{activeModel.desc}</p>
            <div className={styles.modelStats}>
              <div>
                <strong>{activeModel.ctx}</strong>
                <span>Context</span>
              </div>
              <div>
                <strong>{activeModel.price.split('/')[0]}</strong>
                <span>Entry price</span>
              </div>
              <div>
                <strong>{activeModel.rating.toFixed(1)}</strong>
                <span>Rating</span>
              </div>
            </div>
            <div className={styles.modelCardActions}>
              <button type="button" className={styles.modelBtnGhost} onClick={() => onOpenModal(activeModel.id)}>
                View details
              </button>
              <button type="button" className={styles.modelBtnPrimary} onClick={() => onOpenModal(activeModel.id, 'pricing')}>
                Pricing
              </button>
            </div>
          </div>

          <div className={styles.rpanelGroups}>
            {RIGHT_PANEL_GROUPS.map((group) => (
              <section key={group.title} className={styles.rpSec}>
                <div className={styles.rpLbl}>{group.title}</div>
                <div className={styles.qaGrid}>
                  {group.items.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      className={styles.qaBtn}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleRightAction(item.action)}
                    >
                      <span className={styles.qaIcon}>{index + 1}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
