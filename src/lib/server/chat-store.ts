import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { ChatLibraryItem } from '@/lib/chat-library';
import type { Message } from '@/types/chat';

const CHAT_STORE_DIR = path.join(process.cwd(), 'tmp');
const CHAT_STORE_FILE = path.join(CHAT_STORE_DIR, 'lexery-chat-store.json');

type ChatStorePayload = {
  chats: ChatLibraryItem[];
};

type StoredChatLike = Omit<ChatLibraryItem, 'pinned'> & { pinned?: boolean };

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function ensureStoreFile(): Promise<void> {
  await mkdir(CHAT_STORE_DIR, { recursive: true });
  try {
    await readFile(CHAT_STORE_FILE, 'utf8');
  } catch {
    await writeFile(CHAT_STORE_FILE, JSON.stringify({ chats: [] }, null, 2), 'utf8');
  }
}

async function readStore(): Promise<ChatStorePayload> {
  await ensureStoreFile();
  try {
    const raw = await readFile(CHAT_STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as ChatStorePayload).chats)) {
      return {
        chats: (parsed as { chats: StoredChatLike[] }).chats.map((chat) => ({
          ...chat,
          pinned: Boolean(chat.pinned),
        })),
      };
    }
  } catch {
    // ignore malformed file and rewrite below
  }

  const emptyStore: ChatStorePayload = { chats: [] };
  await writeStore(emptyStore);
  return emptyStore;
}

async function writeStore(store: ChatStorePayload): Promise<void> {
  await ensureStoreFile();
  await writeFile(CHAT_STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function sortChats(chats: ChatLibraryItem[]): ChatLibraryItem[] {
  return [...chats].sort((a, b) =>
    b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0
  );
}

function buildPreview(messages: Message[], fallbackPreview?: string): string {
  const lastTextMessage = [...messages]
    .reverse()
    .find((message) => typeof message.content === 'string' && message.content.trim().length > 0);

  return (
    lastTextMessage?.content.trim().replace(/\s+/g, ' ').slice(0, 180) ||
    fallbackPreview?.trim() ||
    'Новий чат'
  );
}

function buildTitle(messages: Message[], fallbackTitle?: string): string {
  const firstUserMessage = messages.find(
    (message) => message.role === 'user' && message.content.trim().length > 0
  );
  const baseTitle = firstUserMessage?.content.trim() || fallbackTitle?.trim() || 'Новий чат';
  return baseTitle.length > 60 ? `${baseTitle.slice(0, 60)}…` : baseTitle;
}

export async function listChatsByUser(userId: string): Promise<ChatLibraryItem[]> {
  const store = await readStore();
  return sortChats(store.chats.filter((chat) => chat.userId === userId));
}

export async function getChatById(userId: string, chatId: string): Promise<ChatLibraryItem | null> {
  const store = await readStore();
  return store.chats.find((chat) => chat.userId === userId && chat.id === chatId) ?? null;
}

export async function createChat(input: {
  userId: string;
  title?: string;
  preview?: string;
  pinned?: boolean;
  messages: Message[];
}): Promise<ChatLibraryItem> {
  const store = await readStore();
  const timestamp = new Date().toISOString();
  const chat: ChatLibraryItem = {
    id: generateId(),
    userId: input.userId,
    title: buildTitle(input.messages, input.title),
    preview: buildPreview(input.messages, input.preview),
    pinned: Boolean(input.pinned),
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: input.messages,
  };

  store.chats.push(chat);
  await writeStore({ chats: sortChats(store.chats) });
  return chat;
}

export async function updateChat(input: {
  chatId: string;
  userId: string;
  title?: string;
  preview?: string;
  pinned?: boolean;
  messages?: Message[];
}): Promise<ChatLibraryItem | null> {
  const store = await readStore();
  const index = store.chats.findIndex(
    (chat) => chat.id === input.chatId && chat.userId === input.userId
  );
  if (index === -1) return null;

  const previous = store.chats[index];
  const nextMessages = input.messages ?? previous.messages;
  const shouldRefreshUpdatedAt =
    input.messages != null || input.title != null || input.preview != null;
  const next: ChatLibraryItem = {
    ...previous,
    title: buildTitle(nextMessages, input.title ?? previous.title),
    preview: buildPreview(nextMessages, input.preview ?? previous.preview),
    pinned: input.pinned ?? previous.pinned,
    updatedAt: shouldRefreshUpdatedAt ? new Date().toISOString() : previous.updatedAt,
    messages: nextMessages,
  };

  store.chats[index] = next;
  await writeStore({ chats: sortChats(store.chats) });
  return next;
}
