import type { Metadata } from 'next';
import AgentsClient from '@/components/agents/AgentsClient';

export const metadata: Metadata = {
  title: 'Agents | NexusAI',
  description: 'Build and manage AI agents on NexusAI.',
};

export default function AgentsPage() {
  return <AgentsClient />;
}
