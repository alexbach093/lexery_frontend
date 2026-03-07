'use client';

import type { RecentChatItem } from '@/entities/chat/model';

const STORAGE_KEY = 'lexery-recent-chats';
const MAX_ITEMS = 50;

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = '__lexery_storage_test__';
    window.localStorage.setItem(key, '');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read recent chats from localStorage. Newest first.
 * Safe for SSR: returns [] when window/localStorage unavailable or on parse error.
 */
export function getRecentChats(): RecentChatItem[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.trim() === '') return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const items = parsed.filter(
      (x): x is RecentChatItem =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as RecentChatItem).id === 'string' &&
        typeof (x as RecentChatItem).title === 'string' &&
        typeof (x as RecentChatItem).createdAt === 'string'
    );
    // Newest first (assume createdAt ISO order)
    items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
    return items.slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Replace entire recent chats list and persist. Keeps newest-first, enforces MAX_ITEMS.
 */
export function saveRecentChats(items: RecentChatItem[]): void {
  if (!isStorageAvailable()) return;
  try {
    const sorted = [...items].sort((a, b) =>
      b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}

/**
 * Add or update one chat by id. Newest-first order, no duplicates by id.
 * Dispatches 'recent-chats-updated' so same-tab sidebar can refresh.
 */
export function upsertRecentChat(item: RecentChatItem): void {
  if (!isStorageAvailable()) return;
  const list = getRecentChats();
  const without = list.filter((x) => x.id !== item.id);
  const next = [item, ...without].sort((a, b) =>
    b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0
  );
  saveRecentChats(next.slice(0, MAX_ITEMS));
  try {
    window.dispatchEvent(new CustomEvent('recent-chats-updated'));
  } catch {
    // ignore
  }
}

/** Event name for same-tab refresh (sidebar listens). */
export const RECENT_CHATS_UPDATED_EVENT = 'recent-chats-updated';

/** localStorage key for cross-tab storage event. */
export const RECENT_CHATS_STORAGE_KEY = STORAGE_KEY;
