import type { Metadata } from 'next';
import SignIn from '@/components/SignIn';

export const metadata: Metadata = {
  title: 'Sign in | NexusAI',
  description: 'Sign in to NexusAI to access your workspace.',
};

export default function HomePage() {
  return <SignIn />;
}
