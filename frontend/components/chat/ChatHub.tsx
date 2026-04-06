'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MODELS, CATEGORY_PROMPTS } from '@/lib/mock-data';
import { apiRequest, getApiBaseUrl, readAccessToken } from '@/lib/auth';
import { AuthProfile, ChatMessage, Model } from '@/lib/types';
import styles from './ChatHub.module.css';

interface ChatHubProps {
  onSwitchTab: (tab: 'chat' | 'marketplace' | 'agents' | 'research') => void;
  initialQuery?: string;
  activeModel: Model;
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
  'What can I build with AI?', 'Compare GPT-4o vs Claude', 'Best model for coding',
  'Create an image', 'Explain RAG simply', 'Best free open-source model',
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

const GUEST_CHAT_KEY = 'nexusai.guestChat';
const AUTH_SESSION_KEY = 'nexusai.activeChatSessionId';

function buildAiReply(msg: string, model: Model): string {
  const l = msg.toLowerCase();
  if (l.includes('compare') || l.includes('vs')) {
    return `Great question! Here's a quick comparison between top models:\n\n**Claude Opus 4.6** excels at long-context reasoning and nuanced writing.\n**GPT-5.4** leads in code generation and multimodal tasks.\n**Gemini 2.5 Pro** has the largest context window (2M tokens) and native search grounding.\n\nFor your use case, I'd recommend starting with **${model.name}** given your context. Want me to go deeper on any of these?`;
  }
  if (l.includes('code') || l.includes('build') || l.includes('develop')) {
    return `For coding tasks, **${model.name}** is an excellent choice. It excels at:\n\n- Code generation in 20+ languages\n- Debugging and explaining complex code\n- Architecture and design patterns\n- Code review and refactoring\n\nTry: *"Write a Next.js API route that fetches data from an external API with error handling"*`;
  }
  if (l.includes('image') || l.includes('picture') || l.includes('art')) {
    return `For image generation, I'd recommend **DALL·E 4** or **Midjourney v7**.\n\n- **DALL·E 4**: photorealistic images with strong prompt-following\n- **Stable Diffusion XL**: open-source and highly customizable\n\nWant me to open the image generation models in the marketplace?`;
  }
  return `I understand you're looking for help with: *"${msg}"*\n\nWith **${model.name}**, I can help you with this. Here are a few approaches:\n\n1. **Direct approach**: provide your context and get an answer\n2. **Guided workflow**: use the Agent Builder to create a repeatable process\n3. **Template library**: start from a ready-made prompt\n\nWhat would you like to explore first?`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapFrontendModelToBackend(modelId: string) {
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
    content: message.content,
  }));
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
  onSwitchTab, initialQuery, activeModel,
  onModelChange, onOpenModal, onToast, currentUser,
}: ChatHubProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuery || '');
  const [typing, setTyping] = useState(false);
  const [catTab, setCatTab] = useState('use_cases');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const initialQueryHandledRef = useRef(false);
  const isGuest = Boolean(currentUser?.isGuest);

  useEffect(() => {
    let active = true;

    async function bootstrapChat() {
      if (isGuest) {
        const guestChat = readGuestChat();
        if (guestChat?.messages?.length) {
          if (guestChat.modelId && guestChat.modelId !== activeModel.id) {
            const nextModel = MODELS.find((model) => model.id === guestChat.modelId);
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
  }, [activeModel.id, initialQuery, isGuest, onModelChange, onToast]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (!isGuest || typeof window === 'undefined') return;

    const payload: PersistedGuestChat = {
      modelId: activeModel.id,
      messages,
    };

    window.sessionStorage.setItem(GUEST_CHAT_KEY, JSON.stringify(payload));
  }, [activeModel.id, isGuest, messages]);

  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;
    window.sessionStorage.setItem(AUTH_SESSION_KEY, sessionId);
  }, [sessionId]);

  const sendAuthenticatedMessage = useCallback(async (text: string) => {
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
        model: mapFrontendModelToBackend(activeModel.id),
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
  }, [activeModel.id, messages, onToast, sessionId]);

  const sendGuestMessage = useCallback(async (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `${Date.now()}`,
      role: 'user',
      content: text,
      time: timestamp,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    const aiMessage: ChatMessage = {
      id: `${Date.now() + 1}`,
      role: 'ai',
      content: buildAiReply(text, activeModel),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((current) => [...current, aiMessage]);
  }, [activeModel]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;

    try {
      if (isGuest) {
        await sendGuestMessage(msg);
      } else {
        await sendAuthenticatedMessage(msg);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message';
      onToast(message);
    } finally {
      setTyping(false);
    }
  }, [input, isGuest, onToast, sendAuthenticatedMessage, sendGuestMessage, typing]);

  useEffect(() => {
    if (!isBootstrapped || !initialQuery) return;
    if (initialQueryHandledRef.current) return;
    if (messages.length > 0) return;

    initialQueryHandledRef.current = true;
    void sendMessage(initialQuery);
  }, [initialQuery, isBootstrapped, messages.length, sendMessage]);

  const filteredModels = MODELS.filter((m) =>
    m.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    m.org.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );

  return (
    <div className={styles.appPage}>
      <div className={styles.appBody}>
        <aside className={styles.sidebar}>
          <div className={styles.sbSec}>
            <div className={styles.sbLbl}>Search Models</div>
            <input
              className={styles.sbSearch}
              placeholder="Filter models..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>
          <div className={styles.sbSec}>
            <div className={styles.sbLbl}>Models</div>
            {filteredModels.map((m) => (
              <div
                key={m.id}
                className={`${styles.sbModel} ${m.id === activeModel.id ? styles.sbModelOn : ''}`}
                onClick={() => onModelChange(m)}
              >
                <div className={styles.sbMi} style={{ background: m.iconBg }}>{m.icon}</div>
                <div>
                  <div className={styles.sbMn}>{m.name}</div>
                  <div className={styles.sbMs}><span className={`${styles.sdot} ${styles.live}`} />{m.org}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className={styles.central}>
          <div className={styles.chatArea} ref={chatAreaRef}>
            {messages.length === 0 && (
              <div className={styles.greetCard}>
                <div className={styles.greetAvatar}>✦</div>
                <h3>{isGuest ? 'Guest workspace' : 'Welcome to NexusAI Hub'}</h3>
                <p>
                  {isGuest
                    ? 'Your guest chat is stored in this browser session. Create an account whenever you want to keep history in your workspace.'
                    : 'Your authenticated chat is saved to the backend, so you can come back to it later.'}
                </p>
                <div className={styles.gchips}>
                  {GREET_CHIPS.map((chip) => (
                    <button key={chip} className={styles.gchip} onClick={() => void sendMessage(chip)}>{chip}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}>
                <div className={styles.msgAv}>{msg.role === 'user' ? 'U' : '✦'}</div>
                <div>
                  <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                    {msg.content.split('\n').map((line, i) => (
                      <span key={`${msg.id}-${i}`}>
                        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                          j % 2 === 1 ? <strong key={`${msg.id}-${i}-${j}`}>{part}</strong> : part,
                        )}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <div className={styles.msgMeta}>
                    {msg.time} · {msg.role === 'ai' ? activeModel.name : 'You'}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className={`${styles.msg} ${styles.msgAi}`}>
                <div className={styles.msgAv}>✦</div>
                <div className={styles.typingInd}>
                  <div className={styles.td} /><div className={styles.td} /><div className={styles.td} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.inpArea}>
            <div className={styles.inpRow}>
              <div className={styles.inpWrap}>
                <textarea
                  id="chat-input"
                  className={styles.inpTextarea}
                  placeholder={`Message ${activeModel.name}...`}
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
                  <button className={styles.itool} onClick={() => onToast('File upload coming soon!')}>📎</button>
                  <button className={styles.itool} onClick={() => onToast('Image upload coming soon!')}>🖼️</button>
                  <button className={styles.itool} onClick={() => onOpenModal(activeModel.id, 'prompt')}>✦</button>
                  <div className={styles.modelSel} onClick={() => onOpenModal(activeModel.id)}>
                    <span>{activeModel.name}</span>
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>
              <button className={styles.sendBtn} onClick={() => void sendMessage()}>
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
                    className={`${styles.cpanelTab} ${catTab === tab.id ? styles.cpanelTabActive : ''}`}
                    onClick={() => setCatTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className={styles.cpanelPrompts}>
                {(CATEGORY_PROMPTS[catTab] || []).map((prompt) => (
                  <button key={prompt} className={styles.cpanelPrompt} onClick={() => void sendMessage(prompt)}>{prompt}</button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className={styles.rpanel}>
          <div className={styles.rpSec}>
            <div className={styles.rpLbl}>Active Model</div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.875rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: activeModel.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{activeModel.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: '0.875rem' }}>{activeModel.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>by {activeModel.org}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', background: 'var(--teal-lt)', color: 'var(--teal)', padding: '0.15rem 0.5rem', borderRadius: '2rem', fontWeight: 600 }}>
                  {isGuest ? 'Guest' : 'Saved'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '0.625rem' }}>{activeModel.desc.slice(0, 80)}...</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: '0.75rem' }}>
                {[
                  { v: activeModel.ctx, l: 'Context' },
                  { v: activeModel.price.split('/')[0], l: 'Price' },
                  { v: `${activeModel.rating}★`, l: 'Rating' },
                ].map((stat) => (
                  <div key={stat.l} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>{stat.v}</strong>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{stat.l}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.75rem', padding: '0.45rem' }} onClick={() => onOpenModal(activeModel.id)}>Details</button>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.75rem', padding: '0.45rem' }} onClick={() => onOpenModal(activeModel.id, 'pricing')}>Pricing</button>
              </div>
            </div>
          </div>

          <div className={styles.rpSec} style={{ flex: 1 }}>
            <div className={styles.rpLbl}>Quick Actions</div>
            <div className={styles.qaGrid}>
              {[
                { icon: '🛍', text: 'Browse Marketplace', action: () => onSwitchTab('marketplace') },
                { icon: '🤖', text: 'Build an Agent', action: () => onOpenModal(activeModel.id, 'agent') },
                { icon: '📐', text: 'Prompt Engineering', action: () => onOpenModal(activeModel.id, 'prompt') },
                { icon: '💰', text: 'View Pricing', action: () => onOpenModal(activeModel.id, 'pricing') },
                { icon: '📊', text: 'Compare Models', action: () => void sendMessage('Compare all top AI models') },
                { icon: '🎨', text: 'Create Image', action: () => void sendMessage('Create an image for me') },
                { icon: '✍️', text: 'Write Content', action: () => void sendMessage('Help me write content') },
                { icon: '💻', text: 'Code Generation', action: () => void sendMessage('Help me with code generation') },
              ].map((qa) => (
                <button key={qa.text} className={styles.qaBtn} onClick={qa.action}>
                  <span className={styles.qaIcon}>{qa.icon}</span>
                  <span>{qa.text}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
