import type { Metadata } from 'next';
import WorkspaceClient from '@/components/WorkspaceClient';

export const metadata: Metadata = {
  title: 'Workspace | NexusAI',
  description: 'Your protected NexusAI workspace.',
};

export default function WorkspacePage() {
  return <WorkspaceClient />;
}
