import { getRecentChats, RECENT_CHATS_UPDATED_EVENT, saveRecentChats } from '@/lib/recent-chats';
import type { RecentChatItem } from '@/types';

export const DEFAULT_CHAT_USER_ID = 'local-user';
export const CHAT_STORE_UPDATED_EVENT = RECENT_CHATS_UPDATED_EVENT;

export type ChatLibraryItem = RecentChatItem & {
  updatedAt: string;
  pinned: boolean;
  userId?: string;
};

type StoredChatLibraryItem = RecentChatItem & {
  updatedAt?: string;
  pinned?: boolean;
  userId?: string;
};

function normalizeChatLibraryItem(item: StoredChatLibraryItem): ChatLibraryItem {
  return {
    id: item.id,
    title: item.title,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? item.createdAt,
    pinned: item.pinned === true,
    userId: item.userId,
  };
}

function readChatLibrary(): ChatLibraryItem[] {
  return (getRecentChats() as StoredChatLibraryItem[])
    .map(normalizeChatLibraryItem)
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return bTime - aTime;
    });
}

function persistChatLibrary(items: ChatLibraryItem[]) {
  saveRecentChats(items as unknown as RecentChatItem[]);
}

export function dispatchChatStoreUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CHAT_STORE_UPDATED_EVENT));
}

export async function fetchChatLibrary(
  _userId: string = DEFAULT_CHAT_USER_ID
): Promise<ChatLibraryItem[]> {
  return readChatLibrary();
}

export async function updateChatLibraryItem(
  id: string,
  patch: Partial<Pick<ChatLibraryItem, 'title' | 'pinned' | 'userId'>>
): Promise<ChatLibraryItem> {
  const current = readChatLibrary();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Chat not found: ${id}`);
  }

  const updatedItem: ChatLibraryItem = {
    ...current[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const next = [...current];
  next[index] = updatedItem;
  persistChatLibrary(next);
  dispatchChatStoreUpdated();
  return updatedItem;
}

export async function deleteChatLibraryItem(id: string, _userId: string = DEFAULT_CHAT_USER_ID) {
  const current = readChatLibrary();
  persistChatLibrary(current.filter((item) => item.id !== id));
  dispatchChatStoreUpdated();
}

export function getChatSearchText(chat: ChatLibraryItem): string {
  return `${chat.title}`.trim().toLowerCase();
}
