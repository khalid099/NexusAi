import type { Metadata } from 'next';
import ChatClient from '@/components/chat/ChatClient';

export const metadata: Metadata = {
  title: 'Chat Hub | NexusAI',
  description: 'Chat with AI models on NexusAI.',
};

export default function ChatPage() {
  return <ChatClient />;
}
