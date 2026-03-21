import type { ChatRepository } from '@/lib/chat-repository';
import type { StoredChatSession, StoredChatSessionSummary, StoredMessage } from '@/types';

const DB_NAME = 'lexery-chat-tmp-storage';
const DB_VERSION = 1;
const CHAT_SESSIONS_STORE = 'chat-sessions';

function isIndexedDbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function sortChatSummaries(chats: StoredChatSessionSummary[]): StoredChatSessionSummary[] {
  return [...chats].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();

    if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
      return b.createdAt.localeCompare(a.createdAt);
    }

    return bTime - aTime;
  });
}

function cloneMessage(message: StoredMessage): StoredMessage {
  return {
    ...message,
    suggestions: message.suggestions ? [...message.suggestions] : undefined,
    attachments: message.attachments?.map((attachment) => ({
      ...attachment,
      blob: attachment.blob ?? null,
    })),
    versions: message.versions?.map((version) => ({ ...version })),
  };
}

function normalizeChatSession(session: StoredChatSession): StoredChatSession {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt ?? session.createdAt,
    pinned: session.pinned === true,
    userId: session.userId,
    systemPrompt: session.systemPrompt ?? '',
    messages: Array.isArray(session.messages) ? session.messages.map(cloneMessage) : [],
  };
}

function toSummary(session: StoredChatSession): StoredChatSessionSummary {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    pinned: session.pinned,
    userId: session.userId,
  };
}

export class LocalChatRepository implements ChatRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDb(): Promise<IDBDatabase> {
    if (!isIndexedDbAvailable()) {
      throw new Error('IndexedDB is not available in this environment.');
    }

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CHAT_SESSIONS_STORE)) {
          db.createObjectStore(CHAT_SESSIONS_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
      request.onblocked = () => reject(new Error('IndexedDB open request was blocked.'));
    });

    return this.dbPromise;
  }

  async listChats(): Promise<StoredChatSessionSummary[]> {
    const db = await this.getDb();
    const transaction = db.transaction(CHAT_SESSIONS_STORE, 'readonly');
    const store = transaction.objectStore(CHAT_SESSIONS_STORE);
    const sessions = await requestToPromise(store.getAll());
    return sortChatSummaries(
      sessions
        .filter((session): session is StoredChatSession => {
          return (
            session != null &&
            typeof session === 'object' &&
            typeof (session as StoredChatSession).id === 'string' &&
            typeof (session as StoredChatSession).title === 'string' &&
            typeof (session as StoredChatSession).createdAt === 'string'
          );
        })
        .map(normalizeChatSession)
        .map(toSummary)
    );
  }

  async getChat(chatId: string): Promise<StoredChatSession | null> {
    const db = await this.getDb();
    const transaction = db.transaction(CHAT_SESSIONS_STORE, 'readonly');
    const store = transaction.objectStore(CHAT_SESSIONS_STORE);
    const session = await requestToPromise(store.get(chatId));
    if (!session) return null;
    return normalizeChatSession(session as StoredChatSession);
  }

  async createChat(chat: StoredChatSession): Promise<StoredChatSession> {
    return this.saveChat(chat);
  }

  async saveChat(chat: StoredChatSession): Promise<StoredChatSession> {
    const db = await this.getDb();
    const normalized = normalizeChatSession(chat);
    const transaction = db.transaction(CHAT_SESSIONS_STORE, 'readwrite');
    const store = transaction.objectStore(CHAT_SESSIONS_STORE);
    await requestToPromise(store.put(normalized));
    return normalized;
  }

  async renameChat(chatId: string, title: string): Promise<StoredChatSession> {
    const current = await this.getChat(chatId);
    if (!current) {
      throw new Error(`Chat not found: ${chatId}`);
    }

    return this.saveChat({
      ...current,
      title,
      updatedAt: new Date().toISOString(),
    });
  }

  async pinChat(chatId: string, pinned: boolean): Promise<StoredChatSession> {
    const current = await this.getChat(chatId);
    if (!current) {
      throw new Error(`Chat not found: ${chatId}`);
    }

    return this.saveChat({
      ...current,
      pinned,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteChat(chatId: string): Promise<void> {
    const db = await this.getDb();
    const transaction = db.transaction(CHAT_SESSIONS_STORE, 'readwrite');
    const store = transaction.objectStore(CHAT_SESSIONS_STORE);
    await requestToPromise(store.delete(chatId));
  }

  async clearChats(): Promise<void> {
    const db = await this.getDb();
    const transaction = db.transaction(CHAT_SESSIONS_STORE, 'readwrite');
    const store = transaction.objectStore(CHAT_SESSIONS_STORE);
    await requestToPromise(store.clear());
  }
}
