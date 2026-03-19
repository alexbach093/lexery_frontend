'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import { useSearchOpen } from '@/contexts/search-open';
import { useSettingsOpen } from '@/contexts/settings-open';
import { WORKSPACE_START_NEW_CHAT_EVENT } from '@/hooks/use-workspace-chat';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  deleteChatLibraryItem,
  fetchChatLibrary,
  isChatStoreStorageEvent,
  type ChatLibraryItem,
  updateChatLibraryItem,
} from '@/lib/chat-library';

interface WorkspaceSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  overlayActive?: boolean;
}

export const WORKSPACE_SIDEBAR_EXPANDED_WIDTH = 250;
export const WORKSPACE_SIDEBAR_COLLAPSED_WIDTH = 56;
export const WORKSPACE_SIDEBAR_TRANSITION = '220ms cubic-bezier(0.4, 0, 0.2, 1)';

const SIDEBAR_EDGE_PADDING = 8;
const SIDEBAR_STACK_GAP = 2;
const SIDEBAR_BRAND_SECTION_GAP = 9;
const SIDEBAR_HISTORY_SECTION_GAP = 6;
const SIDEBAR_HISTORY_FADE_HEIGHT = 24;
const SIDEBAR_PRIMARY_NAV_OFFSET = 5;
const SIDEBAR_NAV_ICON_SIZE = 18;
const SIDEBAR_TOGGLE_SIZE = 32;
const SIDEBAR_TOGGLE_TOP = 5;
const SIDEBAR_PROFILE_SECTION_PADDING_X = 12;
const SIDEBAR_PROFILE_AVATAR_SIZE = 28;
const SIDEBAR_COLLAPSED_CENTER_X = WORKSPACE_SIDEBAR_COLLAPSED_WIDTH / 2;
const SIDEBAR_NAV_PADDING_LEFT =
  SIDEBAR_COLLAPSED_CENTER_X - SIDEBAR_EDGE_PADDING - SIDEBAR_NAV_ICON_SIZE / 2;
const SIDEBAR_PROFILE_PADDING_LEFT =
  SIDEBAR_COLLAPSED_CENTER_X - SIDEBAR_PROFILE_SECTION_PADDING_X - SIDEBAR_PROFILE_AVATAR_SIZE / 2;
const SIDEBAR_TOGGLE_EXPANDED_LEFT =
  WORKSPACE_SIDEBAR_EXPANDED_WIDTH - SIDEBAR_EDGE_PADDING * 2 - SIDEBAR_TOGGLE_SIZE - 4;
const SIDEBAR_TOGGLE_COLLAPSED_LEFT =
  (WORKSPACE_SIDEBAR_COLLAPSED_WIDTH - SIDEBAR_EDGE_PADDING * 2 - SIDEBAR_TOGGLE_SIZE) / 2;
const SIDEBAR_CHAT_RENAME_MIN_LENGTH = 2;
const SIDEBAR_CHAT_RENAME_MAX_LENGTH = 60;
const SIDEBAR_CHAT_RENAME_SUCCESS_CLOSE_DELAY_MS = 250;
const SIDEBAR_CHAT_MENU_WIDTH = 149;
const SIDEBAR_CHAT_MENU_ESTIMATED_HEIGHT = 112;
const SIDEBAR_CHAT_MENU_GAP = 4;
const SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN = 12;
const SIDEBAR_CHAT_MENU_ICON_STROKE = 1.44;
const SIDEBAR_CHAT_MENU_PENCIL_STROKE = 11.8;
const SIDEBAR_DELETE_CHAT_CONFIRM_WIDTH = 436;
const SIDEBAR_DELETE_CHAT_CONFIRM_RADIUS = 28;
const SIDEBAR_DELETE_CHAT_CONFIRM_BUTTON_HEIGHT = 42;
const SIDEBAR_DIALOG_OVERLAY_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.32)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
} as const;

function SidebarChatMoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="4" cy="10" r="1.95" fill="currentColor" />
      <circle cx="10" cy="10" r="1.95" fill="currentColor" />
      <circle cx="16" cy="10" r="1.95" fill="currentColor" />
    </svg>
  );
}

function SidebarChatStarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="15.656"
      height="14.89"
      viewBox="0 0 19.0584 18.207"
      fill="none"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M9.52922 0.8314L12.1095 6.42538L18.227 7.15071L13.7042 11.3333L14.9047 17.3756L9.52922 14.3666L4.15369 17.3756L5.35428 11.3333L0.831428 7.15071L6.94896 6.42538L9.52922 0.8314Z"
        stroke="currentColor"
        strokeWidth={SIDEBAR_CHAT_MENU_ICON_STROKE}
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function SidebarChatPencilIcon() {
  return (
    <svg
      width="14.965"
      height="14.965"
      viewBox="0 0 145.917 147.486"
      fill="none"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M131.554 78.2465V105.942C131.554 125.062 116.055 140.562 96.9348 140.562H41.5435C22.4236 140.562 6.92391 125.062 6.92391 105.942V50.5509C6.92391 31.431 22.4236 15.9313 41.5435 15.9313H69.2391"
        stroke="currentColor"
        strokeWidth={SIDEBAR_CHAT_MENU_PENCIL_STROKE}
        strokeLinecap="round"
      />
      <path
        d="M105.05 10.9877C110.454 5.5757 119.218 5.57239 124.626 10.9803L134.938 21.2917C140.3 26.6535 140.355 35.3337 135.063 40.7639L86.18 90.9177C82.272 94.9274 76.912 97.1884 71.3151 97.1881L59.5638 97.1876C53.6588 97.1874 48.9431 92.265 49.1915 86.3608L49.7045 74.1641C49.9233 68.9626 52.0851 64.0328 55.7621 60.3502L105.05 10.9877Z"
        stroke="currentColor"
        strokeWidth={SIDEBAR_CHAT_MENU_PENCIL_STROKE}
      />
      <path
        d="M95.0638 21.9448L122.856 49.7373"
        stroke="currentColor"
        strokeWidth={SIDEBAR_CHAT_MENU_PENCIL_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarChatTrashIcon() {
  return (
    <svg
      width="13.468"
      height="13.468"
      viewBox="0 0 14.9652 14.9652"
      fill="none"
      overflow="visible"
      aria-hidden
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      <path
        d="M0.8314 0.8314V10.8082C0.8314 11.7265 1.57586 12.471 2.4942 12.471H9.1454C10.0637 12.471 10.8082 11.7265 10.8082 10.8082V0.8314"
        transform="translate(1.6628 3.3256)"
        stroke="currentColor"
        strokeWidth={SIDEBAR_CHAT_MENU_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.8314 0.8314H14.1338"
        transform="translate(0 3.3256)"
        stroke="currentColor"
        strokeWidth={SIDEBAR_CHAT_MENU_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.831582 4.157L2.49438 0.8314H7.48278L9.14558 4.157"
        transform="translate(2.4944 0)"
        stroke="currentColor"
        strokeWidth={SIDEBAR_CHAT_MENU_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Workspace Sidebar Component - Left navigation panel
 *
 * Figma: node 0:1357 (sidebar)
 * Width: 288px (18rem) fixed, Claude-style spacing
 * Contains: Logo, Navigation items, User profile
 */
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
  const activeRecentChatId = pathname === '/workspace' ? searchParams.get('chat') : null;
  const palette = {
    sidebarBackground: '#FFFFFF',
    divider: '#E0E7E8',
    brandText: '#000000',
    toggleColor: '#6B7280',
    navText: '#000000',
    navActiveText: '#000000',
    navActiveBackground: '#F4F4F6',
    secondaryText: '#6B7280',
    menuBackground: '#FFFFFF',
    menuBorder: '#E0E7E8',
    menuText: '#000000',
    avatarBackground: '#E0E0E0',
    profileSecondaryText: '#5E5E5E',
    historyActiveBackground: '#F4F4F6',
  };

  const [recentChats, setRecentChats] = useState<ChatLibraryItem[]>([]);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const recentChatsRefreshIdRef = useRef(0);
  const historyChatMenuRef = useRef<HTMLDivElement>(null);
  const openChatMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const [historyFadeState, setHistoryFadeState] = useState({ top: false, bottom: false });
  const [pinnedExpanded, setPinnedExpanded] = useState(true);
  const [pinnedClosing, setPinnedClosing] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [historyClosing, setHistoryClosing] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);
  const [openChatMenuPosition, setOpenChatMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [chatBeingRenamed, setChatBeingRenamed] = useState<ChatLibraryItem | null>(null);
  const [chatBeingDeleted, setChatBeingDeleted] = useState<ChatLibraryItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenameSaving, setIsRenameSaving] = useState(false);
  const [isDeleteSaving, setIsDeleteSaving] = useState(false);
  const [renameFeedback, setRenameFeedback] = useState<{
    message: string;
    tone: 'error' | 'success';
  } | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const renameCloseTimeoutRef = useRef<number | null>(null);

  const closeChatMenu = useCallback(() => {
    openChatMenuTriggerRef.current = null;
    setOpenChatMenuId(null);
    setOpenChatMenuPosition(null);
  }, []);

  const clearRenameCloseTimeout = useCallback(() => {
    if (renameCloseTimeoutRef.current !== null) {
      window.clearTimeout(renameCloseTimeoutRef.current);
      renameCloseTimeoutRef.current = null;
    }
  }, []);

  const closeRenameDialog = useCallback(() => {
    clearRenameCloseTimeout();
    setChatBeingRenamed(null);
    setRenameValue('');
    setRenameFeedback(null);
    setIsRenameSaving(false);
  }, [clearRenameCloseTimeout]);

  const closeDeleteDialog = useCallback(() => {
    setChatBeingDeleted(null);
    setDeleteFeedback(null);
    setIsDeleteSaving(false);
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
    if (!el || collapsed) {
      setHistoryFadeState((prev) =>
        prev.top || prev.bottom ? { top: false, bottom: false } : prev
      );
      return;
    }

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

  useEffect(() => {
    if (!chatBeingRenamed) return;
    const input = renameInputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [chatBeingRenamed]);

  useEffect(() => {
    if (!chatBeingRenamed) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isRenameSaving) {
        closeRenameDialog();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [chatBeingRenamed, closeRenameDialog, isRenameSaving]);

  useEffect(() => {
    if (!chatBeingDeleted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleteSaving) {
        closeDeleteDialog();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [chatBeingDeleted, closeDeleteDialog, isDeleteSaving]);

  useEffect(
    () => () => {
      if (renameCloseTimeoutRef.current !== null) {
        window.clearTimeout(renameCloseTimeoutRef.current);
      }
    },
    []
  );

  const syncOpenChatMenuPosition = useCallback(() => {
    const trigger = openChatMenuTriggerRef.current;
    if (!trigger) {
      setOpenChatMenuPosition(null);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const preferredTop = rect.bottom + SIDEBAR_CHAT_MENU_GAP;
    const fallbackTop = rect.top - SIDEBAR_CHAT_MENU_ESTIMATED_HEIGHT - SIDEBAR_CHAT_MENU_GAP;
    const preferredLeft = rect.right - SIDEBAR_CHAT_MENU_WIDTH;
    const top =
      preferredTop + SIDEBAR_CHAT_MENU_ESTIMATED_HEIGHT <=
      availableHeight - SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN
        ? preferredTop
        : Math.max(SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN, fallbackTop);
    const left = Math.min(
      Math.max(SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN, preferredLeft),
      availableWidth - SIDEBAR_CHAT_MENU_WIDTH - SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN
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
    // Preserved: existing report error handler (wire here if needed)
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
  };

  const handleNewChatClick = useCallback(() => {
    if (pathname === '/' || pathname === '/workspace') {
      window.dispatchEvent(new CustomEvent(WORKSPACE_START_NEW_CHAT_EVENT));
      return;
    }

    router.push('/workspace');
  }, [pathname, router]);

  const handleRecentChatClick = useCallback(
    (chatId: string) => {
      closeChatMenu();

      if (pathname === '/workspace' && activeRecentChatId === chatId) {
        return;
      }

      router.push(`/workspace?chat=${encodeURIComponent(chatId)}`);
    },
    [activeRecentChatId, closeChatMenu, pathname, router]
  );

  const handleTogglePinned = useCallback(
    async (chat: ChatLibraryItem) => {
      const nextPinned = !chat.pinned;
      closeChatMenu();
      setRecentChats((prev) =>
        prev.map((item) => (item.id === chat.id ? { ...item, pinned: nextPinned } : item))
      );

      try {
        await updateChatLibraryItem(chat.id, {
          userId: DEFAULT_CHAT_USER_ID,
          pinned: nextPinned,
        });
      } catch {
        setRecentChats((prev) =>
          prev.map((item) => (item.id === chat.id ? { ...item, pinned: chat.pinned } : item))
        );
      }
    },
    [closeChatMenu]
  );

  const handleRenameStart = useCallback(
    (chat: ChatLibraryItem) => {
      closeChatMenu();
      clearRenameCloseTimeout();
      setChatBeingRenamed(chat);
      setRenameValue(chat.title);
      setIsRenameSaving(false);
      setRenameFeedback(null);
    },
    [clearRenameCloseTimeout, closeChatMenu]
  );

  const handleRenameClose = useCallback(() => {
    if (isRenameSaving) return;
    closeRenameDialog();
  }, [closeRenameDialog, isRenameSaving]);

  const handleRenameSave = useCallback(async () => {
    if (!chatBeingRenamed) return;

    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setRenameFeedback({ message: 'Введіть назву чату.', tone: 'error' });
      return;
    }

    if (nextTitle.length < SIDEBAR_CHAT_RENAME_MIN_LENGTH) {
      setRenameFeedback({
        message: `Мінімум ${SIDEBAR_CHAT_RENAME_MIN_LENGTH} символи.`,
        tone: 'error',
      });
      return;
    }

    if (nextTitle.length > SIDEBAR_CHAT_RENAME_MAX_LENGTH) {
      setRenameFeedback({
        message: `Максимум ${SIDEBAR_CHAT_RENAME_MAX_LENGTH} символів.`,
        tone: 'error',
      });
      return;
    }

    clearRenameCloseTimeout();
    setRenameFeedback(null);
    setIsRenameSaving(true);
    try {
      const updatedChat = await updateChatLibraryItem(chatBeingRenamed.id, {
        userId: DEFAULT_CHAT_USER_ID,
        title: nextTitle,
      });

      setRecentChats((prev) =>
        prev.map((item) =>
          item.id === updatedChat.id ? { ...item, title: updatedChat.title } : item
        )
      );
      setRenameFeedback({ message: 'Назву збережено.', tone: 'success' });
      renameCloseTimeoutRef.current = window.setTimeout(() => {
        closeRenameDialog();
      }, SIDEBAR_CHAT_RENAME_SUCCESS_CLOSE_DELAY_MS);
    } catch {
      setRenameFeedback({
        message: 'Не вдалося зберегти назву. Спробуйте ще раз.',
        tone: 'error',
      });
    } finally {
      setIsRenameSaving(false);
    }
  }, [chatBeingRenamed, clearRenameCloseTimeout, closeRenameDialog, renameValue]);

  const handleDeleteStart = useCallback(
    (chat: ChatLibraryItem) => {
      closeChatMenu();
      setChatBeingDeleted(chat);
      setDeleteFeedback(null);
      setIsDeleteSaving(false);
    },
    [closeChatMenu]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!chatBeingDeleted) return;

    setIsDeleteSaving(true);
    setDeleteFeedback(null);
    try {
      await deleteChatLibraryItem(chatBeingDeleted.id, DEFAULT_CHAT_USER_ID);
      setRecentChats((prev) => prev.filter((item) => item.id !== chatBeingDeleted.id));
      closeDeleteDialog();
      if (activeRecentChatId === chatBeingDeleted.id) {
        router.push('/workspace');
      }
    } catch {
      setDeleteFeedback('Не вдалося видалити чат. Спробуйте ще раз.');
    } finally {
      setIsDeleteSaving(false);
    }
  }, [activeRecentChatId, chatBeingDeleted, closeDeleteDialog, router]);

  const renameTrimmedLength = renameValue.trim().length;
  const renameValidationMessage =
    renameTrimmedLength === 0
      ? null
      : renameTrimmedLength < SIDEBAR_CHAT_RENAME_MIN_LENGTH
        ? `Мінімум ${SIDEBAR_CHAT_RENAME_MIN_LENGTH} символи.`
        : renameTrimmedLength > SIDEBAR_CHAT_RENAME_MAX_LENGTH
          ? `Максимум ${SIDEBAR_CHAT_RENAME_MAX_LENGTH} символів.`
          : null;
  const renameHelperMessage =
    renameFeedback?.tone === 'success'
      ? renameFeedback.message
      : (renameValidationMessage ??
        renameFeedback?.message ??
        `${SIDEBAR_CHAT_RENAME_MIN_LENGTH}-${SIDEBAR_CHAT_RENAME_MAX_LENGTH} символів`);
  const renameHelperColor =
    renameFeedback?.tone === 'success'
      ? '#1E8E5A'
      : renameValidationMessage || renameFeedback?.tone === 'error'
        ? '#C03A2B'
        : '#7A7A7A';
  const isRenameValid =
    renameTrimmedLength >= SIDEBAR_CHAT_RENAME_MIN_LENGTH &&
    renameTrimmedLength <= SIDEBAR_CHAT_RENAME_MAX_LENGTH;
  const isRenameSaveDisabled = isRenameSaving || !isRenameValid;
  const handleRenameInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!isRenameSaveDisabled) {
      void handleRenameSave();
    }
  };

  const sidebarChatRowHoverClassName =
    'relative isolate transform-gpu transition-[background-color,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.992] before:pointer-events-none before:absolute before:left-0 before:right-0 before:-top-[2px] before:-bottom-[2px] before:rounded-[8px] before:bg-transparent before:transition-colors before:duration-180 before:ease-[cubic-bezier(0.22,1,0.36,1)] before:-z-10 hover:before:bg-[#F4F4F6] first:before:top-0 last:before:bottom-0 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset';

  const renderSidebarChatRow = useCallback(
    (chat: ChatLibraryItem, showActions = false) => {
      const isActive = activeRecentChatId === chat.id;
      const isMenuOpen = openChatMenuId === chat.id;
      const showMenuButton = showActions && (hoveredChatId === chat.id || isMenuOpen);

      return (
        <div
          key={chat.id}
          ref={isMenuOpen ? historyChatMenuRef : null}
          role="button"
          tabIndex={0}
          className={`group ${sidebarChatRowHoverClassName}`}
          onMouseEnter={() => setHoveredChatId(chat.id)}
          onMouseLeave={() => setHoveredChatId((prev) => (prev === chat.id ? null : prev))}
          onFocus={() => setHoveredChatId(chat.id)}
          onBlur={() => setHoveredChatId((prev) => (prev === chat.id ? null : prev))}
          onClick={() => handleRecentChatClick(chat.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleRecentChatClick(chat.id);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '32px',
            padding: '6px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            backgroundColor: isActive ? palette.historyActiveBackground : 'transparent',
            position: 'relative',
            outline: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 0,
              minWidth: 0,
              flex: 1,
              transition: 'padding-right 180ms cubic-bezier(0.22, 1, 0.36, 1)',
              paddingRight: showMenuButton ? '34px' : '0px',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.14px',
                color: isActive ? palette.navActiveText : palette.navText,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {chat.title}
            </p>
          </div>
          {showActions ? (
            <div
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: showMenuButton ? 1 : 0,
                pointerEvents: showMenuButton ? 'auto' : 'none',
                transition: 'opacity 140ms ease',
                position: 'absolute',
                top: '50%',
                right: '12px',
                transform: 'translateY(-50%)',
                zIndex: 2,
              }}
            >
              <button
                type="button"
                aria-label="Налаштування чату"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const trigger = event.currentTarget;
                  if (openChatMenuId === chat.id) {
                    closeChatMenu();
                    return;
                  }

                  openChatMenuTriggerRef.current = trigger;
                  setOpenChatMenuId(chat.id);
                  const rect = trigger.getBoundingClientRect();
                  const preferredTop = rect.bottom + SIDEBAR_CHAT_MENU_GAP;
                  const fallbackTop =
                    rect.top - SIDEBAR_CHAT_MENU_ESTIMATED_HEIGHT - SIDEBAR_CHAT_MENU_GAP;
                  const preferredLeft = rect.right - SIDEBAR_CHAT_MENU_WIDTH;
                  const top =
                    preferredTop + SIDEBAR_CHAT_MENU_ESTIMATED_HEIGHT <=
                    window.innerHeight - SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN
                      ? preferredTop
                      : Math.max(SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN, fallbackTop);
                  const left = Math.min(
                    Math.max(SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN, preferredLeft),
                    window.innerWidth - SIDEBAR_CHAT_MENU_WIDTH - SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN
                  );
                  setOpenChatMenuPosition({ left, top });
                }}
                className="focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                style={{
                  width: '28px',
                  height: '28px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isMenuOpen ? palette.navActiveBackground : 'transparent',
                  color: isMenuOpen ? palette.navText : palette.secondaryText,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 3,
                }}
              >
                <SidebarChatMoreIcon />
              </button>
            </div>
          ) : null}
        </div>
      );
    },
    [
      activeRecentChatId,
      handleRecentChatClick,
      hoveredChatId,
      closeChatMenu,
      openChatMenuId,
      palette.navActiveBackground,
      palette.historyActiveBackground,
      palette.navActiveText,
      palette.navText,
      palette.secondaryText,
      sidebarChatRowHoverClassName,
    ]
  );

  const pinnedChats = recentChats.filter((chat) => chat.pinned);
  const historyChats = recentChats.filter((chat) => !chat.pinned);
  const openChatMenuChat =
    openChatMenuId == null
      ? null
      : (recentChats.find((chat) => chat.id === openChatMenuId) ?? null);
  const sidebarLabelStyle: React.CSSProperties = {
    overflow: 'hidden',
    minWidth: 0,
    maxWidth: collapsed ? '0px' : '160px',
    opacity: collapsed ? 0 : 1,
    whiteSpace: 'nowrap',
    transition: [
      `max-width ${WORKSPACE_SIDEBAR_TRANSITION}`,
      `opacity ${WORKSPACE_SIDEBAR_TRANSITION}`,
    ].join(', '),
  };

  const sidebarBrandStyle: React.CSSProperties = {
    overflow: 'hidden',
    minWidth: 0,
    maxWidth: collapsed ? '0px' : '120px',
    opacity: collapsed ? 0 : 1,
    whiteSpace: 'nowrap',
    transition: [
      `max-width ${WORKSPACE_SIDEBAR_TRANSITION}`,
      `opacity ${WORKSPACE_SIDEBAR_TRANSITION}`,
    ].join(', '),
  };

  const navButtonStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '32px',
    padding: `6px 16px 6px ${SIDEBAR_NAV_PADDING_LEFT}px`,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'transparent',
  };

  const stackedHoverFillClassName =
    'relative isolate transition-colors duration-150 before:pointer-events-none before:absolute before:left-0 before:right-0 before:-top-[2px] before:-bottom-[2px] before:rounded-[8px] before:bg-transparent before:transition-colors before:duration-150 before:-z-10 hover:before:bg-[#F4F4F6] first:before:top-0 last:before:bottom-0 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset';
  const navButtonHoverClassName =
    'transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset';

  const regularMenuItemClassName =
    'transition-colors duration-150 hover:bg-[#F4F4F6] active:bg-[#ECECF0] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset';
  const destructiveMenuItemClassName =
    'transition-colors duration-150 hover:bg-[#FFF3F3] active:bg-[#FFE8E8] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset';
  const menuItemClassName = regularMenuItemClassName;
  const chatMenuButtonBaseStyle: React.CSSProperties = {
    position: 'absolute',
    left: '7px',
    width: `${SIDEBAR_CHAT_MENU_WIDTH - 14}px`,
    height: '27px',
    padding: 0,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '17px',
    letterSpacing: '-0.01em',
  };
  const chatMenuLabelStyle: React.CSSProperties = {
    position: 'absolute',
    left: '31px',
    top: '5px',
    whiteSpace: 'nowrap',
  };

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${SIDEBAR_TOGGLE_TOP}px`,
    left: collapsed ? `${SIDEBAR_TOGGLE_COLLAPSED_LEFT}px` : `${SIDEBAR_TOGGLE_EXPANDED_LEFT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${SIDEBAR_TOGGLE_SIZE}px`,
    height: `${SIDEBAR_TOGGLE_SIZE}px`,
    padding: 0,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flexShrink: 0,
    color: palette.toggleColor,
    transition: [
      `left ${WORKSPACE_SIDEBAR_TRANSITION}`,
      'background-color 150ms',
      'color 150ms',
    ].join(', '),
  };

  const chatMenuPortal =
    typeof document !== 'undefined' && openChatMenuChat && openChatMenuPosition
      ? createPortal(
          <div
            ref={historyChatMenuRef}
            role="menu"
            aria-orientation="vertical"
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${openChatMenuPosition.top - 1}px`,
              left: `${openChatMenuPosition.left}px`,
              width: `${SIDEBAR_CHAT_MENU_WIDTH}px`,
              height: `${SIDEBAR_CHAT_MENU_ESTIMATED_HEIGHT}px`,
              zIndex: 120,
              borderRadius: '14px',
              border: `1px solid ${palette.menuBorder}`,
              background: palette.menuBackground,
              boxShadow: 'none',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void handleTogglePinned(openChatMenuChat);
              }}
              className={regularMenuItemClassName}
              style={{
                ...chatMenuButtonBaseStyle,
                top: '7px',
                color: palette.menuText,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '5px',
                  width: '15.656px',
                  height: '14.89px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SidebarChatStarIcon filled={openChatMenuChat.pinned} />
              </span>
              <span style={chatMenuLabelStyle}>
                {openChatMenuChat.pinned ? 'Відкріпити' : 'Закріпити'}
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleRenameStart(openChatMenuChat);
              }}
              className={regularMenuItemClassName}
              style={{
                ...chatMenuButtonBaseStyle,
                top: '35px',
                color: palette.menuText,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '9px',
                  top: '5px',
                  width: '14.965px',
                  height: '14.965px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SidebarChatPencilIcon />
              </span>
              <span style={chatMenuLabelStyle}>Перейменувати</span>
            </button>
            <div
              style={{
                position: 'absolute',
                left: '8px',
                top: '69px',
                width: '133px',
                height: '1px',
                backgroundColor: palette.menuBorder,
              }}
            />
            <button
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleDeleteStart(openChatMenuChat);
              }}
              className={destructiveMenuItemClassName}
              style={{
                ...chatMenuButtonBaseStyle,
                top: '76px',
                color: '#FF4747',
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '5px',
                  width: '13.468px',
                  height: '13.468px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SidebarChatTrashIcon />
              </span>
              <span style={chatMenuLabelStyle}>Видалити</span>
            </button>
          </div>,
          document.body
        )
      : null;

  const renameDialogPortal =
    typeof document !== 'undefined' && chatBeingRenamed
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sidebar-rename-chat-title"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 130,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              boxSizing: 'border-box',
            }}
            onClick={handleRenameClose}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                ...SIDEBAR_DIALOG_OVERLAY_STYLE,
              }}
              aria-hidden
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '520px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #F1F1F1',
                borderRadius: '26px',
                padding: '24px',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="sidebar-rename-chat-title"
                style={{
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  lineHeight: '1.2',
                  color: '#2A2A2A',
                }}
              >
                Перейменувати чат
              </h2>
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(event) => {
                  setRenameValue(event.target.value);
                  if (renameFeedback?.tone === 'error') {
                    setRenameFeedback(null);
                  }
                }}
                onKeyDown={handleRenameInputKeyDown}
                placeholder="Введіть нову назву чату..."
                style={{
                  width: '100%',
                  height: '46px',
                  boxSizing: 'border-box',
                  marginTop: '16px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  border: '1px solid #D7D7D7',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '46px',
                  color: '#2A2A2A',
                  outline: 'none',
                }}
                aria-label="Нова назва чату"
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '8px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '1.4',
                    color: renameHelperColor,
                  }}
                >
                  {renameHelperMessage}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '1.4',
                    color:
                      renameTrimmedLength > SIDEBAR_CHAT_RENAME_MAX_LENGTH ? '#C03A2B' : '#9A9A9A',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {renameTrimmedLength}/{SIDEBAR_CHAT_RENAME_MAX_LENGTH}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  onClick={handleRenameClose}
                  disabled={isRenameSaving}
                  style={{
                    minWidth: '102px',
                    height: '42px',
                    borderRadius: '8px',
                    border: '1px solid #D7D7D7',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#2A2A2A',
                    cursor: isRenameSaving ? 'default' : 'pointer',
                  }}
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={() => void handleRenameSave()}
                  disabled={isRenameSaveDisabled}
                  style={{
                    minWidth: '124px',
                    height: '42px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isRenameSaveDisabled ? '#8A8A8A' : '#2A2A2A',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    cursor: isRenameSaveDisabled ? 'default' : 'pointer',
                  }}
                >
                  {isRenameSaving
                    ? 'Збереження...'
                    : renameFeedback?.tone === 'success'
                      ? 'Збережено'
                      : 'Застосувати'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const deleteDialogPortal =
    typeof document !== 'undefined' && chatBeingDeleted
      ? createPortal(
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sidebar-delete-chat-title"
            aria-describedby="sidebar-delete-chat-description"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 135,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              boxSizing: 'border-box',
            }}
            onClick={() => {
              if (!isDeleteSaving) closeDeleteDialog();
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                ...SIDEBAR_DIALOG_OVERLAY_STYLE,
              }}
              aria-hidden
            />
            <div
              style={{
                position: 'relative',
                width: `min(${SIDEBAR_DELETE_CHAT_CONFIRM_WIDTH}px, 100%)`,
                minHeight: '152px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D9D9D9',
                borderRadius: `${SIDEBAR_DELETE_CHAT_CONFIRM_RADIUS}px`,
                padding: '28px 24px 22px',
                boxSizing: 'border-box',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="sidebar-delete-chat-title"
                style={{
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '22px',
                  letterSpacing: '0',
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                Видалити чат - ви впевнені?
              </h2>
              <p
                id="sidebar-delete-chat-description"
                style={{
                  margin: '6px 0 0',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '17px',
                  letterSpacing: '0',
                  color: 'rgba(0, 0, 0, 0.4)',
                  textAlign: 'center',
                }}
              >
                Ви дійсно хочете видалити чат{' '}
                <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                  &quot;{chatBeingDeleted.title}&quot;
                </span>
                ?
              </p>
              {deleteFeedback ? (
                <p
                  style={{
                    margin: '8px 0 0',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '17px',
                    color: '#E14D4D',
                    textAlign: 'center',
                  }}
                >
                  {deleteFeedback}
                </p>
              ) : null}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: deleteFeedback ? '12px' : '15px',
                }}
              >
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={isDeleteSaving}
                  style={{
                    height: `${SIDEBAR_DELETE_CHAT_CONFIRM_BUTTON_HEIGHT}px`,
                    padding: '0 26px',
                    borderRadius: '999px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '21px',
                    color: '#000000',
                    cursor: isDeleteSaving ? 'default' : 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteConfirm()}
                  disabled={isDeleteSaving}
                  className={isDeleteSaving ? 'bg-white' : 'bg-white hover:bg-[#FFF0F0]'}
                  style={{
                    height: `${SIDEBAR_DELETE_CHAT_CONFIRM_BUTTON_HEIGHT}px`,
                    padding: '0 26px',
                    borderRadius: '999px',
                    border: isDeleteSaving ? '1px solid #F4CACA' : '1px solid #F19A9A',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: isDeleteSaving ? '#F2A4A4' : '#F25555',
                    cursor: isDeleteSaving ? 'default' : 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  {isDeleteSaving ? 'Видалення...' : 'Видалити'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <aside
        className={className}
        data-sidebar
        data-collapsed={collapsed ? 'true' : 'false'}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: collapsed
            ? `${WORKSPACE_SIDEBAR_COLLAPSED_WIDTH}px`
            : `${WORKSPACE_SIDEBAR_EXPANDED_WIDTH}px`,
          height: '100vh',
          background: palette.sidebarBackground,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${palette.divider}`,
          zIndex: overlayActive ? 80 : 40,
          boxShadow: overlayActive ? '0 24px 48px rgba(15, 23, 42, 0.18)' : 'none',
          transition: `width ${WORKSPACE_SIDEBAR_TRANSITION}`,
        }}
      >
        {/* Фіксовано зверху: лого + Новий чат, Пошук, Чати, Проєкти */}
        <div
          style={{
            flexShrink: 0,
            padding: `${SIDEBAR_EDGE_PADDING}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${SIDEBAR_BRAND_SECTION_GAP}px`,
          }}
        >
          {/* Верхній ряд: лого зліва, іконка split-panel справа (Figma 22:5) */}
          <div
            style={{
              position: 'relative',
              height: '42px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: `${SIDEBAR_TOGGLE_SIZE}px`,
                minWidth: 0,
                paddingTop: '10px',
                paddingLeft: '12px',
                paddingRight: '44px',
              }}
            >
              <div style={sidebarBrandStyle} aria-hidden={collapsed}>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '20px',
                    letterSpacing: '0.02em',
                    color: palette.brandText,
                    margin: 0,
                  }}
                >
                  LEXERY
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              data-sidebar-toggle
              aria-label={collapsed ? 'Розгорнути sidebar' : 'Згорнути sidebar'}
              aria-expanded={!collapsed}
              className="transition-[background-color,color] duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
              style={toggleButtonStyle}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', flexShrink: 0 }}
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${SIDEBAR_STACK_GAP}px`,
              marginTop: `${SIDEBAR_PRIMARY_NAV_OFFSET}px`,
            }}
          >
            {/* Новий чат — Claude: h-8 py-1.5 px-4 rounded-lg gap-3 */}
            <button
              type="button"
              onClick={handleNewChatClick}
              aria-label="Новий чат"
              className={`group ${stackedHoverFillClassName}`}
              style={{ ...navButtonStyle, color: palette.navText }}
            >
              <span
                className="inline-flex items-center gap-3 transition-transform duration-100 group-active:scale-[0.98]"
                style={{
                  gap: '12px',
                  minWidth: 0,
                }}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="14 14 150 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: 'block', flexShrink: 0 }}
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
                <span style={sidebarLabelStyle} aria-hidden={collapsed}>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0.14px',
                      color: palette.navText,
                      margin: 0,
                    }}
                  >
                    Новий чат
                  </p>
                </span>
              </span>
            </button>

            {/* Пошук — overlay-меню поверх поточного екрана */}
            <button
              type="button"
              onClick={toggleSearchOpen}
              aria-label="Пошук"
              className={`group ${navButtonHoverClassName}`}
              aria-expanded={isSearchOpen}
              style={{
                ...navButtonStyle,
                color: isSearchOpen ? palette.navActiveText : palette.navText,
                backgroundColor: isSearchOpen ? palette.navActiveBackground : undefined,
              }}
            >
              <span
                className="inline-flex items-center gap-3 transition-transform duration-100 group-active:scale-[0.98]"
                style={{
                  gap: '12px',
                  minWidth: 0,
                }}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="1.88764 1.88764 20.22472 20.22472"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: 'block', flexShrink: 0 }}
                  aria-hidden
                >
                  <path
                    d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                    stroke="currentColor"
                    strokeWidth="1.68539"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={sidebarLabelStyle} aria-hidden={collapsed}>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0.14px',
                      color: isSearchOpen ? palette.navActiveText : palette.navText,
                      margin: 0,
                    }}
                  >
                    Пошук
                  </p>
                </span>
              </span>
            </button>

            {/* Проєкти — Figma 62:11 */}
            <button
              type="button"
              disabled
              aria-label="Проєкти"
              aria-disabled="true"
              style={{
                ...navButtonStyle,
                color: palette.secondaryText,
                cursor: 'default',
              }}
            >
              <svg
                width={18}
                height={18}
                viewBox="22.25 22.25 133.5 133.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', flexShrink: 0 }}
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
              <span style={sidebarLabelStyle} aria-hidden={collapsed}>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0.14px',
                    color: palette.secondaryText,
                    margin: 0,
                  }}
                >
                  Проєкти
                </p>
              </span>
            </button>
          </div>
        </div>

        {/* Прокручується тільки Історія — список чатів (прокрутка тільки коли розгорнуто) */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? 'none' : 'auto',
            transition: `opacity ${WORKSPACE_SIDEBAR_TRANSITION}`,
          }}
        >
          <div
            ref={historyScrollRef}
            onScroll={handleHistoryScroll}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: pinnedExpanded || historyExpanded ? 'auto' : 'hidden',
              overflowX: 'hidden',
              padding: `${SIDEBAR_HISTORY_SECTION_GAP}px ${SIDEBAR_EDGE_PADDING}px ${SIDEBAR_EDGE_PADDING}px`,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {/* Історія — кнопка + список останніх чатів */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${SIDEBAR_STACK_GAP}px`,
                marginTop: 0,
              }}
            >
              {pinnedChats.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (pinnedExpanded) {
                        setPinnedClosing(true);
                        setTimeout(() => {
                          setPinnedExpanded(false);
                          setPinnedClosing(false);
                        }, 220);
                      } else {
                        setPinnedExpanded(true);
                      }
                    }}
                    className="focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      height: '32px',
                      padding: '6px 16px 6px 12px',
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
                        color: pinnedExpanded ? palette.secondaryText : palette.navText,
                        transition: 'color 0.22s ease-out',
                      }}
                    >
                      Закріплені
                    </p>
                  </button>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: pinnedExpanded ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0s',
                    }}
                  >
                    <div
                      style={{
                        minHeight: 0,
                        overflow: 'hidden',
                        opacity: pinnedExpanded && !pinnedClosing ? 1 : 0,
                        transform:
                          pinnedExpanded && !pinnedClosing ? 'translateY(0)' : 'translateY(-10px)',
                        transition: pinnedClosing
                          ? 'opacity 0.18s cubic-bezier(0.33, 1, 0.68, 1), transform 0.2s cubic-bezier(0.34, 1.15, 0.64, 1)'
                          : 'opacity 0.28s cubic-bezier(0.33, 1, 0.68, 1), transform 0.32s cubic-bezier(0.34, 1.15, 0.64, 1)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: `${SIDEBAR_STACK_GAP}px`,
                          paddingTop: 0,
                        }}
                      >
                        {pinnedChats.map((chat) => renderSidebarChatRow(chat, true))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (historyExpanded) {
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
                  height: '32px',
                  padding: '6px 16px 6px 12px',
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
                    color: historyExpanded ? palette.secondaryText : palette.navText,
                    transition: 'color 0.22s ease-out',
                  }}
                >
                  Історія
                </p>
              </button>
              {historyChats.length > 0 ? (
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
                        gap: `${SIDEBAR_STACK_GAP}px`,
                        paddingTop: 0,
                      }}
                    >
                      {historyChats.map((chat) => renderSidebarChatRow(chat, true))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${SIDEBAR_HISTORY_FADE_HEIGHT}px`,
              background: historyFadeState.top
                ? `linear-gradient(180deg, ${palette.sidebarBackground} 0%, ${palette.sidebarBackground} 58%, rgba(255, 255, 255, 0) 100%)`
                : 'transparent',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${SIDEBAR_HISTORY_FADE_HEIGHT}px`,
              background: historyFadeState.bottom
                ? `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, ${palette.sidebarBackground} 42%, ${palette.sidebarBackground} 100%)`
                : 'transparent',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>

        {/* Bottom Section - Profile — завжди внизу */}
        <div
          style={{
            flexShrink: 0,
            paddingBottom: '12px',
            paddingLeft: `${SIDEBAR_PROFILE_SECTION_PADDING_X}px`,
            paddingRight: `${SIDEBAR_PROFILE_SECTION_PADDING_X}px`,
            zIndex: 30,
          }}
        >
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
                  bottom: collapsed ? '0' : 'calc(100% + 8px)',
                  left: collapsed ? 'calc(100% + 8px)' : '-6px',
                  right: collapsed ? 'auto' : '-6px',
                  width: collapsed ? '220px' : 'auto',
                  zIndex: 100,
                  backgroundColor: palette.menuBackground,
                  border: `1px solid ${palette.menuBorder}`,
                  padding: '6px',
                }}
              >
                {/* Menu items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSettingsClick}
                    className={menuItemClassName}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      minHeight: '32px',
                      padding: '6px 8px',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: palette.menuText,
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
                        color: palette.menuText,
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
                    className={menuItemClassName}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      minHeight: '32px',
                      padding: '6px 8px',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: palette.menuText,
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
                        color: palette.menuText,
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
                    backgroundColor: palette.divider,
                    margin: '6px 0',
                  }}
                  aria-hidden
                />

                {/* Вийти */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogoutClick}
                  className={menuItemClassName}
                  style={{
                    display: 'flex',
                    width: '100%',
                    gap: '8px',
                    alignItems: 'center',
                    minHeight: '32px',
                    padding: '6px 8px',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: palette.menuText,
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
                      color: palette.menuText,
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
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: '8px',
                minWidth: 0,
                flex: '1 1 0',
                width: '100%',
                padding: `0 0 0 ${SIDEBAR_PROFILE_PADDING_LEFT}px`,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: `${SIDEBAR_PROFILE_AVATAR_SIZE}px`,
                  height: `${SIDEBAR_PROFILE_AVATAR_SIZE}px`,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: palette.avatarBackground,
                }}
              >
                <Image
                  src="/images/workspace/avatar.png"
                  alt="Profile image"
                  width={SIDEBAR_PROFILE_AVATAR_SIZE}
                  height={SIDEBAR_PROFILE_AVATAR_SIZE}
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  ...sidebarLabelStyle,
                  flex: collapsed ? '0 0 auto' : '1 1 0',
                  maxWidth: collapsed ? '0px' : 'none',
                }}
                aria-hidden={collapsed}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    minWidth: 0,
                    minHeight: `${SIDEBAR_PROFILE_AVATAR_SIZE}px`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0.14px',
                      color: palette.navText,
                      minWidth: 0,
                      flex: 1,
                      minHeight: '100%',
                    }}
                  >
                    Олександр
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: `${SIDEBAR_PROFILE_AVATAR_SIZE}px`,
                      padding: '0 12px',
                      borderRadius: '999px',
                      border: '1px solid #E5E5E5',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '16px',
                      letterSpacing: '0.12px',
                      color: palette.profileSecondaryText,
                      boxSizing: 'border-box',
                    }}
                  >
                    Free
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>
      {chatMenuPortal}
      {renameDialogPortal}
      {deleteDialogPortal}
    </>
  );
}

export default WorkspaceSidebar;
