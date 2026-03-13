'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

import { useSettingsOpen } from '@/contexts/settings-open';
import type { RecentChatItem } from '@/entities/chat/model';
import { WORKSPACE_START_NEW_CHAT_EVENT } from '@/hooks/use-workspace-chat';
import {
  getRecentChats,
  RECENT_CHATS_UPDATED_EVENT,
  RECENT_CHATS_STORAGE_KEY,
} from '@/lib/recent-chats';
import { cn } from '@/lib/utils';

interface WorkspaceSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const WORKSPACE_SIDEBAR_EXPANDED_WIDTH = 250;
export const WORKSPACE_SIDEBAR_COLLAPSED_WIDTH = 64;
export const WORKSPACE_SIDEBAR_TRANSITION = '220ms cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * Workspace Sidebar Component - Left navigation panel
 *
 * Figma: node 0:1357 (sidebar)
 * Contains: Logo, Navigation items, User profile
 */
export function WorkspaceSidebar({
  className,
  collapsed = false,
  onToggleCollapse,
}: WorkspaceSidebarProps) {
  const { open: openSettings } = useSettingsOpen();
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

  useEffect(() => {
    if (collapsed) queueMicrotask(() => setIsMenuOpen(false));
  }, [collapsed]);

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    openSettings();
  };

  const handleReportErrorClick = () => {
    setIsMenuOpen(false);
    // Preserved: existing report error handler (wire here if needed)
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    // TODO: wire logout (e.g. clear session, redirect)
  };

  // Shared reusable classes for navigation and history items
  const navButtonClasses = cn(
    'relative isolate flex h-8 w-full cursor-pointer items-center justify-start gap-3 rounded-lg border-none py-1.5 pl-[15px] pr-4 text-left transition-colors duration-150',
    'before:absolute before:-inset-y-[2px] before:inset-x-0 before:-z-10 before:pointer-events-none before:rounded-lg before:bg-transparent before:transition-colors before:duration-150 hover:before:bg-[#F4F4F6] first:before:top-0 last:before:bottom-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]'
  );

  const historyItemClasses = cn(
    'relative isolate flex min-h-8 w-full cursor-pointer items-center justify-start rounded-lg border-none py-1.5 pl-3 pr-4 text-left transition-colors duration-150',
    'before:absolute before:-inset-y-[2px] before:inset-x-0 before:-z-10 before:pointer-events-none before:rounded-lg before:bg-transparent before:transition-colors before:duration-150 hover:before:bg-[#F4F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]'
  );

  const menuItemClasses =
    'flex min-h-8 w-full cursor-pointer items-center justify-start gap-2 rounded-lg border-none px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]';

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 flex h-screen flex-col overflow-hidden border-r border-[#E0E7E8] bg-white transition-[width] duration-220 ease-in-out',
        collapsed ? 'w-16' : 'w-62.5',
        className
      )}
      data-sidebar
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      {/* Fixed at the top: logo + New Chat, Search, Chats, Projects */}
      <div className="flex shrink-0 flex-col gap-2.25 p-2">
        {/* Top row: logo on the left, split-panel icon on the right (Figma 22:5) */}
        <div className="relative h-10.5">
          <div className="flex h-8 min-w-0 items-center pt-2.5 pr-11 pl-3">
            <div
              className={cn(
                'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-30 opacity-100'
              )}
              aria-hidden={collapsed}
            >
              <p className="m-0 font-sans text-[18px] leading-5 font-semibold tracking-[0.02em] text-black">
                LEXERY
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            data-sidebar-toggle
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className={cn(
              'absolute top-1.25 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition-all duration-220 ease-in-out hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset',
              collapsed ? 'left-[8px]' : 'left-49.5'
            )}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block shrink-0"
              aria-hidden
            >
              <rect
                x="1"
                y="1"
                width="16"
                height="16"
                rx="3.5"
                stroke="currentColor"
                strokeWidth="1.45"
                fill="none"
              />
              <path
                d="M6.5 1.25v15.5"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Nav — Claude: px-2 pt-2, gap-px, items h-8 py-1.5 px-4 rounded-lg gap-3 */}
        <div className="mt-0 flex flex-col gap-0.5">
          {/* New chat */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(WORKSPACE_START_NEW_CHAT_EVENT))}
            aria-label="Новий чат"
            className={cn('group', navButtonClasses)}
            title="Новий чат"
          >
            <span className="flex min-w-0 items-center gap-3 transition-transform duration-100 group-active:scale-[0.98]">
              <svg
                width={18}
                height={18}
                viewBox="14 14 150 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="block shrink-0"
                aria-hidden
              >
                <path
                  d="M89 155.75C125.865 155.75 155.75 125.865 155.75 88.9996C155.75 52.1345 125.865 22.2496 89 22.2496C52.135 22.2496 22.25 52.1345 22.25 88.9996C22.25 100.033 24.9269 110.441 29.6667 119.61L22.25 155.75L58.3899 148.333C67.5587 153.073 77.9667 155.75 89 155.75Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M89 66.7572V111.257"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M66.75 89.0072H111.25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={cn(
                  'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                  collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'
                )}
                aria-hidden={collapsed}
              >
                <p className="m-0 font-sans text-sm font-medium tracking-[0.14px] text-black">
                  Новий чат
                </p>
              </span>
            </span>
          </button>

          {/* Chats */}
          <button aria-label="Чати" className={navButtonClasses} title="Чати">
            <svg
              width={18}
              height={18}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block shrink-0"
              shapeRendering="geometricPrecision"
              aria-hidden
            >
              <g transform="scale(0.11235955056179775)">
                <path
                  d="M64.8725 125.994C93.4857 124.369 116.198 100.127 116.198 70.4578C116.198 39.7373 91.8463 14.8333 61.8072 14.8333C31.7681 14.8333 7.41667 39.7373 7.41667 70.4578C7.41667 81.4038 10.5073 91.6108 15.8462 100.217L12.0023 112.01L11.9962 112.027C10.524 116.544 9.78751 118.803 10.3119 120.307C10.7689 121.618 11.7832 122.651 13.0646 123.118C14.5302 123.653 16.7242 122.905 21.1112 121.409L21.1736 121.39L32.7086 117.459C41.1234 122.919 51.1045 126.081 61.8077 126.081C62.8362 126.081 63.8581 126.051 64.8725 125.994ZM64.8725 125.994C64.8732 125.996 64.8717 125.992 64.8725 125.994ZM64.8725 125.994C72.3143 147.645 92.4843 163.167 116.199 163.167C126.902 163.167 136.881 160.002 145.295 154.542L156.828 158.473L156.85 158.478C161.266 159.983 163.48 160.737 164.95 160.201C166.232 159.734 167.233 158.701 167.69 157.39C168.215 155.884 167.481 153.622 166.004 149.093L162.161 137.3L163.448 135.118C167.994 126.99 170.583 117.575 170.583 107.541C170.583 76.8203 146.237 51.9163 116.198 51.9163L114.162 51.9547L113.135 52.006"
                  stroke="currentColor"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
            <span
              className={cn(
                'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'
              )}
              aria-hidden={collapsed}
            >
              <p className="m-0 font-sans text-sm font-medium tracking-[0.14px] text-black">Чати</p>
            </span>
          </button>

          {/* Projects */}
          <button aria-label="Проєкти" className={navButtonClasses} title="Проєкти">
            <svg
              width={18}
              height={18}
              viewBox="22.25 22.25 133.5 133.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block shrink-0"
              aria-hidden
            >
              <circle
                cx="126.083"
                cy="51.9167"
                r="22.25"
                fill="none"
                stroke="currentColor"
                strokeWidth="11.125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="51.9167"
                cy="126.083"
                r="22.25"
                fill="none"
                stroke="currentColor"
                strokeWidth="11.125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M103.833 103.833H148.333V140.917C148.333 145.013 145.013 148.333 140.917 148.333H111.25C107.154 148.333 103.833 145.013 103.833 140.917V103.833Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="11.125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M29.6667 29.6667H74.1667V66.75C74.1667 70.8461 70.8461 74.1667 66.75 74.1667H37.0833C32.9872 74.1667 29.6667 70.8461 29.6667 66.75V29.6667Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="11.125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={cn(
                'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'
              )}
              aria-hidden={collapsed}
            >
              <p className="m-0 font-sans text-sm font-medium tracking-[0.14px] text-black">
                Проєкти
              </p>
            </span>
          </button>
        </div>
      </div>

      {/* Line above history — appears on scroll, only when history is expanded */}
      {!collapsed && historyExpanded && historyScrolled && (
        <div className="shrink-0 px-2">
          <div className="-mx-2 h-px bg-[#E0E7E8]" />
        </div>
      )}

      {/* Only History scrolls — chat list (scrolls only when expanded) */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-opacity duration-220 ease-in-out',
          collapsed ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
        )}
      >
        <div
          ref={historyScrollRef}
          onScroll={handleHistoryScroll}
          className={cn(
            'flex h-full flex-1 flex-col overflow-x-hidden p-2 pt-1.5',
            historyExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'
          )}
        >
          {/* History — button + list of recent chats */}
          <div className="mt-0 flex flex-col gap-0.5">
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
              className="flex h-8 w-fit cursor-pointer items-center justify-start gap-3 rounded-lg border-none py-1.5 pr-4 pl-3 text-left focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            >
              <p
                className={cn(
                  'font-sans text-[13px] font-medium tracking-[0.14px] transition-colors duration-220 ease-out',
                  historyExpanded ? 'text-[#6B7280]' : 'text-black'
                )}
              >
                Історія
              </p>
            </button>
            {recentChats.length > 0 ? (
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-0',
                  historyExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div
                  className={cn(
                    'min-h-0 overflow-hidden',
                    historyExpanded && !historyClosing
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-2.5 opacity-0'
                  )}
                  style={{
                    transition: historyClosing
                      ? 'opacity 0.18s cubic-bezier(0.33, 1, 0.68, 1), transform 0.2s cubic-bezier(0.34, 1.15, 0.64, 1)'
                      : 'opacity 0.28s cubic-bezier(0.33, 1, 0.68, 1), transform 0.32s cubic-bezier(0.34, 1.15, 0.64, 1)',
                  }}
                >
                  <div className="flex flex-col gap-0.5 pt-0">
                    {recentChats.map((chat) => (
                      <button
                        key={chat.id}
                        type="button"
                        className={historyItemClasses}
                        title={chat.title}
                      >
                        <p className="flex-1 truncate font-sans text-sm font-medium tracking-[0.14px] text-black">
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
      </div>

      {/* Bottom Section - Profile — always at the bottom, below the line */}
      <div className="z-30 shrink-0 px-3 pb-3.5">
        {/* Horizontal line — distance from line to elements = distance from bottom */}
        <div className="-mx-3 h-px bg-[#E0E7E8]" />

        <div ref={menuRef} className="relative flex min-w-0 items-center pt-3">
          {/* Popup menu — above profile (ref: Radix-style dropdown) */}
          {isMenuOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className={cn(
                'absolute z-100 overflow-hidden rounded-xl border border-[#E0E7E8] bg-white p-1.5',
                collapsed
                  ? 'bottom-0 left-[calc(100%+8px)] w-55'
                  : '-inset-x-1.5 bottom-[calc(100%+8px)]'
              )}
            >
              {/* Menu items */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSettingsClick}
                  className={menuItemClasses}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
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
                  <span className="flex-1 truncate font-sans text-sm font-medium tracking-[0.14px] text-black">
                    Налаштування
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleReportErrorClick}
                  className={menuItemClasses}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
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
                  <span className="flex-1 truncate font-sans text-sm font-medium tracking-[0.14px] text-black">
                    Виникла помилка
                  </span>
                </button>
              </div>

              {/* Separator */}
              <div className="my-1.5 h-px bg-[#E0E7E8]" aria-hidden />

              {/* Log out */}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogoutClick}
                className={menuItemClasses}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                    className="block"
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
                <span className="flex-1 truncate font-sans text-sm font-medium tracking-[0.14px] text-black">
                  Вийти
                </span>
              </button>
            </div>
          )}

          {/* Profile trigger + user info */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="group flex w-full flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg border-none bg-transparent pl-2 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#E0E0E0]">
              <Image
                src="/images/workspace/avatar.png"
                alt="Profile image"
                width={24}
                height={24}
                className="block h-full w-full object-cover"
              />
            </div>
            <div
              className={cn(
                'flex flex-col overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                collapsed ? 'max-w-0 flex-[0_0_auto] opacity-0' : 'max-w-40 flex-1 opacity-100'
              )}
              aria-hidden={collapsed}
            >
              <div
                className="truncate font-sans text-sm font-medium tracking-[0.14px] text-black"
                title="Олександр"
              >
                Олександр
              </div>
              <div className="mt-0.5 font-sans text-xs leading-tight font-normal tracking-[0.12px] text-[#5E5E5E]">
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
