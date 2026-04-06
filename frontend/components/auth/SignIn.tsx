'use client';

import { useSearchParams } from 'next/navigation';
import { sanitizeNextPath } from '@/lib/auth';
import AuthModal from '@/components/auth/AuthModal';

export default function SignIn() {
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get('next'));

  return <AuthModal inlinePage initialMode="signin" nextPath={nextPath} />;
}
