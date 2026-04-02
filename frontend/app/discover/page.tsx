import type { Metadata } from 'next';
import DiscoverClient from '@/components/DiscoverClient';

export const metadata: Metadata = {
  title: 'Discover New | NexusAI',
  description: 'Explore the latest AI research and models.',
};

export default function DiscoverPage() {
  return <DiscoverClient />;
}
