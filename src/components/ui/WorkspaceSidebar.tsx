'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';

import {
  SidebarToggleIcon,
  NewChatIcon,
  ProjectsIcon,
  SettingsIcon,
  ReportErrorIcon,
  LogoutIcon,
  SidebarSearchIcon,
} from '@/components/icons';
import { useSearchOpen } from '@/contexts/search-open';
import { useSettingsOpen } from '@/contexts/settings-open';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  fetchChatLibrary,
  isChatStoreStorageEvent,
  type ChatLibraryItem,
  updateChatLibraryItem,
} from '@/lib/chat-library';
import { cn } from '@/lib/utils';
import { WORKSPACE_START_NEW_CHAT_EVENT } from '@/workspace-chat';

import {
  SIDEBAR_CHAT_MENU_HEIGHT,
  SIDEBAR_CHAT_MENU_WIDTH,
  SidebarChatMenu,
} from '../sidebar/SidebarChatMenu';
import { SidebarDeleteDialog } from '../sidebar/SidebarDeleteDialog';
import { SidebarHistoryItem } from '../sidebar/SidebarHistoryItem';
import { SidebarRenameDialog } from '../sidebar/SidebarRenameDialog';

interface WorkspaceSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  overlayActive?: boolean;
}

export const WORKSPACE_SIDEBAR_EXPANDED_WIDTH = 250;
export const WORKSPACE_SIDEBAR_COLLAPSED_WIDTH = 64;
export const WORKSPACE_SIDEBAR_TRANSITION = '220ms cubic-bezier(0.4, 0, 0.2, 1)';

export function WorkspaceSidebar({
  className,
  collapsed = false,
  onToggleCollapse,
  overlayActive = false,
}: WorkspaceSidebarProps) {
  const { open: openSettings } = useSettingsOpen();
  const { isOpen: isSearchOpen, toggle: toggleSearchOpen } = useSearchOpen();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRecentChatId = pathname === '/' ? searchParams.get('chat') : null;

  const [recentChats, setRecentChats] = useState<ChatLibraryItem[]>([]);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const recentChatsRefreshIdRef = useRef(0);

  const historyChatMenuRef = useRef<HTMLDivElement>(null);
  const openChatMenuTriggerRef = useRef<HTMLElement>(null);

  const [historyFadeState, setHistoryFadeState] = useState({ top: false, bottom: false });
  const [pinnedExpanded, setPinnedExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);
  const [openChatMenuPosition, setOpenChatMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [chatBeingRenamed, setChatBeingRenamed] = useState<ChatLibraryItem | null>(null);
  const [chatBeingDeleted, setChatBeingDeleted] = useState<ChatLibraryItem | null>(null);

  const closeChatMenu = useCallback(() => {
    openChatMenuTriggerRef.current = null;
    setOpenChatMenuId(null);
    setOpenChatMenuPosition(null);
  }, []);

  const refreshRecentChats = useCallback(() => {
    const refreshId = ++recentChatsRefreshIdRef.current;
    fetchChatLibrary(DEFAULT_CHAT_USER_ID)
      .then((chats) => {
        if (recentChatsRefreshIdRef.current === refreshId) {
          setRecentChats(chats);
        }
      })
      .catch(() => {
        if (recentChatsRefreshIdRef.current === refreshId) {
          setRecentChats([]);
        }
      });
  }, []);

  const updateHistoryFadeState = useCallback(() => {
    const el = historyScrollRef.current;
    if (!el) {
      setHistoryFadeState((prev) =>
        prev.top || prev.bottom ? { top: false, bottom: false } : prev
      );
      return;
    }
    // Preserve the last fade mask while the sidebar collapses so rows under the
    // bottom gradient do not flash before the content opacity transition finishes.
    if (collapsed) return;
    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
    const nextState = {
      top: el.scrollTop > 4,
      bottom: maxScrollTop - el.scrollTop > 4,
    };
    setHistoryFadeState((prev) =>
      prev.top === nextState.top && prev.bottom === nextState.bottom ? prev : nextState
    );
  }, [collapsed]);

  const handleHistoryScroll = useCallback(() => {
    requestAnimationFrame(updateHistoryFadeState);
  }, [updateHistoryFadeState]);

  useEffect(() => {
    queueMicrotask(() => refreshRecentChats());
  }, [refreshRecentChats]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(updateHistoryFadeState);
    return () => window.cancelAnimationFrame(frameId);
  }, [recentChats, pinnedExpanded, historyExpanded, collapsed, updateHistoryFadeState]);

  useEffect(() => {
    const handleResize = () => updateHistoryFadeState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateHistoryFadeState]);

  useEffect(() => {
    const onUpdate = () => refreshRecentChats();
    const handleStorage = (event: StorageEvent) => {
      if (!isChatStoreStorageEvent(event)) return;
      onUpdate();
    };
    window.addEventListener(CHAT_STORE_UPDATED_EVENT, onUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      recentChatsRefreshIdRef.current += 1;
      window.removeEventListener(CHAT_STORE_UPDATED_EVENT, onUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshRecentChats]);

  const syncOpenChatMenuPosition = useCallback(() => {
    const trigger = openChatMenuTriggerRef.current;
    if (!trigger) {
      setOpenChatMenuPosition(null);
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const preferredTop = rect.bottom + 4;
    const fallbackTop = rect.top - SIDEBAR_CHAT_MENU_HEIGHT - 4;
    const preferredLeft = rect.right - SIDEBAR_CHAT_MENU_WIDTH;
    const top =
      preferredTop + SIDEBAR_CHAT_MENU_HEIGHT <= availableHeight - 12
        ? preferredTop
        : Math.max(12, fallbackTop);
    const left = Math.min(
      Math.max(12, preferredLeft),
      availableWidth - SIDEBAR_CHAT_MENU_WIDTH - 12
    );
    setOpenChatMenuPosition({ left, top });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      const isInsideChatMenu = historyChatMenuRef.current?.contains(target) ?? false;
      const isInsideChatMenuTrigger = openChatMenuTriggerRef.current?.contains(target) ?? false;
      if (!isInsideChatMenu && !isInsideChatMenuTrigger) {
        closeChatMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeChatMenu]);

  useEffect(() => {
    if (collapsed) {
      queueMicrotask(() => {
        setIsMenuOpen(false);
        closeChatMenu();
      });
    }
  }, [closeChatMenu, collapsed]);

  useEffect(() => {
    if (!openChatMenuId) return;
    const syncFrameId = window.requestAnimationFrame(() => {
      syncOpenChatMenuPosition();
    });
    const handleViewportChange = () => {
      syncOpenChatMenuPosition();
    };
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.cancelAnimationFrame(syncFrameId);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [openChatMenuId, syncOpenChatMenuPosition]);

  useEffect(() => {
    if (!openChatMenuId) return;
    const activeChatStillExists = recentChats.some((chat) => chat.id === openChatMenuId);
    if (!activeChatStillExists) {
      queueMicrotask(closeChatMenu);
    }
  }, [closeChatMenu, openChatMenuId, recentChats]);

  useEffect(() => {
    if (isSearchOpen) {
      queueMicrotask(closeChatMenu);
    }
  }, [closeChatMenu, isSearchOpen]);

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    openSettings();
  };

  const handleReportErrorClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
  };

  const handleNewChatClick = useCallback(() => {
    if (pathname === '/' || pathname === '/') {
      window.dispatchEvent(new CustomEvent(WORKSPACE_START_NEW_CHAT_EVENT));
      return;
    }
    router.push('/');
  }, [pathname, router]);

  const handleRecentChatClick = useCallback(
    (chatId: string) => {
      closeChatMenu();
      if (pathname === '/' && activeRecentChatId === chatId) {
        return;
      }
      router.push(`/?chat=${encodeURIComponent(chatId)}`);
    },
    [activeRecentChatId, closeChatMenu, pathname, router]
  );

  const handleMenuClick = useCallback(
    (chat: ChatLibraryItem, trigger: HTMLElement) => {
      if (openChatMenuId === chat.id) {
        closeChatMenu();
        return;
      }
      openChatMenuTriggerRef.current = trigger;
      setOpenChatMenuId(chat.id);
    },
    [openChatMenuId, closeChatMenu]
  );

  const handleTogglePinned = useCallback(
    async (chat: ChatLibraryItem) => {
      const nextPinned = !chat.pinned;
      closeChatMenu();
      setRecentChats((prev) =>
        prev.map((item) => (item.id === chat.id ? { ...item, pinned: nextPinned } : item))
      );
      try {
        await updateChatLibraryItem(chat.id, { userId: DEFAULT_CHAT_USER_ID, pinned: nextPinned });
      } catch {
        setRecentChats((prev) =>
          prev.map((item) => (item.id === chat.id ? { ...item, pinned: chat.pinned } : item))
        );
      }
    },
    [closeChatMenu]
  );

  const handleRenameSuccess = useCallback((updatedChat: ChatLibraryItem) => {
    setRecentChats((prev) => prev.map((item) => (item.id === updatedChat.id ? updatedChat : item)));
    setChatBeingRenamed(null);
  }, []);

  const handleDeleteSuccess = useCallback(
    (deletedChatId: string) => {
      setRecentChats((prev) => prev.filter((item) => item.id !== deletedChatId));
      setChatBeingDeleted(null);
      if (activeRecentChatId === deletedChatId) {
        router.push('/');
      }
    },
    [activeRecentChatId, router]
  );

  const navButtonClasses = cn(
    'relative isolate flex h-8 w-full cursor-pointer items-center justify-start gap-3 rounded-lg border-none py-1.5 px-[15px] text-left transition-colors duration-150',
    'before:absolute before:-inset-y-[2px] before:inset-x-0 before:-z-10 before:pointer-events-none before:rounded-lg before:bg-transparent before:transition-colors before:duration-150 hover:before:bg-[#F4F4F6] disabled:hover:before:bg-transparent first:before:top-0 last:before:bottom-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]'
  );

  const menuItemClasses =
    'flex min-h-8 w-full cursor-pointer items-center justify-start gap-2 rounded-lg border-none px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]';

  const pinnedChats = recentChats.filter((chat) => chat.pinned);
  const historyChats = recentChats.filter((chat) => !chat.pinned);
  const openChatMenuChat =
    openChatMenuId == null
      ? null
      : (recentChats.find((chat) => chat.id === openChatMenuId) ?? null);

  return (
    <>
      <aside
        className={cn(
          'fixed top-0 left-0 flex h-screen flex-col overflow-hidden border-r border-[#E0E7E8] bg-white transition-[width] duration-220 ease-in-out',
          collapsed ? 'w-16' : 'w-62.5',
          overlayActive ? 'z-50 shadow-2xl' : 'z-40',
          className
        )}
        data-sidebar
        data-collapsed={collapsed ? 'true' : 'false'}
      >
        <div className="flex shrink-0 flex-col gap-2.25 p-2">
          <div className="relative h-10.5">
            <div className="flex h-8 min-w-0 items-center pt-2.5 pr-11 pl-3.75">
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

          <div className="mt-0 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={handleNewChatClick}
              aria-label="New chat"
              className={cn('group', navButtonClasses)}
              title="New chat"
            >
              <span className="flex min-w-0 items-center gap-3 transition-transform duration-75 ease-out group-active:scale-[0.98]">
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

            <button
              type="button"
              onClick={toggleSearchOpen}
              aria-label="Search"
              aria-expanded={isSearchOpen}
              className={cn(navButtonClasses, isSearchOpen && 'bg-[#F4F4F6]')}
              title="Search"
            >
              <span className="flex min-w-0 items-center gap-3 transition-transform duration-75 ease-out group-active:scale-[0.98]">
                <SidebarSearchIcon
                  className="block shrink-0"
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                    collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'
                  )}
                  aria-hidden={collapsed}
                >
                  <p className="m-0 font-sans text-sm font-medium tracking-[0.14px] text-black">
                    Пошук
                  </p>
                </span>
              </span>
            </button>

            <button
              aria-label="Projects"
              className={cn(navButtonClasses, 'cursor-default text-[#6B7280]')}
              title="Projects"
              disabled
            >
              <ProjectsIcon width={18} height={18} className="block shrink-0" aria-hidden="true" />
              <span
                className={cn(
                  'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                  collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'
                )}
                aria-hidden={collapsed}
              >
                <p className="m-0 font-sans text-sm font-medium tracking-[0.14px] text-[#6B7280]">
                  Проєкти
                </p>
              </span>
            </button>
          </div>
        </div>

        <div
          className={cn(
            'relative flex flex-1 flex-col overflow-hidden transition-opacity duration-220 ease-in-out',
            collapsed ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
          )}
        >
          <div
            ref={historyScrollRef}
            onScroll={handleHistoryScroll}
            className={cn(
              'flex h-full flex-1 flex-col overflow-x-hidden p-2 pt-1.5',
              pinnedExpanded || historyExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'
            )}
          >
            <div className="mt-0 flex flex-col gap-0.5">
              {/* === ЗАКРІПЛЕНІ === */}
              {pinnedChats.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPinnedExpanded((prev) => !prev)}
                    className="flex h-8 w-fit cursor-pointer items-center justify-start gap-3 rounded-lg border-none py-1.5 pr-4 pl-3 text-left focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                  >
                    <p
                      className={cn(
                        'font-sans text-[13px] font-medium tracking-[0.14px] transition-colors duration-220 ease-out',
                        pinnedExpanded ? 'text-[#6B7280]' : 'text-black'
                      )}
                    >
                      Закріплені
                    </p>
                  </button>
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-300 ease-in-out',
                      pinnedExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                  >
                    <div
                      className={cn(
                        'min-h-0 overflow-hidden transition-all duration-300 ease-in-out',
                        pinnedExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                      )}
                    >
                      <div className="flex flex-col gap-0.5 pt-0">
                        {pinnedChats.map((chat) => (
                          <div
                            key={chat.id}
                            className="transition-transform duration-75 ease-out active:scale-[0.98]"
                          >
                            <SidebarHistoryItem
                              chat={chat}
                              isActive={activeRecentChatId === chat.id}
                              isMenuOpen={openChatMenuId === chat.id}
                              onClick={handleRecentChatClick}
                              onMenuClick={handleMenuClick}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === ІСТОРІЯ === */}
              <button
                type="button"
                onClick={() => setHistoryExpanded((prev) => !prev)}
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
              {historyChats.length > 0 && (
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-in-out',
                    historyExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div
                    className={cn(
                      'min-h-0 overflow-hidden transition-all duration-300 ease-in-out',
                      historyExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                    )}
                  >
                    <div className="flex flex-col gap-0.5 pt-0">
                      {historyChats.map((chat) => (
                        <div
                          key={chat.id}
                          className="transition-transform duration-75 ease-out active:scale-[0.98]"
                        >
                          <SidebarHistoryItem
                            chat={chat}
                            isActive={activeRecentChatId === chat.id}
                            isMenuOpen={openChatMenuId === chat.id}
                            onClick={handleRecentChatClick}
                            onMenuClick={handleMenuClick}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-6"
            style={{
              background: historyFadeState.top
                ? 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 58%, rgba(255, 255, 255, 0) 100%)'
                : 'transparent',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-6"
            style={{
              background: historyFadeState.bottom
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 42%, #FFFFFF 100%)'
                : 'transparent',
            }}
          />
        </div>

        <div className="z-30 shrink-0 px-3 pb-3.5">
          <div ref={menuRef} className="relative flex min-w-0 items-center pt-3">
            {isMenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className={cn(
                  'absolute z-100 overflow-hidden rounded-xl border border-[#E0E7E8] bg-white p-1.5 shadow-sm',
                  collapsed
                    ? 'bottom-0 left-[calc(100%+8px)] w-55'
                    : '-inset-x-1.5 bottom-[calc(100%+8px)]'
                )}
              >
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

                <div className="my-1.5 h-px bg-[#E0E7E8]" aria-hidden />

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

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="group flex w-full flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg border-none bg-transparent pl-1.5 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#E0E0E0]">
                <Image
                  src="/images/workspace/avatar.png"
                  alt="Profile image"
                  width={28}
                  height={28}
                  className="block h-full w-full object-cover"
                />
              </div>
              <div
                className={cn(
                  'flex flex-col overflow-hidden whitespace-nowrap transition-all duration-220 ease-in-out',
                  collapsed ? 'max-w-0 flex-[0_0_auto] opacity-0' : 'max-w-full flex-1 opacity-100'
                )}
                aria-hidden={collapsed}
              >
                <div className="flex min-h-7 min-w-0 items-center justify-between gap-2">
                  <div
                    className="flex-1 truncate font-sans text-sm leading-7 font-medium tracking-[0.14px] text-black"
                    title="Олександр"
                  >
                    Олександр
                  </div>
                  <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-white px-3 font-sans text-xs tracking-[0.12px] text-[#5E5E5E]">
                    Free
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {openChatMenuChat && openChatMenuPosition && (
        <SidebarChatMenu
          ref={historyChatMenuRef}
          chat={openChatMenuChat}
          position={openChatMenuPosition}
          onPinToggle={handleTogglePinned}
          onRenameClick={() => {
            closeChatMenu();
            setChatBeingRenamed(openChatMenuChat);
          }}
          onDeleteClick={() => {
            closeChatMenu();
            setChatBeingDeleted(openChatMenuChat);
          }}
        />
      )}

      {chatBeingRenamed && (
        <SidebarRenameDialog
          chat={chatBeingRenamed}
          onClose={() => setChatBeingRenamed(null)}
          onSuccess={handleRenameSuccess}
        />
      )}

      {chatBeingDeleted && (
        <SidebarDeleteDialog
          chat={chatBeingDeleted}
          onClose={() => setChatBeingDeleted(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

export default WorkspaceSidebar;
