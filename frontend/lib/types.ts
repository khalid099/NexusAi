export interface ModelVariant {
  id: string;
  name: string;
  ctx: string;
  price: string;
  note?: string;
}

export interface Model {
  id: string;
  name: string;
  org: string;
  provider?: string;
  icon: string;
  iconBg: string;
  badge: 'new' | 'hot' | 'open' | 'beta';
  desc: string;
  tags: { label: string; cls: string }[];
  rating: number;
  reviews: number;
  price: string;
  category: string[];
  lab: string;
  ctx: string;
  latency: string;
  mmlu?: string;
  humaneval?: string;
  math?: string;
  backendModelId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  time: string;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  kind: 'file' | 'image' | 'video' | 'audio';
  name: string;
  url: string;
  mimeType?: string;
}

export type AppView = 'landing' | 'app';
export type ChatTab = 'chat' | 'marketplace' | 'agents' | 'research';

export interface OnboardingAnswers {
  task?: string;
  role?: string;
  context?: string;
  tone?: string;
  format?: string;
  audience?: string;
  depth?: string;
  experience?: string;
  constraint?: string;
}

export interface AuthProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  plan?: string;
  isVerified?: boolean;
  isGuest?: boolean;
}
