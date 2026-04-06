export interface ResearchPostRecord {
  date: string;
  org: string;
  title: string;
  summary: string;
  tag?: string;
  tagCls?: string;
}

export const RESEARCH_POSTS: ResearchPostRecord[] = [
  {
    date: 'Mar 26',
    org: 'Google DeepMind',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    summary: 'Scores 83.2% on AIME 2025 math competition, outperforming all prior models on reasoning-intensive tasks.',
    tag: 'Reasoning',
    tagCls: 't-blue',
  },
  {
    date: 'Mar 22',
    org: 'MIT CSAIL',
    title: 'Scaling laws for multimodal models: new empirical findings',
    summary: 'Research reveals unexpected scaling dynamics when combining vision and language — efficiency gains plateau earlier than expected.',
    tag: 'Multimodal',
    tagCls: 't-teal',
  },
  {
    date: 'Mar 20',
    org: 'Anthropic',
    title: 'Claude Opus 4.6 sets new standard for instruction following',
    summary: 'New evals show Opus 4.6 follows complex, multi-step instructions 40% more reliably than its predecessor.',
    tag: 'Alignment',
    tagCls: 't-accent',
  },
  {
    date: 'Mar 18',
    org: 'Meta AI',
    title: 'Llama 4 Scout: open-weights model competitive with GPT-5.4',
    summary: 'Meta releases Llama 4 Scout with 128K context. Benchmarks show near-parity with GPT-5.4 on code and language tasks.',
    tag: 'Open Weights',
    tagCls: 't-blue',
  },
  {
    date: 'Mar 15',
    org: 'Stanford HAI',
    title: 'The hidden cost of AI hallucinations in enterprise workflows',
    summary: 'Study quantifies productivity loss from AI hallucinations — up to 18% time overhead in document-heavy tasks.',
    tag: 'Efficiency',
    tagCls: 't-rose',
  },
  {
    date: 'Mar 12',
    org: 'OpenAI',
    title: 'GPT-5.4 now supports native agent orchestration',
    summary: 'OpenAI releases agent framework built into GPT-5.4. Models can now spawn sub-agents and manage parallel tool calls natively.',
    tag: 'Reasoning',
    tagCls: 't-amber',
  },
];
