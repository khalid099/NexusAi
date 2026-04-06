import { Suspense } from 'react';
import type { Metadata } from 'next';
import WorkspaceClient from '@/components/layout/WorkspaceClient';

export const metadata: Metadata = {
  title: 'Workspace | NexusAI',
  description: 'Your protected NexusAI workspace.',
};

export default function WorkspacePage() {
  return <Suspense><WorkspaceClient /></Suspense>;
}
