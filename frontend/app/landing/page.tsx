import { Suspense } from 'react';
import type { Metadata } from 'next';
import LandingClient from '@/components/home/LandingClient';

export const metadata: Metadata = {
  title: 'NexusAI Landing',
  description: 'Explore NexusAI after signing in.',
};

export default function LandingPageRoute() {
  return (
    <Suspense>
      <LandingClient />
    </Suspense>
  );
}
