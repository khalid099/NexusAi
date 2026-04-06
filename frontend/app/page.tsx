import { Suspense } from 'react';
import type { Metadata } from 'next';
import LandingClient from '@/components/home/LandingClient';

export const metadata: Metadata = {
  title: 'NexusAI',
  description: 'Discover, compare, and launch the right AI models with guided discovery.',
};

export default function HomePage() {
  return (
    <Suspense>
      <LandingClient />
    </Suspense>
  );
}
