import { Suspense } from 'react';
import type { Metadata } from 'next';
import SignUp from '@/components/auth/SignUp';

export const metadata: Metadata = {
  title: 'Create account | NexusAI',
  description: 'Register for NexusAI and access your AI workspace.',
};

export default function SignUpPage() {
  return <Suspense><SignUp /></Suspense>;
}
