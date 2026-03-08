'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';

import type { RecentChatItem } from '@/entities/chat/model';
import { WORKSPACE_START_NEW_CHAT_EVENT } from '@/hooks/use-workspace-chat';
import {
  getRecentChats,
  RECENT_CHATS_UPDATED_EVENT,
  RECENT_CHATS_STORAGE_KEY,
} from '@/lib/recent-chats';

interface WorkspaceSidebarProps {
  className?: string;
}

/**
 * Workspace Sidebar Component - Left navigation panel
 *
 * Figma: node 0:1357 (sidebar)
 * Width: 288px (18rem) fixed, Claude-style spacing
 * Contains: Logo, Navigation items, User profile
 */
export function WorkspaceSidebar({ className }: WorkspaceSidebarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [recentChats, setRecentChats] = useState<RecentChatItem[]>([]);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const [historyScrolled, setHistoryScrolled] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [historyClosing, setHistoryClosing] = useState(false);

  const refreshRecentChats = useCallback(() => {
    setRecentChats(getRecentChats());
  }, []);

  const handleHistoryScroll = useCallback(() => {
    const el = historyScrollRef.current;
    if (!el) return;
    const scrolled = el.scrollTop > 0;
    requestAnimationFrame(() => setHistoryScrolled(scrolled));
  }, []);

  useEffect(() => {
    queueMicrotask(() => refreshRecentChats());
  }, [refreshRecentChats]);

  useEffect(() => {
    const el = historyScrollRef.current;
    if (!el) return;
    queueMicrotask(() => setHistoryScrolled(el.scrollTop > 0));
  }, [recentChats]);

  useEffect(() => {
    const onUpdate = () => refreshRecentChats();
    window.addEventListener(RECENT_CHATS_UPDATED_EVENT, onUpdate);
    const onStorage = (e: StorageEvent) => {
      if (e.key === RECENT_CHATS_STORAGE_KEY) refreshRecentChats();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(RECENT_CHATS_UPDATED_EVENT, onUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshRecentChats]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    router.push('/settings/account/details');
  };

  const handleReportErrorClick = () => {
    setIsMenuOpen(false);
    // Preserved: existing report error handler (wire here if needed)
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    // TODO: wire logout (e.g. clear session, redirect)
  };

  return (
    <aside
      className={className}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '250px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #E0E7E8',
      }}
    >
      {/* Фіксовано зверху: лого + Новий чат, Пошук, Чати, Проєкти */}
      <div
        style={{
          flexShrink: 0,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Верхній ряд: лого зліва, іконка split-panel справа (Figma 22:5) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '32px',
            paddingLeft: '12px',
            paddingRight: '8px',
            paddingTop: '10px',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '20px',
              letterSpacing: '0.02em',
              color: '#000000',
              margin: 0,
            }}
          >
            LEXERY
          </p>
          <button
            type="button"
            aria-label="Перемикнути панель"
            className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              marginRight: '-5px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block', flexShrink: 0 }}
              aria-hidden
            >
              <rect
                x="0.75"
                y="0.75"
                width="16.5"
                height="16.5"
                rx="3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M6.25 1v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav — Claude: px-2 pt-2, gap-px, items h-8 py-1.5 px-4 rounded-lg gap-3 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            marginTop: '10px',
          }}
        >
          {/* Новий чат — Claude: h-8 py-1.5 px-4 rounded-lg gap-3 */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(WORKSPACE_START_NEW_CHAT_EVENT))}
            aria-label="Новий чат"
            className="group transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '32px',
              padding: '6px 16px 6px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span
              className="inline-flex items-center gap-3 transition-transform duration-100 group-active:scale-[0.98]"
              style={{ gap: '12px' }}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 16.5 16.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', flexShrink: 0 }}
                aria-hidden
              >
                <path
                  d="M12.4167 0.75H4.08333C2.24238 0.75 0.75 2.24238 0.75 4.08333V12.4167C0.75 14.2576 2.24238 15.75 4.08333 15.75H12.4167C14.2576 15.75 15.75 14.2576 15.75 12.4167V4.08333C15.75 2.24238 14.2576 0.75 12.4167 0.75Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.9067 8.07843H5.24989"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.07861 5.25V10.9069"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                }}
              >
                Новий чат
              </p>
            </span>
          </button>

          {/* Пошук — іконка лупи */}
          <button
            className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '32px',
              padding: '6px 16px 6px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block', flexShrink: 0 }}
              aria-hidden
            >
              <path
                d="M17.4998 17.5001L13.7615 13.7551M15.8332 8.75008C15.8332 10.6287 15.0869 12.4304 13.7585 13.7588C12.4301 15.0871 10.6285 15.8334 8.74984 15.8334C6.87122 15.8334 5.06955 15.0871 3.74116 13.7588C2.41278 12.4304 1.6665 10.6287 1.6665 8.75008C1.6665 6.87146 2.41278 5.06979 3.74116 3.74141C5.06955 2.41303 6.87122 1.66675 8.74984 1.66675C10.6285 1.66675 12.4301 2.41303 13.7585 3.74141C15.0869 5.06979 15.8332 6.87146 15.8332 8.75008Z"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.14px',
                color: '#000000',
              }}
            >
              Пошук
            </p>
          </button>

          {/* Чати — Figma 14:4 (MCP), той самий стиль що інші іконки */}
          <button
            className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '32px',
              padding: '6px 16px 6px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              marginTop: '10px',
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block', flexShrink: 0 }}
              shapeRendering="geometricPrecision"
              aria-hidden
            >
              <g transform="scale(0.11235955056179775)">
                <path
                  d="M64.8725 125.994C93.4857 124.369 116.198 100.127 116.198 70.4578C116.198 39.7373 91.8463 14.8333 61.8072 14.8333C31.7681 14.8333 7.41667 39.7373 7.41667 70.4578C7.41667 81.4038 10.5073 91.6108 15.8462 100.217L12.0023 112.01L11.9962 112.027C10.524 116.544 9.78751 118.803 10.3119 120.307C10.7689 121.618 11.7832 122.651 13.0646 123.118C14.5302 123.653 16.7242 122.905 21.1112 121.409L21.1736 121.39L32.7086 117.459C41.1234 122.919 51.1045 126.081 61.8077 126.081C62.8362 126.081 63.8581 126.051 64.8725 125.994ZM64.8725 125.994C64.8732 125.996 64.8717 125.992 64.8725 125.994ZM64.8725 125.994C72.3143 147.645 92.4843 163.167 116.199 163.167C126.902 163.167 136.881 160.002 145.295 154.542L156.828 158.473L156.85 158.478C161.266 159.983 163.48 160.737 164.95 160.201C166.232 159.734 167.233 158.701 167.69 157.39C168.215 155.884 167.481 153.622 166.004 149.093L162.161 137.3L163.448 135.118C167.994 126.99 170.583 117.575 170.583 107.541C170.583 76.8203 146.237 51.9163 116.198 51.9163L114.162 51.9547L113.135 52.006"
                  stroke="currentColor"
                  strokeWidth="14.8333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.14px',
                color: '#000000',
              }}
            >
              Чати
            </p>
          </button>

          {/* Проєкти — Claude: h-8 py-1.5 px-4 rounded-lg */}
          <button
            className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '32px',
              padding: '6px 16px 6px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block', flexShrink: 0 }}
              aria-hidden
            >
              <path
                d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V7.5C2.5 7.96024 2.8731 8.33333 3.33333 8.33333H7.5C7.96024 8.33333 8.33333 7.96024 8.33333 7.5V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 11.6667H3.33333C2.8731 11.6667 2.5 12.0398 2.5 12.5V16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H7.5C7.96024 17.5 8.33333 17.1269 8.33333 16.6667V12.5C8.33333 12.0398 7.96024 11.6667 7.5 11.6667Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.6667 2.5H12.5C12.0398 2.5 11.6667 2.8731 11.6667 3.33333V7.5C11.6667 7.96024 12.0398 8.33333 12.5 8.33333H16.6667C17.1269 8.33333 17.5 7.96024 17.5 7.5V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.6667 11.6667H12.5C12.0398 11.6667 11.6667 12.0398 11.6667 12.5V16.6667C11.6667 17.1269 12.0398 17.5 12.5 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V12.5C17.5 12.0398 17.1269 11.6667 16.6667 11.6667Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.14px',
                color: '#000000',
              }}
            >
              Проєкти
            </p>
          </button>
        </div>
      </div>

      {/* Лінія над історією — з’являється при прокрутці, тільки коли історія розгорнута */}
      {historyExpanded && historyScrolled && (
        <div
          style={{
            flexShrink: 0,
            paddingLeft: '8px',
            paddingRight: '8px',
          }}
        >
          <div
            style={{
              height: '1px',
              backgroundColor: '#E0E7E8',
              marginLeft: '-8px',
              marginRight: '-8px',
            }}
          />
        </div>
      )}

      {/* Прокручується тільки Історія — список чатів (прокрутка тільки коли розгорнуто) */}
      <div
        ref={historyScrollRef}
        onScroll={handleHistoryScroll}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: historyExpanded ? 'auto' : 'hidden',
          overflowX: 'hidden',
          padding: '0 8px 8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Історія — кнопка + список останніх чатів */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            marginTop: '1px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (historyExpanded) {
                setHistoryScrolled(false);
                setHistoryClosing(true);
                setTimeout(() => {
                  setHistoryExpanded(false);
                  setHistoryClosing(false);
                }, 220);
              } else {
                setHistoryExpanded(true);
              }
            }}
            className="focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '31px',
              padding: '5px 16px 5px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              width: 'fit-content',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                lineHeight: '20px',
                letterSpacing: '0.14px',
                color: historyExpanded ? '#6B7280' : '#000000',
                transition: 'color 0.22s ease-out',
              }}
            >
              Історія
            </p>
          </button>
          {recentChats.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateRows: historyExpanded ? '1fr' : '0fr',
                transition: 'grid-template-rows 0s',
              }}
            >
              <div
                style={{
                  minHeight: 0,
                  overflow: 'hidden',
                  opacity: historyExpanded && !historyClosing ? 1 : 0,
                  transform:
                    historyExpanded && !historyClosing ? 'translateY(0)' : 'translateY(-10px)',
                  transition: historyClosing
                    ? 'opacity 0.18s cubic-bezier(0.33, 1, 0.68, 1), transform 0.2s cubic-bezier(0.34, 1.15, 0.64, 1)'
                    : 'opacity 0.28s cubic-bezier(0.33, 1, 0.68, 1), transform 0.32s cubic-bezier(0.34, 1.15, 0.64, 1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    paddingTop: '1px',
                  }}
                >
                  {recentChats.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: '32px',
                        padding: '6px 16px 6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                      }}
                      title={chat.title}
                    >
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '20px',
                          letterSpacing: '0.14px',
                          color: '#000000',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {chat.title.length > 40 ? `${chat.title.slice(0, 40)}…` : chat.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Section - Profile — завжди внизу, під лінією */}
      <div
        style={{
          flexShrink: 0,
          paddingBottom: '14px',
          paddingLeft: '12px',
          paddingRight: '12px',
          zIndex: 30,
        }}
      >
        {/* Horizontal line — відстань від лінії до елементів = відстань від низу */}
        <div
          style={{
            height: '1px',
            backgroundColor: '#E0E7E8',
            marginLeft: '-12px',
            marginRight: '-12px',
          }}
        />
        <div
          ref={menuRef}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            paddingTop: '12px',
          }}
        >
          {/* Popup menu — above profile (ref: Radix-style dropdown) */}
          {isMenuOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="overflow-hidden rounded-xl"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '-6px',
                right: '-6px',
                zIndex: 100,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E7E8',
                padding: '6px',
              }}
            >
              {/* Menu items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSettingsClick}
                  className="w-full rounded-lg transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    minHeight: '32px',
                    padding: '6px 8px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M11.6665 2.72425C11.6665 2.14008 11.1932 1.66675 10.609 1.66675H9.3915C8.8065 1.66675 8.33317 2.14008 8.33317 2.72425C8.33317 3.20591 8.00317 3.61925 7.554 3.79591C7.48317 3.82425 7.41234 3.85425 7.34317 3.88425C6.90067 4.07591 6.37484 4.01758 6.03317 3.67675C5.83487 3.47859 5.56601 3.36728 5.28567 3.36728C5.00533 3.36728 4.73647 3.47859 4.53817 3.67675L3.6765 4.53841C3.47835 4.73671 3.36703 5.00558 3.36703 5.28591C3.36703 5.56625 3.47835 5.83512 3.6765 6.03341C4.01817 6.37508 4.0765 6.90008 3.88317 7.34341C3.85279 7.41318 3.82362 7.48347 3.79567 7.55425C3.619 8.00341 3.20567 8.33341 2.724 8.33341C2.13984 8.33341 1.6665 8.80675 1.6665 9.39091V10.6092C1.6665 11.1934 2.13984 11.6667 2.724 11.6667C3.20567 11.6667 3.619 11.9967 3.79567 12.4459C3.824 12.5167 3.854 12.5876 3.88317 12.6567C4.07567 13.0992 4.01734 13.6251 3.6765 13.9667C3.47835 14.165 3.36703 14.4339 3.36703 14.7142C3.36703 14.9946 3.47835 15.2635 3.6765 15.4617L4.53817 16.3234C4.73647 16.5216 5.00533 16.6329 5.28567 16.6329C5.56601 16.6329 5.83487 16.5216 6.03317 16.3234C6.37484 15.9817 6.89984 15.9234 7.34317 16.1159C7.41234 16.1467 7.48317 16.1759 7.554 16.2042C8.00317 16.3809 8.33317 16.7942 8.33317 17.2759C8.33317 17.8601 8.8065 18.3334 9.39067 18.3334H10.609C11.1932 18.3334 11.6665 17.8601 11.6665 17.2759C11.6665 16.7942 11.9965 16.3809 12.4457 16.2034C12.5165 16.1759 12.5873 16.1467 12.6565 16.1167C13.099 15.9234 13.6248 15.9826 13.9657 16.3234C14.0639 16.4217 14.1805 16.4996 14.3088 16.5528C14.4371 16.6059 14.5747 16.6333 14.7136 16.6333C14.8525 16.6333 14.99 16.6059 15.1184 16.5528C15.2467 16.4996 15.3633 16.4217 15.4615 16.3234L16.3232 15.4617C16.5213 15.2635 16.6326 14.9946 16.6326 14.7142C16.6326 14.4339 16.5213 14.165 16.3232 13.9667C15.9815 13.6251 15.9232 13.1001 16.1157 12.6567C16.1465 12.5876 16.1757 12.5167 16.204 12.4459C16.3807 11.9967 16.794 11.6667 17.2757 11.6667C17.8598 11.6667 18.3332 11.1934 18.3332 10.6092V9.39175C18.3332 8.80758 17.8598 8.33425 17.2757 8.33425C16.794 8.33425 16.3807 8.00425 16.2032 7.55508C16.1752 7.48429 16.1461 7.414 16.1157 7.34425C15.924 6.90175 15.9823 6.37591 16.3232 6.03425C16.5213 5.83595 16.6326 5.56708 16.6326 5.28675C16.6326 5.00641 16.5213 4.73755 16.3232 4.53925L15.4615 3.67758C15.2632 3.47942 14.9943 3.36811 14.714 3.36811C14.4337 3.36811 14.1648 3.47942 13.9665 3.67758C13.6248 4.01925 13.0998 4.07758 12.6565 3.88508C12.5867 3.85442 12.5165 3.82497 12.4457 3.79675C11.9965 3.61925 11.6665 3.20508 11.6665 2.72425Z"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.3332 10.0001C13.3332 10.8841 12.982 11.732 12.3569 12.3571C11.7317 12.9822 10.8839 13.3334 9.99984 13.3334C9.11578 13.3334 8.26794 12.9822 7.64281 12.3571C7.01769 11.732 6.6665 10.8841 6.6665 10.0001C6.6665 9.11603 7.01769 8.26818 7.64281 7.64306C8.26794 7.01794 9.11578 6.66675 9.99984 6.66675C10.8839 6.66675 11.7317 7.01794 12.3569 7.64306C12.982 8.26818 13.3332 9.11603 13.3332 10.0001Z"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0.14px',
                      color: '#000000',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Налаштування
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleReportErrorClick}
                  className="w-full rounded-lg transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    minHeight: '32px',
                    padding: '6px 8px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M3.3335 12.5H14.8877C15.046 12.4999 15.2011 12.4548 15.3347 12.3698C15.4683 12.2848 15.5749 12.1635 15.642 12.0201C15.7092 11.8767 15.7341 11.7171 15.7138 11.5601C15.6936 11.403 15.629 11.255 15.5277 11.1333L12.5002 7.5L15.5277 3.86667C15.629 3.745 15.6936 3.59698 15.7138 3.43993C15.7341 3.28289 15.7092 3.12332 15.642 2.97992C15.5749 2.83652 15.4683 2.71522 15.3347 2.63023C15.2011 2.54523 15.046 2.50006 14.8877 2.5H3.3335V17.5"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0.14px',
                      color: '#000000',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Виникла помилка
                  </span>
                </button>
              </div>

              {/* Separator */}
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#E0E7E8',
                  margin: '6px 0',
                }}
                aria-hidden
              />

              {/* Вийти */}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogoutClick}
                className="w-full rounded-lg transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  minHeight: '32px',
                  padding: '6px 8px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                    style={{ display: 'block' }}
                  >
                    <g transform="rotate(90 10 10)">
                      <path
                        d="M12.915 4.094L9.944 1.124M9.944 1.124L6.973 4.094M9.944 1.124L9.944 13.006"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.003 8.054H2.022V16.966C2.022 18.06 2.909 18.946 4.003 18.946H15.885C16.966 18.946 17.865 18.06 17.865 16.966V8.054H15.885"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0.14px',
                    color: '#000000',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Вийти
                </span>
              </button>
            </div>
          )}

          {/* Profile trigger + user info */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="group transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: 0,
              flex: '1 1 0',
              padding: 0,
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: '#E0E0E0',
              }}
            >
              <Image
                src="/images/workspace/avatar.png"
                alt="Profile image"
                width={24}
                height={24}
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ minWidth: 0, flex: '1 1 0' }}>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                }}
                title="Олександр"
              >
                Олександр
              </div>
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '1.25',
                  letterSpacing: '0.12px',
                  color: '#5E5E5E',
                  marginTop: '2px',
                }}
              >
                <span>Free</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
