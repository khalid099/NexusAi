export interface OnboardingOption {
  e: string;
  l: string;
  sub: string;
}

export interface OnboardingQuestion {
  k: string;
  q: string;
  hint: string;
  opts: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    k: 'task', q: 'What do you want to do?',
    hint: "Pick whichever feels closest — there's no wrong answer 😊",
    opts: [
      { e: '✍️', l: 'Write something',         sub: 'Emails, posts, stories, reports' },
      { e: '🎨', l: 'Make pictures or art',     sub: 'Images, logos, designs, photos' },
      { e: '💻', l: 'Build something',           sub: 'Websites, apps, tools, scripts' },
      { e: '📊', l: 'Make sense of info',        sub: 'Files, numbers, documents, data' },
      { e: '⚡', l: 'Save time on boring tasks', sub: 'Things that repeat every day' },
      { e: '💬', l: 'Get help or answers',       sub: 'Questions, ideas, brainstorming' },
    ],
  },
  {
    k: 'role', q: 'What best describes you?',
    hint: 'Just pick the one that feels most like you',
    opts: [
      { e: '🎓', l: 'Still learning',        sub: 'Student or new to this field' },
      { e: '💼', l: 'I work in an office',   sub: 'Business, meetings, spreadsheets' },
      { e: '🎨', l: 'I make things',         sub: 'Art, design, writing, content' },
      { e: '📣', l: 'I run or sell things',  sub: 'Shop, brand, marketing, clients' },
      { e: '💻', l: 'I build with computers',sub: 'Code, websites, tech stuff' },
      { e: '🏠', l: 'Just for myself',       sub: 'Personal projects and hobbies' },
    ],
  },
  {
    k: 'tone', q: 'How should it sound?',
    hint: "Think of the vibe you'd want from a helper",
    opts: [
      { e: '😊', l: 'Warm and friendly',  sub: 'Like chatting with a mate' },
      { e: '👔', l: 'Clean and proper',   sub: 'Like a polished business email' },
      { e: '📖', l: 'Clear and easy',     sub: 'Simple words, step-by-step' },
      { e: '🚀', l: 'Bold and exciting',  sub: 'Energetic, confident, punchy' },
    ],
  },
  {
    k: 'format', q: 'What should the answer look like?',
    hint: 'How do you want to receive the result?',
    opts: [
      { e: '📝', l: 'A full piece of writing', sub: 'Ready to copy and use' },
      { e: '📋', l: 'A simple list',           sub: 'Clear bullet points or steps' },
      { e: '📊', l: 'A short summary',         sub: 'Just the key points' },
      { e: '💡', l: 'A few different ideas',   sub: 'Options to pick from' },
    ],
  },
];
