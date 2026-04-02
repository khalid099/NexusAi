import type { Metadata } from 'next';
import MarketplaceClient from '@/components/MarketplaceClient';

export const metadata: Metadata = {
  title: 'Marketplace | NexusAI',
  description: 'Browse AI models on NexusAI.',
};

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
