import type { StoredChatSession, StoredChatSessionSummary } from '@/types';

import { LocalChatRepository } from './local-chat-repository';

export interface ChatRepository {
  listChats(): Promise<StoredChatSessionSummary[]>;
  getChat(chatId: string): Promise<StoredChatSession | null>;
  createChat(chat: StoredChatSession): Promise<StoredChatSession>;
  saveChat(chat: StoredChatSession): Promise<StoredChatSession>;
  renameChat(chatId: string, title: string): Promise<StoredChatSession>;
  pinChat(chatId: string, pinned: boolean): Promise<StoredChatSession>;
  deleteChat(chatId: string): Promise<void>;
  clearChats(): Promise<void>;
}

let repository: ChatRepository | null = null;

/**
 * Single swap point for persistence. Replace LocalChatRepository with an API-backed
 * implementation later without touching the chat UI.
 */
export function getChatRepository(): ChatRepository {
  if (repository) return repository;
  repository = new LocalChatRepository();
  return repository;
}
