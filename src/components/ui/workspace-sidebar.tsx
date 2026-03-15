'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

import {
  SidebarToggleIcon,
  NewChatIcon,
  ChatsIcon,
  ProjectsIcon,
  SettingsIcon,
  ReportErrorIcon,
  LogoutIcon,
} from '@/components/icons';
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
            <SidebarToggleIcon
              width={18}
              height={18}
              className="block shrink-0"
              aria-hidden="true"
            />
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
              <NewChatIcon width={18} height={18} className="block shrink-0" aria-hidden="true" />
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
            <ChatsIcon width={18} height={18} className="block shrink-0" aria-hidden="true" />
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
            <ProjectsIcon width={18} height={18} className="block shrink-0" aria-hidden="true" />
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
                    <SettingsIcon width={20} height={20} aria-hidden="true" />
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
                    <ReportErrorIcon width={20} height={20} aria-hidden="true" />
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
                  <LogoutIcon width={18} height={18} className="block" aria-hidden="true" />
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
