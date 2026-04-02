import type { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';

export const metadata: Metadata = {
  title: 'NexusAI Landing',
  description: 'Explore NexusAI after signing in.',
};

export default function LandingPageRoute() {
  return <LandingClient />;
}
