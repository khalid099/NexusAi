export interface Lab {
  id: string;
  name: string;
  icon: string;
  count?: number;
  color?: string;
  sub?: string;
}

export const LABS: Lab[] = [
  { id: 'openai',    name: 'OpenAI',          icon: '⬛', color: '#111111', sub: 'GPT-5.4 · DALL·E 4 · Sora 2' },
  { id: 'anthropic', name: 'Anthropic',        icon: '✦',  color: '#c8622a', sub: 'Opus 4.6 · Sonnet 4.6 · Haiku' },
  { id: 'google',    name: 'Google DeepMind',  icon: '✶',  color: '#4285f4', sub: 'Gemini 3.1 Pro · Veo 3 · Gemma' },
  { id: 'xai',       name: 'xAI (Grok)',       icon: '✕',  color: '#222222', sub: 'Grok-4 Fast · Grok-Imagine' },
  { id: 'deepseek',  name: 'DeepSeek',         icon: '🔷', color: '#1d6fe8', sub: 'V3 · R1 · Coder v3' },
  { id: 'meta',      name: 'Meta (Llama)',      icon: '🦙', color: '#1877f2', sub: 'Llama 4 Maverick · Scout' },
  { id: 'qwen',      name: 'Alibaba (Qwen)',    icon: '🔶', color: '#ff6a00', sub: 'Qwen3-Max · QVQ · Coder' },
  { id: 'mistral',   name: 'Mistral',           icon: '🌊', color: '#f5821f', sub: 'Large 3 · Devstral 2 · Codestral' },
  { id: 'nvidia',    name: 'NVIDIA NIM',        icon: '🟢', color: '#76b900', sub: 'Nemotron Ultra · Nano · Phi-4' },
  { id: 'glm',       name: 'GLM (Zhipu)',       icon: '🔷', color: '#5c6bc0', sub: 'GLM-5 · GLM-4.7 · CogVideoX' },
  { id: 'moonshot',  name: 'Moonshot (Kimi)',   icon: '🌙', color: '#6c63ff', sub: 'k2.5 · k2-Thinking' },
];
