export interface ResearchPost {
  date: string;
  org: string;
  title: string;
  summary: string;
  tag?: string;
  tagCls?: string;
}

export const RESEARCH_POSTS: ResearchPost[] = [
  {
    date: 'Mar 26', org: 'Google DeepMind',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    summary: 'Scores 83.2% on AIME 2025 math competition, outperforming all prior models on reasoning-intensive tasks.',
    tag: 'Reasoning', tagCls: 't-blue',
  },
  {
    date: 'Mar 22', org: 'MIT CSAIL',
    title: 'Scaling laws for multimodal models: new empirical findings',
    summary: 'Research reveals unexpected scaling dynamics when combining vision and language — efficiency gains plateau earlier than expected.',
    tag: 'Research', tagCls: 't-teal',
  },
  {
    date: 'Mar 20', org: 'Anthropic',
    title: 'Claude Opus 4.6 sets new standard for instruction following',
    summary: 'New evals show Opus 4.6 follows complex, multi-step instructions 40% more reliably than its predecessor.',
    tag: 'Release', tagCls: 't-accent',
  },
  {
    date: 'Mar 18', org: 'Meta AI',
    title: 'Llama 4 Scout: open-weights model competitive with GPT-5.4',
    summary: 'Meta releases Llama 4 Scout with 128K context. Benchmarks show near-parity with GPT-5.4 on code and language tasks.',
    tag: 'Open Source', tagCls: 't-blue',
  },
  {
    date: 'Mar 15', org: 'Stanford HAI',
    title: 'The hidden cost of AI hallucinations in enterprise workflows',
    summary: 'Study quantifies productivity loss from AI hallucinations — up to 18% time overhead in document-heavy tasks.',
    tag: 'Safety', tagCls: 't-rose',
  },
  {
    date: 'Mar 12', org: 'OpenAI',
    title: 'GPT-5.4 now supports native agent orchestration',
    summary: 'OpenAI releases agent framework built into GPT-5.4. Models can now spawn sub-agents and manage parallel tool calls natively.',
    tag: 'Agents', tagCls: 't-amber',
  },
];

export const CATEGORY_PROMPTS: Record<string, string[]> = {
  use_cases: [
    'What can I build with GPT-4o?', 'Best model for code generation',
    'Compare Claude vs GPT for writing', 'Which model handles PDFs best?',
    'Models with function calling support', 'Best free open-source models',
  ],
  monitor: [
    'Latest AI model releases this week', 'GPT-4o vs Claude benchmark comparison',
    'Which model has the lowest latency?', 'Track API pricing changes',
    'New vision model capabilities', 'Open source models beating GPT-4',
  ],
  prototype: [
    'Build a chatbot in 5 minutes', 'Create an AI writing assistant',
    'Prototype an image classifier', 'Build a document Q&A system',
    'Create a code review agent', 'Build a customer support bot',
  ],
  business: [
    'AI tools for marketing automation', 'Build a sales email generator',
    'AI-powered customer insights', 'Automate data analysis workflows',
    'Create a competitive analysis agent', 'AI for financial modelling',
  ],
  create: [
    'Generate social media content', 'Write a blog post outline',
    'Create product descriptions', 'Generate marketing copy variations',
    'Write email sequences', 'Create video scripts',
  ],
  analyze: [
    'Analyze this document for key insights', 'Extract data from PDFs',
    'Summarize research papers', 'Compare multiple documents',
    'Find patterns in customer feedback', 'Research competitor landscape',
  ],
  learn: [
    'Explain transformer architecture simply', 'How does RAG work?',
    'What is prompt engineering?', 'Understand AI model pricing',
    'Learn about fine-tuning', 'Difference between GPT-4o and o1',
  ],
};
