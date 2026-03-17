'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import { useSearchOpen } from '@/contexts/search-open';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  fetchChatLibrary,
  getChatSearchText,
  type ChatLibraryItem,
} from '@/lib/chat-library';

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 7L7 17M7 7L17 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 178 178" fill="none" aria-hidden>
      <path
        d="M89 157C126.555 157 157 126.555 157 89C157 51.4446 126.555 21 89 21C51.4446 21 21 51.4446 21 89C21 100.24 23.727 110.843 28.5556 120.183L21 157L57.8167 149.444C67.1572 154.273 77.7601 157 89 157Z"
        stroke="currentColor"
        strokeWidth="15.1111"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="55.0383" cy="89.0383" r="11.3333" fill="currentColor" />
      <circle cx="89.0383" cy="89.0383" r="11.3333" fill="currentColor" />
      <circle cx="123.0383" cy="89.0383" r="11.3333" fill="currentColor" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.5 6.66675L11.6667 2.50008M11.6667 2.50008L15.8333 6.66675M11.6667 2.50008V11.2501C11.6667 12.1706 10.9205 12.9167 10 12.9167H4.16667"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  const router = useRouter();
  const { isOpen, close } = useSearchOpen();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatLibrary, setChatLibrary] = useState<ChatLibraryItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const refreshIdRef = useRef(0);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const closeSearch = useCallback(() => {
    close();
  }, [close]);

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

    window.addEventListener(CHAT_STORE_UPDATED_EVENT, handleStoreUpdated);
    return () => {
      refreshIdRef.current += 1;
      window.removeEventListener(CHAT_STORE_UPDATED_EVENT, handleStoreUpdated);
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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch, isOpen]);

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const recentChats = useMemo(() => chatLibrary.slice(0, 6), [chatLibrary]);
  const filteredChats = useMemo(() => {
    if (!normalizedQuery) return [];
    return chatLibrary
      .filter((chat) => getChatSearchText(chat).includes(normalizedQuery))
      .slice(0, 6);
  }, [chatLibrary, normalizedQuery]);

  const visibleChats = normalizedQuery ? filteredChats : recentChats;
  const showEmptyStateBody = !normalizedQuery && visibleChats.length === 0;
  const activeHighlightedIndex =
    visibleChats.length === 0
      ? -1
      : Math.min(Math.max(highlightedIndex, 0), visibleChats.length - 1);

  const handleOpenChat = useCallback(
    (chatId: string) => {
      closeSearch();
      router.push(`/workspace?chat=${encodeURIComponent(chatId)}`);
    },
    [closeSearch, router]
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
  const resultsSectionHeaderStyle: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 500,
    color: '#6B7280',
  };
  const panelBaseStyle: CSSProperties = {
    width: 'min(680px, calc(100% - 120px))',
    maxHeight: 'min(460px, calc(100vh - 148px))',
    borderRadius: '22px',
    border: '1px solid rgba(220, 225, 227, 0.9)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(249,250,251,0.98) 100%)',
    boxShadow: 'none',
    overflow: 'hidden',
    backdropFilter: 'blur(14px)',
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={closeSearch}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '124px 32px 24px',
        background: 'transparent',
        backdropFilter: 'none',
      }}
    >
      <div ref={panelRef} onClick={(event) => event.stopPropagation()} style={panelBaseStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            minHeight: '74px',
            padding: '0 18px',
            borderBottom:
              visibleChats.length > 0 || normalizedQuery || showEmptyStateBody
                ? '1px solid rgba(226, 232, 240, 0.92)'
                : 'none',
          }}
        >
          <div style={{ color: '#6B7280', flexShrink: 0 }}>
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
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#111827',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '0.01em',
            }}
          />
          <button
            type="button"
            aria-label="Закрити пошук"
            onClick={closeSearch}
            style={{
              width: '40px',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '12px',
              background: 'transparent',
              color: '#6B7280',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {showSearchResults ? (
          <div
            style={{
              padding: '14px 18px 18px',
            }}
          >
            <div
              style={{
                ...resultsSectionHeaderStyle,
                marginBottom: '12px',
              }}
            >
              Результати пошуку
            </div>
            {visibleChats.length > 0 ? (
              <div
                style={{
                  maxHeight: 'min(292px, calc(100vh - 266px))',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {visibleChats.map((chat, index) => {
                  const isActive = index === activeHighlightedIndex;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onFocus={() => setHighlightedIndex(index)}
                      onClick={() => handleOpenChat(chat.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minHeight: '44px',
                        padding: '0 12px',
                        border: 'none',
                        borderRadius: '12px',
                        background: isActive ? '#171717' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#111827',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 140ms ease, color 140ms ease',
                      }}
                    >
                      <div style={{ flexShrink: 0, color: isActive ? '#FFFFFF' : '#6B7280' }}>
                        <ChatBubbleIcon />
                      </div>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontWeight: isActive ? 600 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {chat.title}
                      </div>
                      <div
                        style={{
                          flexShrink: 0,
                          minWidth: '74px',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          color: isActive ? '#D1D5DB' : '#7A7A7A',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                          lineHeight: '18px',
                          fontWeight: 500,
                        }}
                      >
                        {isActive ? <ReturnIcon /> : formatSearchTimestamp(chat.updatedAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  lineHeight: '22px',
                  fontWeight: 500,
                  color: '#111827',
                  marginBottom: 0,
                }}
              >
                Нічого не знайдено за запитом «{searchQuery.trim()}»
              </div>
            )}
          </div>
        ) : visibleChats.length > 0 ? (
          <div
            style={{
              maxHeight: 'min(360px, calc(100vh - 208px))',
              overflowY: 'auto',
              padding: '10px',
            }}
          >
            {visibleChats.map((chat, index) => {
              const isActive = index === activeHighlightedIndex;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onFocus={() => setHighlightedIndex(index)}
                  onClick={() => handleOpenChat(chat.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minHeight: '44px',
                    padding: '0 12px',
                    border: 'none',
                    borderRadius: '12px',
                    background: isActive ? '#171717' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#111827',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 140ms ease, color 140ms ease',
                  }}
                >
                  <div style={{ flexShrink: 0, color: isActive ? '#FFFFFF' : '#6B7280' }}>
                    <ChatBubbleIcon />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {chat.title}
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      minWidth: '74px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      color: isActive ? '#D1D5DB' : '#7A7A7A',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      lineHeight: '18px',
                      fontWeight: 500,
                    }}
                  >
                    {isActive ? <ReturnIcon /> : formatSearchTimestamp(chat.updatedAt)}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {showEmptyStateBody ? (
          <div
            aria-hidden
            style={{
              minHeight: '18px',
              background: 'transparent',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
