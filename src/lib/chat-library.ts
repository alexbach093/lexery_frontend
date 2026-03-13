import type { Message } from '@/types/chat';

export const DEFAULT_CHAT_USER_ID = 'local-user';
export const CHAT_STORE_UPDATED_EVENT = 'chat-store-updated';

export interface ChatLibraryItem {
  id: string;
  userId: string;
  title: string;
  preview: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface CreateChatInput {
  userId?: string;
  title: string;
  preview: string;
  pinned?: boolean;
  messages: Message[];
}

export interface UpdateChatInput {
  userId?: string;
  title?: string;
  preview?: string;
  pinned?: boolean;
  messages?: Message[];
}

export function getChatSearchText(chat: ChatLibraryItem): string {
  return `${chat.title} ${chat.preview} ${chat.messages.map((message) => message.content).join(' ')}`
    .trim()
    .toLowerCase();
}

export function formatLastMessageLabel(
  updatedAt: string,
  locale: Intl.LocalesArgument = 'uk'
): string {
  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) return 'Останнє повідомлення щойно';

  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return `Останнє повідомлення ${formatter.format(diffMinutes, 'minute')}`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return `Останнє повідомлення ${formatter.format(diffHours, 'hour')}`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return `Останнє повідомлення ${formatter.format(diffDays, 'day')}`;
  }

  const diffMonths = Math.round(diffDays / 30);
  return `Останнє повідомлення ${formatter.format(diffMonths, 'month')}`;
}

function getQueryString(userId: string): string {
  return `userId=${encodeURIComponent(userId)}`;
}

export async function fetchChatLibrary(
  userId: string = DEFAULT_CHAT_USER_ID
): Promise<ChatLibraryItem[]> {
  const response = await fetch(`/api/chats?${getQueryString(userId)}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to load chats');
  }

  const data = (await response.json()) as { chats?: ChatLibraryItem[] };
  return Array.isArray(data.chats) ? data.chats : [];
}

export async function fetchChatLibraryItemById(
  chatId: string,
  userId: string = DEFAULT_CHAT_USER_ID
): Promise<ChatLibraryItem | null> {
  const response = await fetch(
    `/api/chats/${encodeURIComponent(chatId)}?${getQueryString(userId)}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to load chat');

  const data = (await response.json()) as { chat?: ChatLibraryItem | null };
  return data.chat ?? null;
}

export async function createChatLibraryItem(input: CreateChatInput): Promise<ChatLibraryItem> {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: input.userId ?? DEFAULT_CHAT_USER_ID,
      title: input.title,
      preview: input.preview,
      pinned: input.pinned,
      messages: input.messages,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create chat');
  }

  const data = (await response.json()) as { chat: ChatLibraryItem };
  return data.chat;
}

export async function updateChatLibraryItem(
  chatId: string,
  input: UpdateChatInput
): Promise<ChatLibraryItem> {
  const response = await fetch(`/api/chats/${encodeURIComponent(chatId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: input.userId ?? DEFAULT_CHAT_USER_ID,
      title: input.title,
      preview: input.preview,
      pinned: input.pinned,
      messages: input.messages,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update chat');
  }

  const data = (await response.json()) as { chat: ChatLibraryItem };
  return data.chat;
}

export async function deleteChatLibraryItem(
  chatId: string,
  userId: string = DEFAULT_CHAT_USER_ID
): Promise<void> {
  const response = await fetch(
    `/api/chats/${encodeURIComponent(chatId)}?${getQueryString(userId)}`,
    {
      method: 'DELETE',
    }
  );

  if (response.status === 404) return;
  if (!response.ok) {
    throw new Error('Failed to delete chat');
  }
}

export function dispatchChatStoreUpdated(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(CHAT_STORE_UPDATED_EVENT));
  } catch {
    // ignore
  }
}
