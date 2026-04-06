'use client';

import { ChatAttachment } from '@/lib/types';

export const LANDING_CHAT_DRAFT_KEY = 'nexusai.pendingChatDraft';

export interface PendingChatDraft {
  query: string;
  attachments: ChatAttachment[];
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function savePendingChatDraft(draft: PendingChatDraft) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(LANDING_CHAT_DRAFT_KEY, JSON.stringify(draft));
}

export function readPendingChatDraft(): PendingChatDraft | null {
  if (!canUseStorage()) return null;

  const raw = window.sessionStorage.getItem(LANDING_CHAT_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingChatDraft;
  } catch {
    window.sessionStorage.removeItem(LANDING_CHAT_DRAFT_KEY);
    return null;
  }
}

export function clearPendingChatDraft() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(LANDING_CHAT_DRAFT_KEY);
}
