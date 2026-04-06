export interface AgentTemplate {
  icon: string;
  title: string;
  desc: string;
  tags: string[];
  model: string;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    icon: '🔍',
    title: 'Research Agent',
    desc: 'Automates web research, summarises findings, and generates structured reports on demand.',
    tags: ['GPT-5.4', 'Web search', 'Reports'],
    model: 'gpt5',
  },
  {
    icon: '💼',
    title: 'Customer Support Agent',
    desc: 'Handles tickets, FAQs, and escalates complex issues with full conversation context.',
    tags: ['GPT-5.4', 'Ticketing', 'Escalation'],
    model: 'gpt5',
  },
  {
    icon: '💻',
    title: 'Code Review Agent',
    desc: 'Reviews pull requests, flags bugs, suggests improvements, and explains changes inline.',
    tags: ['Claude 4.6', 'GitHub', 'Code'],
    model: 'claude-opus',
  },
  {
    icon: '📊',
    title: 'Data Analysis Agent',
    desc: 'Processes spreadsheets, generates insights, creates visualisations, and answers data questions.',
    tags: ['Gemini', 'Spreadsheets', 'Charts'],
    model: 'gemini31-pro',
  },
  {
    icon: '✍️',
    title: 'Content Writer Agent',
    desc: 'Creates blog posts, social content, and marketing copy with consistent brand voice.',
    tags: ['Claude 4.6', 'Marketing', 'SEO'],
    model: 'claude-opus',
  },
  {
    icon: '📧',
    title: 'Email Automation Agent',
    desc: 'Reads incoming emails, drafts smart replies, and prioritises your inbox automatically.',
    tags: ['GPT-5.4', 'Email', 'Automation'],
    model: 'gpt5',
  },
];

export const TAG_COLORS: Record<string, string> = {
  'GPT-5.4': 't-blue',
  'GPT-4o': 't-blue',
  'Claude 4.6': 't-accent',
  'Gemini': 't-teal',
  'Web search': 't-teal',
  'Reports': 't-amber',
  'Ticketing': 't-teal',
  'Escalation': 't-rose',
  'GitHub': 't-blue',
  'Code': 't-teal',
  'Spreadsheets': 't-teal',
  'Charts': 't-amber',
  'Marketing': 't-accent',
  'SEO': 't-blue',
  'Email': 't-blue',
  'Automation': 't-teal',
};
