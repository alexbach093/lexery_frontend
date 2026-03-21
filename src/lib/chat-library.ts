import { getChatRepository } from '@/lib/chat-repository';
import type { StoredChatSession, StoredChatSessionSummary } from '@/types';

export const DEFAULT_CHAT_USER_ID = 'local-user';
export const CHAT_STORE_UPDATED_EVENT = 'recent-chats-updated';
export const CHAT_STORE_SYNC_STORAGE_KEY = 'lexery-chat-store-sync';

export type ChatLibraryItem = StoredChatSessionSummary;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sortChatLibrary(items: ChatLibraryItem[]): ChatLibraryItem[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();

    if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
      return b.createdAt.localeCompare(a.createdAt);
    }

    return bTime - aTime;
  });
}

function toChatLibraryItem(chat: StoredChatSession | StoredChatSessionSummary): ChatLibraryItem {
  return {
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    pinned: chat.pinned,
    userId: chat.userId,
  };
}

export function dispatchChatStoreUpdated() {
  if (typeof window === 'undefined') return;

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(
        CHAT_STORE_SYNC_STORAGE_KEY,
        JSON.stringify({ updatedAt: Date.now() })
      );
    } catch {
      // Ignore storage sync failures and still notify the current tab.
    }
  }

  window.dispatchEvent(new CustomEvent(CHAT_STORE_UPDATED_EVENT));
}

export function isChatStoreStorageEvent(event: StorageEvent): boolean {
  return event.key === CHAT_STORE_SYNC_STORAGE_KEY;
}

export async function fetchChatLibrary(
  _userId: string = DEFAULT_CHAT_USER_ID
): Promise<ChatLibraryItem[]> {
  const repository = getChatRepository();
  const chats = await repository.listChats();
  return sortChatLibrary(chats.map(toChatLibraryItem));
}

export async function updateChatLibraryItem(
  id: string,
  patch: Partial<Pick<ChatLibraryItem, 'title' | 'pinned' | 'userId'>>
): Promise<ChatLibraryItem> {
  const repository = getChatRepository();
  const current = await repository.getChat(id);
  if (!current) {
    throw new Error(`Chat not found: ${id}`);
  }

  const nextUpdatedAt = new Date().toISOString();

  let updated = current;

  if (typeof patch.title === 'string' && patch.title !== current.title) {
    updated = await repository.renameChat(id, patch.title);
  }

  if (typeof patch.pinned === 'boolean' && patch.pinned !== updated.pinned) {
    updated = await repository.pinChat(id, patch.pinned);
  }

  if (patch.userId !== undefined && patch.userId !== updated.userId) {
    updated = await repository.saveChat({
      ...updated,
      userId: patch.userId,
      updatedAt: nextUpdatedAt,
    });
  }

  if (
    typeof patch.title !== 'string' &&
    typeof patch.pinned !== 'boolean' &&
    patch.userId === undefined
  ) {
    updated = await repository.saveChat({
      ...updated,
      updatedAt: nextUpdatedAt,
    });
  }

  dispatchChatStoreUpdated();
  return toChatLibraryItem(updated);
}

export async function deleteChatLibraryItem(id: string, _userId: string = DEFAULT_CHAT_USER_ID) {
  const repository = getChatRepository();
  await repository.deleteChat(id);
  dispatchChatStoreUpdated();
}

export async function clearChatLibrary(_userId: string = DEFAULT_CHAT_USER_ID) {
  const repository = getChatRepository();
  await repository.clearChats();
  dispatchChatStoreUpdated();
}

export function getChatSearchText(chat: ChatLibraryItem): string {
  return `${chat.title}`.trim().toLowerCase();
}
