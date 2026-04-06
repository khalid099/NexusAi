'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { clearPendingChatDraft, savePendingChatDraft } from '@/lib/chat-draft';
import { ChatAttachment } from '@/lib/types';

interface SuggestionTab {
  id: string;
  icon: string;
  label: string;
  hint: string;
  items: { icon: string; text: string; query: string }[];
}

export interface HeroSearchProps {
  onLaunch: (query: string) => void;
  onToast: (msg: string) => void;
  onOpenAgents: () => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

async function createPendingAttachment(kind: ChatAttachment['kind'], file: Blob, fallbackName: string): Promise<ChatAttachment> {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    name: (file as File).name || fallbackName,
    url: await fileToDataUrl(file),
    mimeType: file.type || undefined,
  };
}

const SUGGESTION_TABS: SuggestionTab[] = [
  {
    id: 'recruiting',
    icon: 'HR',
    label: 'Recruiting',
    hint: 'Find talent, benchmark roles, and prep for hiring decisions.',
    items: [
      { icon: '🔎', text: 'Monitor job postings at target companies', query: 'Monitor job postings at target companies and summarize openings weekly' },
      { icon: '💰', text: 'Benchmark salary for a specific role', query: 'Benchmark salary ranges for a senior frontend engineer in the US' },
      { icon: '📋', text: 'Build a hiring pipeline tracker', query: 'Create a hiring pipeline tracker for five open roles' },
      { icon: '🛡️', text: 'Research a candidate before an interview', query: 'Research a candidate before an interview and build a briefing note' },
      { icon: '🗺️', text: 'Build an interactive talent market map', query: 'Create a talent market map for AI engineers across major cities' },
    ],
  },
  {
    id: 'prototype',
    icon: 'PX',
    label: 'Create a prototype',
    hint: 'Shape an MVP, wireframe, feature flow, or first demo faster.',
    items: [
      { icon: '🎨', text: 'Design a landing page wireframe', query: 'Design a landing page wireframe for an AI SaaS product' },
      { icon: '📱', text: 'Build a mobile app mockup', query: 'Create a mobile app mockup for a task planning assistant' },
      { icon: '🧩', text: 'Outline the first product architecture', query: 'Create the initial product architecture for a marketplace app' },
      { icon: '🧪', text: 'Generate an MVP feature list', query: 'Generate an MVP feature list for a job matching platform' },
      { icon: '⚡', text: 'Rapid prototype with AI assistance', query: 'Help me rapidly prototype a new SaaS idea' },
    ],
  },
  {
    id: 'business',
    icon: 'BZ',
    label: 'Build a business',
    hint: 'Validate ideas, map markets, and turn rough concepts into plans.',
    items: [
      { icon: '📊', text: 'Analyze market opportunity for my idea', query: 'Analyze the market opportunity for an AI tools marketplace' },
      { icon: '💡', text: 'Generate a business plan outline', query: 'Generate a business plan outline for a niche AI startup' },
      { icon: '📈', text: 'Create a go-to-market strategy', query: 'Create a go-to-market strategy for a new developer product' },
      { icon: '🏁', text: 'Run a competitor comparison', query: 'Compare competitors in the AI agent platform space' },
      { icon: '🪄', text: 'Write investor pitch deck content', query: 'Write investor pitch deck content for a seed-stage SaaS startup' },
    ],
  },
  {
    id: 'learn',
    icon: 'ED',
    label: 'Help me learn',
    hint: 'Break down topics, create study plans, and turn notes into tools.',
    items: [
      { icon: '🧠', text: 'Explain machine learning in simple terms', query: 'Explain machine learning in simple terms with examples' },
      { icon: '📚', text: 'Create a study plan for any subject', query: 'Create a 30-day study plan to learn product design' },
      { icon: '❓', text: 'Generate practice quiz questions', query: 'Generate practice quiz questions for JavaScript fundamentals' },
      { icon: '🗂️', text: 'Make flashcards from my notes', query: 'Turn my notes into flashcards for revision' },
      { icon: '🕸️', text: 'Build a mind map for a complex topic', query: 'Build a mind map for distributed systems concepts' },
    ],
  },
  {
    id: 'research',
    icon: 'RS',
    label: 'Research',
    hint: 'Compare models, summarize findings, and surface what matters most.',
    items: [
      { icon: '📄', text: 'Summarize a research paper for me', query: 'Summarize this research paper in plain English' },
      { icon: '🤖', text: 'Compare AI models for my use case', query: 'Compare AI models for coding, image generation, and long-context research' },
      { icon: '📰', text: 'Find latest news on a topic', query: 'Find the latest news on open-source AI models' },
      { icon: '📑', text: 'Analyze a document and extract key points', query: 'Analyze a document and extract the key points and risks' },
      { icon: '🌐', text: 'Research a company or technology', query: 'Research a company and summarize its products, pricing, and positioning' },
    ],
  },
];

const ACTION_TILES = [
  { icon: '🎨', label: 'Create image', query: 'Create an image concept and prompt for my idea', tone: '#ffedd5' },
  { icon: '🎵', label: 'Generate Audio', query: 'Generate audio or voiceover ideas for my project', tone: '#f3e8ff' },
  { icon: '🎬', label: 'Create video', query: 'Create a video concept, storyboard, and prompt', tone: '#fee2e2' },
  { icon: '📊', label: 'Create slides', query: 'Create a slide deck outline and talking points', tone: '#dbeafe' },
  { icon: '🧾', label: 'Create infographics', query: 'Create an infographic structure and content outline', tone: '#dcfce7' },
  { icon: '❓', label: 'Create quiz', query: 'Create a quiz with answers and difficulty levels', tone: '#fef3c7' },
  { icon: '🗃️', label: 'Create Flashcards', query: 'Create flashcards from this topic', tone: '#fae8ff' },
  { icon: '🧠', label: 'Create Mind map', query: 'Create a mind map for this topic', tone: '#e0f2fe' },
  { icon: '📈', label: 'Analyze Data', query: 'Analyze my data and suggest insights', tone: '#ecfccb' },
  { icon: '✍️', label: 'Write content', query: 'Write content for my landing page and social posts', tone: '#fef2f2' },
  { icon: '💻', label: 'Code Generation', query: 'Help me generate code for this feature', tone: '#e0e7ff' },
  { icon: '📄', label: 'Document Analysis', query: 'Analyze this document and summarize key points', tone: '#f5f3ff' },
  { icon: '🌐', label: 'Translate', query: 'Translate this content for multiple markets', tone: '#cffafe' },
  { icon: '🧭', label: 'Just Exploring', query: 'Help me explore the best AI tools for my goals', tone: '#f4f4f5' },
];

const SEARCH_CONTROLS = [
  { type: 'mic', tip: 'Voice prompt', color: '#7c3aed', bg: '#f3e8ff', border: 'rgba(124,58,237,0.22)' },
  { type: 'file', tip: 'Attach file', color: '#d97706', bg: '#fff7ed', border: 'rgba(217,119,6,0.22)' },
  { type: 'image', tip: 'Image workflow', color: '#2563eb', bg: '#eff6ff', border: 'rgba(37,99,235,0.22)' },
  { type: 'voiceTyping', tip: 'Voice typing', color: '#0891b2', bg: '#ecfeff', border: 'rgba(8,145,178,0.22)' },
  { type: 'video', tip: 'Video input', color: '#dc2626', bg: '#fef2f2', border: 'rgba(220,38,38,0.22)' },
  { type: 'screen', tip: 'Screen sharing', color: '#059669', bg: '#ecfdf5', border: 'rgba(5,150,105,0.22)' },
] as const;

const MORE_ACTIONS = [
  { id: 'clear', label: 'Clear', desc: 'Start fresh with an empty box.' },
  { id: 'surprise', label: 'Surprise me', desc: 'Drop in a ready-made prompt idea.' },
  { id: 'research', label: 'Research prompt', desc: 'Prefill a deeper model comparison brief.' },
] as const;

function useVoiceTyping(setValue: (value: string) => void, onToast: (message: string) => void) {
  const [typingActive, setTypingActive] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const toggle = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    const SR = (window as Window & {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    }).SpeechRecognition || (window as Window & {
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    }).webkitSpeechRecognition;

    if (!SR) {
      onToast('Voice input needs Chrome or Edge');
      return;
    }

    if (typingActive) {
      recRef.current?.stop();
      setTypingActive(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.onresult = (ev) => {
      const transcript = Array.from({ length: ev.results.length }, (_, index) => ev.results[index][0]?.transcript ?? '').join('');
      setValue(transcript);
    };
    recognition.onend = () => setTypingActive(false);
    recognition.start();
    recRef.current = recognition;
    setTypingActive(true);
  }, [onToast, setValue, typingActive]);

  return { typingActive, toggle };
}

function SearchControlIcon({ type }: { type: (typeof SEARCH_CONTROLS)[number]['type'] }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (type === 'mic') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" {...common}>
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    );
  }

  if (type === 'file') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" {...common}>
        <path d="M21.44 11.05 12.25 20.24a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    );
  }

  if (type === 'image') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  }

  if (type === 'voiceTyping') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" {...common}>
        <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" y1="18" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </svg>
    );
  }

  if (type === 'video') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" {...common}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    );
  }

  if (type === 'screen') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" {...common}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <line x1="8" y1="20" x2="16" y2="20" />
        <line x1="12" y1="16" x2="12" y2="20" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="15" height="15" {...common}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function HeroSearch({ onLaunch, onToast, onOpenAgents, placeholder, showSuggestions = true }: HeroSearchProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState(SUGGESTION_TABS[0].id);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const { typingActive, toggle: toggleVoiceTyping } = useVoiceTyping(setValue, onToast);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const currentTab = useMemo(
    () => SUGGESTION_TABS.find((tab) => tab.id === activeTab) ?? SUGGESTION_TABS[0],
    [activeTab]
  );

  const normalizedQuery = useCallback((query: string) => query, []);

  const autoGrow = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const go = useCallback(() => {
    const query = value.trim();
    if (!query && pendingAttachments.length === 0) {
      focusInput();
      return;
    }

    const launchQuery = query || 'Please review my attachment and respond to it.';

    if (pendingAttachments.length > 0) {
      savePendingChatDraft({
        query: normalizedQuery(launchQuery),
        attachments: pendingAttachments,
      });
    } else {
      clearPendingChatDraft();
    }

    onLaunch(normalizedQuery(launchQuery));
    setValue('');
    setPendingAttachments([]);
    setFocused(false);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [focusInput, normalizedQuery, onLaunch, pendingAttachments, value]);

  const handleSuggestionPick = useCallback((query: string, launchNow = false) => {
    setValue(query);
    setPendingAttachments([]);
    setMoreOpen(false);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.value = query;
        autoGrow(inputRef.current);
        inputRef.current.focus();
      }
    });

    if (launchNow) {
      clearPendingChatDraft();
      onLaunch(normalizedQuery(query));
      setValue('');
    }
  }, [autoGrow, normalizedQuery, onLaunch]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const attachment = await createPendingAttachment('file', file, file.name);
    setPendingAttachments([attachment]);
    const prompt = `Analyze the attached file "${file.name}" and help me understand the key takeaways`;
    setValue(prompt);
    onToast(`Attached ${file.name}`);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.value = prompt;
        autoGrow(inputRef.current);
      }
    });

    event.target.value = '';
  }, [autoGrow, onToast]);

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const attachment = await createPendingAttachment('image', file, file.name);
    setPendingAttachments([attachment]);
    const prompt = `Help me work with the image "${file.name}" by generating prompts, edits, and a creative brief`;
    setValue(prompt);
    onToast(`Image ready: ${file.name}`);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.value = prompt;
        autoGrow(inputRef.current);
      }
    });

    event.target.value = '';
  }, [autoGrow, onToast]);

  const handleVideoChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const attachment = await createPendingAttachment('video', file, file.name);
    setPendingAttachments([attachment]);
    const prompt = `Analyze the uploaded video "${file.name}" and help me with a summary, key scenes, captions, and next creative steps.`;
    setValue(prompt);
    onToast(`Video ready: ${file.name}`);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.value = prompt;
        autoGrow(inputRef.current);
      }
    });

    event.target.value = '';
  }, [autoGrow, onToast]);

  const handleVoiceNote = useCallback(async () => {
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

      recorder.onstop = async () => {
        mediaRecorderRef.current = null;
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        if (chunks.length === 0) {
          setRecording(false);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm';
        const attachment = await createPendingAttachment('audio', blob, `voice-note-${Date.now()}.${extension}`);

        setPendingAttachments((current) => {
          const filtered = current.filter((item) => item.kind !== 'audio');
          return [...filtered, attachment];
        });
        setValue((current) => current.trim() || 'Please listen to my voice note and respond to it.');
        onToast('Voice note is ready to send');
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

  const handleScreenShare = useCallback(async () => {
    if (screenRecording) {
      if (screenRecorderRef.current?.state === 'recording') {
        screenRecorderRef.current.requestData();
        screenRecorderRef.current.stop();
      }
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined') {
      onToast('Screen sharing is not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const videoTrack = stream.getVideoTracks()[0];
      const label = videoTrack?.label || 'Shared screen';
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      screenStreamRef.current = stream;
      screenRecorderRef.current = recorder;
      setScreenRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        screenRecorderRef.current = null;
        setScreenRecording(false);
        screenStreamRef.current?.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;

        if (chunks.length === 0) {
          return;
        }

        const recording = new File(chunks, `${label || 'screen-recording'}.webm`, {
          type: chunks[0] instanceof Blob && chunks[0].type ? chunks[0].type : 'video/webm',
        });
        const attachment = await createPendingAttachment('video', recording, recording.name);
        const prompt = `I recorded my screen "${label}". Review the screen recording, explain what happened, and help me with the next steps.`;

        setPendingAttachments([attachment]);
        setValue(prompt);
        onToast('Screen recording is ready to send');

        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.value = prompt;
            autoGrow(inputRef.current);
            inputRef.current.focus();
          }
        });
      };

      videoTrack?.addEventListener('ended', () => {
        if (recorder.state === 'recording') {
          recorder.requestData();
          recorder.stop();
        }
      });

      recorder.start();
      onToast('Screen recording started');
    } catch {
      setScreenRecording(false);
      onToast('Screen sharing was cancelled');
    }
  }, [autoGrow, onToast, screenRecording]);

  const handleControlAction = useCallback((type: (typeof SEARCH_CONTROLS)[number]['type'], event: React.MouseEvent) => {
    if (type === 'mic') {
      event.preventDefault();
      void handleVoiceNote();
      return;
    }

    if (type === 'voiceTyping') {
      toggleVoiceTyping(event);
      return;
    }

    event.preventDefault();

    if (type === 'file') {
      fileRef.current?.click();
      return;
    }

    if (type === 'image') {
      imageRef.current?.click();
      return;
    }

    if (type === 'video') {
      videoRef.current?.click();
      return;
    }

    if (type === 'screen') {
      void handleScreenShare();
      return;
    }

    const fallback = value.trim() || 'Help me choose the best AI model for my project';
    onLaunch(normalizedQuery(fallback));
  }, [handleScreenShare, handleVoiceNote, normalizedQuery, onLaunch, toggleVoiceTyping, value]);

  const handleMoreAction = useCallback((id: (typeof MORE_ACTIONS)[number]['id']) => {
    if (id === 'clear') {
      setValue('');
      setPendingAttachments([]);
      clearPendingChatDraft();
      setMoreOpen(false);
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.style.height = 'auto';
        inputRef.current.focus();
      }
      return;
    }

    if (id === 'research') {
      handleSuggestionPick('Compare the top AI models for pricing, context window, coding quality, and multimodal features');
      return;
    }

    const surprises = [
      'Find the best AI stack for launching a small SaaS in 30 days',
      'Create a content strategy for a new AI product launch',
      'Help me design and prototype a polished landing page',
      'Recommend the best AI tools for research-heavy work',
    ];
    const random = surprises[Math.floor(Math.random() * surprises.length)];
    handleSuggestionPick(random);
  }, [handleSuggestionPick]);

  const removePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  }, []);

  const showPanel = showSuggestions;

  return (
    <Box sx={{ width: '100%', maxWidth: 720, position: 'relative', mb: 2, zIndex: 100 }}>
      <Paper
        elevation={0}
        sx={{
          border: '1.5px solid',
          borderColor: focused ? 'primary.main' : 'rgba(0,0,0,0.14)',
          borderRadius: '24px',
          overflow: 'visible',
          transition: 'border-color 0.22s, box-shadow 0.22s, transform 0.22s',
          boxShadow: focused
            ? '0 0 0 4px rgba(200,98,42,0.1), 0 20px 48px rgba(28,26,22,0.14)'
            : '0 6px 24px rgba(28,26,22,0.08), 0 18px 60px rgba(28,26,22,0.06)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,252,248,0.98))',
          backdropFilter: 'blur(16px)',
        }}
      >
        {pendingAttachments.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: '10px',
              px: '18px',
              pt: '16px',
              pb: '4px',
            }}
          >
            {pendingAttachments.map((attachment) => (
              <Box
                key={attachment.id}
                sx={{
                  position: 'relative',
                  display: 'grid',
                  gap: '8px',
                  p: '12px',
                  borderRadius: '18px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 10px 24px rgba(28,26,22,0.06)',
                }}
              >
                <ButtonBase
                  onClick={() => removePendingAttachment(attachment.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    borderRadius: '999px',
                    background: 'rgba(28,26,22,0.08)',
                    color: '#1c1a16',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                  }}
                >
                  ×
                </ButtonBase>

                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#6f6155', pr: '28px' }}>
                  {attachment.name}
                </Typography>

                {attachment.kind === 'image' && (
                  <Box
                    component="img"
                    src={attachment.url}
                    alt={attachment.name}
                    sx={{
                      width: '100%',
                      maxHeight: 240,
                      objectFit: 'cover',
                      borderRadius: '14px',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  />
                )}

                {attachment.kind === 'video' && (
                  <Box
                    component="video"
                    src={attachment.url}
                    controls
                    sx={{
                      width: '100%',
                      maxHeight: 260,
                      borderRadius: '14px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      background: '#000',
                    }}
                  />
                )}

                {attachment.kind === 'audio' && (
                  <Box
                    component="audio"
                    src={attachment.url}
                    controls
                    sx={{ width: '100%' }}
                  />
                )}

                {attachment.kind === 'file' && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      px: '10px',
                      py: '9px',
                      borderRadius: '12px',
                      background: '#f7f3ef',
                      color: '#5a5148',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>File ready to send</span>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: '18px', pt: '14px', pb: '6px' }}>
          <Box
            component="textarea"
            ref={inputRef}
            placeholder={placeholder ?? 'Click here and type anything - or just say hi'}
            value={value}
            rows={1}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              setValue(event.target.value);
              autoGrow(event.target);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                go();
              }
            }}
            sx={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.97rem',
              color: 'text.primary',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.55,
              minHeight: '26px',
              maxHeight: '160px',
              p: 0,
              overflowY: 'auto',
              '&::placeholder': { color: '#9e9b93', fontSize: '0.93rem' },
            }}
          />

          <Box sx={{ display: 'flex', gap: '5px', flexShrink: 0, mt: '2px', position: 'relative' }}>
            <Tooltip title="Upload" arrow>
              <ButtonBase
                onClick={() => fileRef.current?.click()}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#14b8a6',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'scale(1.08)' },
                }}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </ButtonBase>
            </Tooltip>

            <Tooltip title="More" arrow>
              <ButtonBase
                onClick={() => setMoreOpen((open) => !open)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#1c1a16',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'scale(1.08)' },
                }}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="white">
                  <circle cx="12" cy="5" r="1.4" />
                  <circle cx="12" cy="12" r="1.4" />
                  <circle cx="12" cy="19" r="1.4" />
                </svg>
              </ButtonBase>
            </Tooltip>

            {moreOpen && (
              <Paper
                elevation={0}
                sx={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 220,
                  p: '8px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 16px 40px rgba(28,26,22,0.14)',
                  zIndex: 20,
                }}
              >
                {MORE_ACTIONS.map((action) => (
                  <ButtonBase
                    key={action.id}
                    onClick={() => handleMoreAction(action.id)}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      borderRadius: '12px',
                      px: '12px',
                      py: '10px',
                      gap: '2px',
                      '&:hover': { background: '#f7f2ee' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c1a16' }}>
                      {action.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#7a6a5e', lineHeight: 1.45 }}>
                      {action.desc}
                    </Typography>
                  </ButtonBase>
                ))}
              </Paper>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, px: '18px', pb: '8px' }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#9e9b93', fontWeight: 600 }}>
            Prompt mode
          </Typography>
          {pendingAttachments[0] ? (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                px: '10px',
                py: '5px',
                borderRadius: '999px',
                background: '#f3f4f6',
                color: '#3f3a34',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <span>📎</span>
              <span>{pendingAttachments[0].name}</span>
            </Box>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: '10px', pb: '10px', pt: '4px', flexWrap: 'wrap' }}>
          {SEARCH_CONTROLS.map((button) => {
            const active = (recording && button.type === 'mic')
              || (typingActive && button.type === 'voiceTyping')
              || (screenRecording && button.type === 'screen');

            return (
              <Tooltip key={button.type} title={button.tip} arrow>
                <ButtonBase
                  onClick={(event) => handleControlAction(button.type, event)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: active ? '#dc2626' : button.border,
                    background: active ? '#dc2626' : button.bg,
                    color: active ? '#fff' : button.color,
                    flexShrink: 0,
                    transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.06)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      background: button.color,
                      borderColor: button.color,
                      color: '#fff',
                    },
                    '&:active': { transform: 'scale(0.95)' },
                  }}
                >
                  <SearchControlIcon type={button.type} />
                </ButtonBase>
              </Tooltip>
            );
          })}

          <Box sx={{ width: '1px', height: '22px', background: 'rgba(0,0,0,0.1)', flexShrink: 0, mx: '2px' }} />

          <ButtonBase
            onClick={onOpenAgents}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              px: '0.8rem',
              py: '0.38rem',
              borderRadius: '999px',
              border: '1.5px solid',
              borderColor: '#1c1a16',
              background: '#1c1a16',
              color: '#fff',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              transition: 'all 0.18s',
              '&:hover': {
                background: '#111',
                borderColor: '#111',
                color: '#fff',
              },
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Agent
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                fontSize: '0.66rem',
              }}
            >
              +
            </Box>
          </ButtonBase>

          <Box sx={{ flex: 1, minWidth: 16 }} />

          <ButtonBase
            onClick={go}
            sx={{
              background: 'linear-gradient(135deg, #c8622a, #d4693a)',
              color: '#fff',
              border: 'none',
              px: '1.2rem',
              py: '0.56rem',
              borderRadius: '999px',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(200,98,42,0.28)',
              transition: 'all 0.18s',
              '&:hover': {
                background: 'linear-gradient(135deg, #b8561e, #c8622a)',
                transform: 'translateY(-1px)',
                boxShadow: '0 10px 24px rgba(200,98,42,0.34)',
              },
              '&:active': { transform: 'translateY(0) scale(0.97)' },
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Let&apos;s go
          </ButtonBase>
        </Box>
      </Paper>

      <Fade in={showPanel} timeout={260}>
        <Box
          sx={{
            display: showPanel ? 'block' : 'none',
            width: '100%',
            mt: '12px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: '22px',
              border: '1.5px solid rgba(0,0,0,0.1)',
              boxShadow: '0 14px 34px rgba(28,26,22,0.1)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(252,248,244,0.98))',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-25% auto auto 55%',
                width: 240,
                height: 240,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,98,42,0.12), transparent 70%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: '16px',
                pt: '14px',
                pb: '10px',
                borderBottom: '1px solid rgba(0,0,0,0.07)',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontSize: '0.74rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c8622a', fontWeight: 800 }}>
                  Guided discovery
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: '#6d655d', mt: '3px' }}>
                  Pick a lane, grab a starter prompt, and launch in one click.
                </Typography>
              </Box>
              <ButtonBase
                onClick={() => onLaunch('Help me choose the right AI model for my goal')}
                sx={{
                  px: '12px',
                  py: '8px',
                  borderRadius: '999px',
                  background: '#fdf1eb',
                  color: '#c8622a',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                }}
              >
                AI guide
              </ButtonBase>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                p: '14px 14px 10px',
                position: 'relative',
                zIndex: 1,
                alignItems: 'stretch',
              }}
            >
              {SUGGESTION_TABS.map((tab) => (
                <ButtonBase
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    px: '11px',
                    py: '10px',
                    minHeight: 54,
                    border: '1px solid',
                    borderColor: activeTab === tab.id ? 'rgba(200,98,42,0.32)' : 'rgba(0,0,0,0.08)',
                    background: activeTab === tab.id
                      ? 'linear-gradient(135deg, rgba(200,98,42,0.16), rgba(255,245,238,0.98))'
                      : 'rgba(255,255,255,0.82)',
                    color: activeTab === tab.id ? '#1c1a16' : '#58534b',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: activeTab === tab.id
                      ? '0 10px 22px rgba(200,98,42,0.12)'
                      : '0 2px 8px rgba(28,26,22,0.04)',
                    borderRadius: '999px',
                    flex: {
                      xs: '1 1 calc(50% - 10px)',
                      md: '0 1 auto',
                    },
                    minWidth: {
                      xs: 'calc(50% - 10px)',
                      md: 'auto',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'rgba(200,98,42,0.24)',
                      background: activeTab === tab.id
                        ? 'linear-gradient(135deg, rgba(200,98,42,0.18), rgba(255,246,239,1))'
                        : '#fffaf6',
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: activeTab === tab.id ? '#c8622a' : '#f3ede7',
                      color: activeTab === tab.id ? '#fff' : '#6b6259',
                      flexShrink: 0,
                    }}
                  >
                    {tab.icon}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: activeTab === tab.id ? '#1c1a16' : '#4f4942',
                        lineHeight: 1.2,
                      }}
                    >
                      {tab.label}
                    </Typography>
                  </Box>
                </ButtonBase>
              ))}
            </Box>

            <Box sx={{ p: '0 12px 14px', display: 'grid', gap: '8px' }}>
              {currentTab.items.map((item) => (
                <ButtonBase
                  key={item.text}
                  onClick={() => handleSuggestionPick(item.query)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    px: '14px',
                    py: '12px',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: 'rgba(255,255,255,0.86)',
                    textAlign: 'left',
                    transition: 'transform 0.18s, border-color 0.18s, box-shadow 0.18s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'rgba(200,98,42,0.22)',
                      boxShadow: '0 8px 18px rgba(200,98,42,0.08)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '12px',
                      background: '#f7efe9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1c1a16', lineHeight: 1.35 }}>
                      {item.text}
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: '#8d8276', mt: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.query}
                    </Typography>
                  </Box>
                  <ButtonBase
                    onClick={(event) => {
                      event.stopPropagation();
                      onLaunch(normalizedQuery(item.query));
                    }}
                    sx={{
                      px: '12px',
                      py: '8px',
                      borderRadius: '999px',
                      background: '#1c1a16',
                      color: '#fff',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    Run
                  </ButtonBase>
                </ButtonBase>
              ))}
            </Box>

            <Box
              sx={{
                px: '16px',
                py: '10px 14px',
                borderTop: '1px solid rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#9e9b93',
              }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f4f2ee',
                  fontSize: '0.75rem',
                }}
              >
                i
              </Box>
              <Typography sx={{ fontSize: '0.74rem', lineHeight: 1.5 }}>
                Click a card to fill the search box, or hit <strong>Run</strong> to jump straight into the workspace.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Fade>

      <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
      <input ref={imageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
      <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoChange} />
    </Box>
  );
}

export function ActionTiles({ onLaunch }: { onLaunch: (query: string) => void }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(4, minmax(0, 1fr))',
          md: 'repeat(7, minmax(0, 1fr))',
        },
        gap: '12px',
        width: '100%',
        maxWidth: 980,
        mt: 2,
      }}
      role="list"
    >
      {ACTION_TILES.map((tile, index) => (
        <ButtonBase
          key={tile.label}
          role="listitem"
          onClick={() => onLaunch(tile.query)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            minHeight: 92,
            px: '12px',
            py: '14px',
            borderRadius: '18px',
            border: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.94)',
            boxShadow: '0 6px 18px rgba(28,26,22,0.05)',
            transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            animation: 'tileRise 0.42s ease both',
            animationDelay: `${0.08 + index * 0.035}s`,
            '@keyframes tileRise': {
              from: { opacity: 0, transform: 'translateY(12px) scale(0.94)' },
              to: { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
            '&:hover': {
              transform: 'translateY(-5px)',
              borderColor: 'rgba(200,98,42,0.24)',
              boxShadow: '0 16px 28px rgba(200,98,42,0.12)',
              background: '#fffaf6',
            },
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: tile.tone,
              fontSize: '1.35rem',
            }}
            aria-hidden="true"
          >
            {tile.icon}
          </Box>
          <Typography
            sx={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#3f3a34',
              lineHeight: 1.2,
              textAlign: 'center',
            }}
          >
            {tile.label}
          </Typography>
        </ButtonBase>
      ))}
    </Box>
  );
}

export default HeroSearch;
