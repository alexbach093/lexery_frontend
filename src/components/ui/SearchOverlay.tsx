'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import { useSearchOpen } from '@/contexts/search-open';
import { getRouteChatIdFromPathname, getWorkspaceChatPath } from '@/lib/app-routes';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  fetchChatLibrary,
  getChatSearchText,
  isChatStoreStorageEvent,
  type ChatLibraryItem,
} from '@/lib/chat-library';

import { ChatBubbleIcon, CloseOverlayIcon, ReturnIcon, SearchIcon } from '../icons';

const SEARCH_EMPTY_STATE_QUERY_MAX_LENGTH = 48;
const SEARCH_FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function truncateSearchQuery(value: string, maxLength: number): string {
  const trimmedValue = value.trim();
  const characters = Array.from(trimmedValue);

  if (characters.length <= maxLength) {
    return trimmedValue;
  }

  return `${characters.slice(0, maxLength).join('')}...`;
}

function formatSearchTimestamp(updatedAt: string, locale: Intl.LocalesArgument = 'uk'): string {
  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) return 'щойно';

  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour');

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return formatter.format(diffDays, 'day');

  const diffMonths = Math.round(diffDays / 30);
  return formatter.format(diffMonths, 'month');
}

export function SearchOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close, closeImmediate } = useSearchOpen();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatLibrary, setChatLibrary] = useState<ChatLibraryItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const refreshIdRef = useRef(0);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const closeSearch = useCallback(() => {
    close();
  }, [close]);
  const getFocusableElements = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return [];

    return Array.from(panel.querySelectorAll<HTMLElement>(SEARCH_FOCUSABLE_SELECTOR)).filter(
      (element) => element.getClientRects().length > 0
    );
  }, []);

  const refreshChatLibrary = useCallback(async () => {
    const refreshId = ++refreshIdRef.current;

    try {
      const chats = await fetchChatLibrary(DEFAULT_CHAT_USER_ID);
      if (refreshIdRef.current === refreshId) {
        setChatLibrary(chats);
      }
    } catch {
      if (refreshIdRef.current === refreshId) {
        setChatLibrary([]);
      }
    }
  }, []);

  useEffect(() => {
    const handleStoreUpdated = () => {
      void refreshChatLibrary();
    };
    const handleStorage = (event: StorageEvent) => {
      if (!isChatStoreStorageEvent(event)) return;
      handleStoreUpdated();
    };

    window.addEventListener(CHAT_STORE_UPDATED_EVENT, handleStoreUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      refreshIdRef.current += 1;
      window.removeEventListener(CHAT_STORE_UPDATED_EVENT, handleStoreUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshChatLibrary]);

  useEffect(() => {
    if (!isOpen) return;

    const rafId = window.requestAnimationFrame(() => {
      void refreshChatLibrary();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen, refreshChatLibrary]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const isFocusInsidePanel =
        activeElement !== null && panelRef.current?.contains(activeElement) === true;

      if (!isFocusInsidePanel) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch, getFocusableElements, isOpen]);

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const recentChats = chatLibrary;
  const filteredChats = useMemo(() => {
    if (!normalizedQuery) return [];
    return chatLibrary.filter((chat) => getChatSearchText(chat).includes(normalizedQuery));
  }, [chatLibrary, normalizedQuery]);

  const visibleChats = normalizedQuery ? filteredChats : recentChats;
  const showEmptyStateBody = !normalizedQuery && visibleChats.length === 0;
  const emptyStateQuery = useMemo(
    () => truncateSearchQuery(searchQuery, SEARCH_EMPTY_STATE_QUERY_MAX_LENGTH),
    [searchQuery]
  );
  const activeHighlightedIndex =
    visibleChats.length === 0
      ? -1
      : Math.min(Math.max(highlightedIndex, 0), visibleChats.length - 1);

  useEffect(() => {
    if (!isOpen || activeHighlightedIndex < 0) return;

    const container = listScrollRef.current;
    const activeRow = container?.querySelector<HTMLElement>(
      `[data-chat-index="${activeHighlightedIndex}"]`
    );
    activeRow?.scrollIntoView({ block: 'nearest' });
  }, [activeHighlightedIndex, isOpen, visibleChats]);

  const handleOpenChat = useCallback(
    (chatId: string) => {
      closeImmediate();

      const isSameChat = getRouteChatIdFromPathname(pathname) === chatId;

      if (isSameChat) {
        return;
      }

      router.push(getWorkspaceChatPath(chatId));
    },
    [closeImmediate, pathname, router]
  );

  const handleSearchInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (visibleChats.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % visibleChats.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + visibleChats.length) % visibleChats.length);
      return;
    }

    if (event.key === 'Enter' && activeHighlightedIndex >= 0) {
      event.preventDefault();
      handleOpenChat(visibleChats[activeHighlightedIndex].id);
    }
  };

  if (!isOpen) return null;

  const showSearchResults = normalizedQuery.length > 0;

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={closeSearch}
      className="fixed inset-0 z-90 flex items-center justify-center bg-transparent px-8 py-6 backdrop-blur-xs [-webkit-backdrop-filter:blur(4px)]"
    >
      <div
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[min(460px,calc(100vh-148px))] w-[min(680px,calc(100vw-var(--app-sidebar-width,0px)-64px))] translate-x-[calc(var(--app-sidebar-width,0px)/2)] overflow-hidden rounded-[22px] border border-[#D4D4D4] bg-[#FFFFFF] shadow-none"
      >
        <div
          className={`flex min-h-18.5 items-center gap-3.5 px-4.5 ${
            visibleChats.length > 0 || normalizedQuery || showEmptyStateBody
              ? 'border-b border-[#E5E5E5]'
              : 'border-none'
          }`}
        >
          <div className="shrink-0 text-[#737373]">
            <SearchIcon />
          </div>
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleSearchInputKeyDown}
            placeholder="Пошук чатів і проєктів"
            className="min-w-0 flex-1 border-none bg-transparent text-base leading-6 font-medium tracking-[0.01em] text-[#171717] outline-none"
          />
          <button
            type="button"
            aria-label="Закрити пошук"
            onClick={closeSearch}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-none bg-transparent text-[#737373] transition-colors hover:bg-[#F4F4F4] active:bg-[#F4F4F4]"
          >
            <CloseOverlayIcon />
          </button>
        </div>

        {showSearchResults ? (
          <div className="px-4.5 pt-3.5 pb-4.5">
            <div className="mb-3 text-[13px] leading-4.5 font-medium text-[#737373]">
              Результати пошуку
            </div>
            {visibleChats.length > 0 ? (
              <div
                ref={listScrollRef}
                className="flex max-h-[min(292px,calc(100vh-266px))] flex-col gap-0.5 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
              >
                {visibleChats.map((chat, index) => {
                  const isActive = index === activeHighlightedIndex;
                  return (
                    <button
                      key={chat.id}
                      data-chat-index={index}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onFocus={() => setHighlightedIndex(index)}
                      onClick={() => handleOpenChat(chat.id)}
                      className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 text-left text-[#171717] transition-colors duration-140 ease-in-out ${
                        isActive ? 'bg-[#F4F4F4]' : 'bg-transparent'
                      }`}
                    >
                      <div className="shrink-0 text-[#737373]">
                        <ChatBubbleIcon />
                      </div>
                      <div
                        className={`min-w-0 flex-1 overflow-hidden text-[14px] leading-5 text-ellipsis whitespace-nowrap ${
                          isActive ? 'font-semibold' : 'font-medium'
                        }`}
                      >
                        {chat.title}
                      </div>
                      <div
                        className={`flex min-w-18.5 shrink-0 justify-end text-[13px] leading-4.5 font-medium text-[#737373]`}
                      >
                        {isActive ? <ReturnIcon /> : formatSearchTimestamp(chat.updatedAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="m-0 text-[15px] leading-5.5 font-medium wrap-break-word text-[#171717]">
                Нічого не знайдено за запитом «{emptyStateQuery}»
              </div>
            )}
          </div>
        ) : visibleChats.length > 0 ? (
          <div
            ref={listScrollRef}
            className="max-h-[min(360px,calc(100vh-208px))] overflow-y-auto overscroll-contain p-2.5 [scrollbar-gutter:stable]"
          >
            {visibleChats.map((chat, index) => {
              const isActive = index === activeHighlightedIndex;
              return (
                <button
                  key={chat.id}
                  data-chat-index={index}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onFocus={() => setHighlightedIndex(index)}
                  onClick={() => handleOpenChat(chat.id)}
                  className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 text-left text-[#171717] transition-colors duration-140 ease-in-out ${
                    isActive ? 'bg-[#F4F4F4]' : 'bg-transparent'
                  }`}
                >
                  <div className="shrink-0 text-[#737373]">
                    <ChatBubbleIcon />
                  </div>
                  <div
                    className={`min-w-0 flex-1 overflow-hidden text-[14px] leading-5 text-ellipsis whitespace-nowrap ${
                      isActive ? 'font-semibold' : 'font-medium'
                    }`}
                  >
                    {chat.title}
                  </div>
                  <div
                    className={`flex min-w-18.5 shrink-0 justify-end text-[13px] leading-4.5 font-medium text-[#737373]`}
                  >
                    {isActive ? <ReturnIcon /> : formatSearchTimestamp(chat.updatedAt)}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {showEmptyStateBody ? (
          <div className="px-5 pt-4.5 pb-5.5">
            <div className="mb-1.5 text-[16px] leading-6 font-semibold text-[#171717]">
              У вас ще немає чатів
            </div>
            <div className="text-[14px] leading-5.25 font-medium text-[#737373]">
              Створіть новий чат, і він з&apos;явиться тут для швидкого пошуку.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
