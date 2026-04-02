'use client';
import { AuthProfile, Model } from '@/lib/types';
import ChatHub from './ChatHub';
import Marketplace from './Marketplace';
import AgentBuilder from './AgentBuilder';
import ResearchView from './ResearchView';

type Tab = 'chat' | 'marketplace' | 'agents' | 'research';

interface AppShellProps {
  initialQuery: string;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  activeModel: Model;
  onModelChange: (model: Model) => void;
  onOpenModal: (modelId: string, tab?: string) => void;
  onToast: (msg: string) => void;
  onSelectModel: (model: Model) => void;
  currentUser: AuthProfile | null;
}

export default function AppShell({
  initialQuery, tab, onTabChange, activeModel, onModelChange, onOpenModal, onToast, onSelectModel, currentUser,
}: AppShellProps) {
  const handleChatAction = () => {
    onTabChange('chat');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'chat' && (
          <ChatHub
            onSwitchTab={onTabChange}
            initialQuery={initialQuery}
            activeModel={activeModel}
            onModelChange={onModelChange}
            onOpenModal={onOpenModal}
            onToast={onToast}
            currentUser={currentUser}
          />
        )}
        {tab === 'marketplace' && (
          <Marketplace
            onSelectModel={onSelectModel}
            onOpenModal={onOpenModal}
            onToast={onToast}
          />
        )}
        {tab === 'agents' && (
          <AgentBuilder
            onOpenModal={onOpenModal}
            onChatAction={handleChatAction}
            onToast={onToast}
          />
        )}
        {tab === 'research' && (
          <ResearchView onToast={onToast} />
        )}
      </div>
    </div>
  );
}
