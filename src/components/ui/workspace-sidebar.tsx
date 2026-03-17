'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import { useSearchOpen } from '@/contexts/search-open';
import { useSettingsOpen } from '@/contexts/settings-open';
import { WORKSPACE_START_NEW_CHAT_EVENT } from '@/hooks/use-workspace-chat';

import { EditSquareIcon } from '@/components/ui/edit-square-icon';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  deleteChatLibraryItem,
  dispatchChatStoreUpdated,
  fetchChatLibrary,
  type ChatLibraryItem,
  updateChatLibraryItem,
} from '@/lib/chat-library';

interface WorkspaceSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const WORKSPACE_SIDEBAR_EXPANDED_WIDTH = 250;
export const WORKSPACE_SIDEBAR_COLLAPSED_WIDTH = 56;
export const WORKSPACE_SIDEBAR_TRANSITION = '220ms cubic-bezier(0.4, 0, 0.2, 1)';

const SIDEBAR_EDGE_PADDING = 8;
const SIDEBAR_STACK_GAP = 2;
const SIDEBAR_BRAND_SECTION_GAP = 9;
const SIDEBAR_HISTORY_SECTION_GAP = 6;
const SIDEBAR_PRIMARY_NAV_OFFSET = 5;
const SIDEBAR_NAV_ICON_SIZE = 18;
const SIDEBAR_TOGGLE_SIZE = 32;
const SIDEBAR_TOGGLE_TOP = 5;
const SIDEBAR_PROFILE_SECTION_PADDING_X = 12;
const SIDEBAR_PROFILE_AVATAR_SIZE = 24;
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
const SIDEBAR_CHAT_MENU_WIDTH = 176;
const SIDEBAR_CHAT_MENU_ESTIMATED_HEIGHT = 132;
const SIDEBAR_CHAT_MENU_GAP = 4;
const SIDEBAR_CHAT_MENU_VIEWPORT_MARGIN = 12;
const SIDEBAR_DELETE_CHAT_CONFIRM_WIDTH = 560;
const SIDEBAR_DELETE_CHAT_CONFIRM_RADIUS = 24;
const SIDEBAR_DELETE_CHAT_CONFIRM_BUTTON_HEIGHT = 42;

function SidebarChatMoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="4" cy="10" r="1.8" fill="currentColor" />
      <circle cx="10" cy="10" r="1.8" fill="currentColor" />
      <circle cx="16" cy="10" r="1.8" fill="currentColor" />
    </svg>
  );
}

function SidebarChatStarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      <path
        d="M10.0129 2.1438L12.2647 6.59517C12.3809 6.82488 12.6016 6.98469 12.8561 7.02054L17.7091 7.70431C18.3501 7.79462 18.6072 8.58274 18.1428 9.02336L14.6294 12.3572C14.4452 12.5319 14.3619 12.7883 14.4068 13.0379L15.2616 17.7803C15.3753 18.4108 14.7011 18.8923 14.1311 18.6L9.79783 16.3777C9.57029 16.261 9.30042 16.2612 9.07306 16.3783L4.74611 18.6074C4.17651 18.9008 3.50146 18.4205 3.61403 17.7898L4.46077 13.0459C4.50525 12.7962 4.42156 12.5401 4.23709 12.3658L0.718081 9.03777C0.252893 8.59791 0.508772 7.80937 1.14959 7.71804L6.00139 7.02679C6.25589 6.99057 6.47633 6.83044 6.59217 6.60056L8.83734 2.14567C9.1337 1.55735 9.71571 1.55659 10.0129 2.1438Z"
        stroke="currentColor"
        strokeWidth="1.72"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function SidebarChatPencilIcon() {
  return (
    <EditSquareIcon
      size={18}
      color="currentColor"
      strokeWidth={13.5}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
}

function SidebarChatTrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 20"
      fill="none"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M2.82051 4.87179V17.1795C2.82051 18.3124 3.7389 19.2308 4.8718 19.2308H13.0769C14.2098 19.2308 15.1282 18.3124 15.1282 17.1795V4.87179"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.769231 4.87179H17.1795"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.84615 4.87179L5.89744 0.769231H12.0513L14.1026 4.87179"
        stroke="currentColor"
        strokeWidth="1.55"
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
}: WorkspaceSidebarProps) {
  const { open: openSettings } = useSettingsOpen();
  const { isOpen: isSearchOpen, toggle: toggleSearchOpen } = useSearchOpen();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRecentChatId = pathname === '/workspace' ? searchParams.get('chat') : null;
  const hasSelectedWorkspaceChat = activeRecentChatId != null;
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
  const [historyScrolled, setHistoryScrolled] = useState(false);
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
    window.addEventListener(CHAT_STORE_UPDATED_EVENT, onUpdate);
    return () => {
      recentChatsRefreshIdRef.current += 1;
      window.removeEventListener(CHAT_STORE_UPDATED_EVENT, onUpdate);
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
    // TODO: wire logout (e.g. clear session, redirect)
  };

  const handleNewChatClick = useCallback(() => {
    if (pathname === '/' || pathname === '/workspace') {
      if (pathname === '/workspace' && hasSelectedWorkspaceChat) {
        router.push('/workspace');
        return;
      }

      window.dispatchEvent(new CustomEvent(WORKSPACE_START_NEW_CHAT_EVENT));
      return;
    }

    router.push('/workspace');
  }, [hasSelectedWorkspaceChat, pathname, router]);

  const handleRecentChatClick = useCallback(
    (chatId: string) => {
      closeChatMenu();
      router.push(`/workspace?chat=${encodeURIComponent(chatId)}`);
    },
    [closeChatMenu, router]
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
        dispatchChatStoreUpdated();
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
      dispatchChatStoreUpdated();
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
      dispatchChatStoreUpdated();
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
    'relative isolate transition-colors duration-150 before:pointer-events-none before:absolute before:left-0 before:right-0 before:-top-[2px] before:-bottom-[2px] before:rounded-[8px] before:bg-transparent before:transition-colors before:duration-150 before:-z-10 hover:before:bg-[#F4F4F6] first:before:top-0 last:before:bottom-0 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset';

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
          className={sidebarChatRowHoverClassName}
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
          title={chat.title}
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
              flex: 1,
              paddingRight: showMenuButton ? '34px' : '0px',
              transition: 'padding-right 140ms ease',
            }}
          >
            {chat.title}
          </p>
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
  const shouldShowScrollDivider =
    !collapsed && historyScrolled && (pinnedExpanded || historyExpanded);

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

  const menuItemClassName =
    'w-full rounded-lg transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset';

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
              top: `${openChatMenuPosition.top}px`,
              left: `${openChatMenuPosition.left}px`,
              width: `${SIDEBAR_CHAT_MENU_WIDTH}px`,
              zIndex: 120,
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              borderRadius: '16px',
              border: `1px solid ${palette.menuBorder}`,
              background: palette.menuBackground,
              boxShadow: 'none',
              padding: '8px',
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
              className={menuItemClassName}
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '0 7px',
                border: 'none',
                borderRadius: '10px',
                color: palette.menuText,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                lineHeight: '18px',
              }}
            >
              <SidebarChatStarIcon filled={openChatMenuChat.pinned} />
              <span>{openChatMenuChat.pinned ? 'Відкріпити' : 'Закріпити'}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleRenameStart(openChatMenuChat);
              }}
              className={menuItemClassName}
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '0 7px',
                border: 'none',
                borderRadius: '10px',
                color: palette.menuText,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                lineHeight: '18px',
              }}
            >
              <SidebarChatPencilIcon />
              <span>Перейменувати</span>
            </button>
            <div
              style={{
                height: '1px',
                margin: '6px 0',
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
              className={menuItemClassName}
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '0 7px',
                border: 'none',
                borderRadius: '10px',
                color: '#FF4747',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                lineHeight: '18px',
              }}
            >
              <SidebarChatTrashIcon />
              <span>Видалити</span>
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
                backgroundColor: 'rgba(0, 0, 0, 0.32)',
                backdropFilter: 'blur(4px)',
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
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
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
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
                backdropFilter: 'blur(4px)',
              }}
              aria-hidden
            />
            <div
              style={{
                position: 'relative',
                width: `min(${SIDEBAR_DELETE_CHAT_CONFIRM_WIDTH}px, 100%)`,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E7E7E7',
                borderRadius: `${SIDEBAR_DELETE_CHAT_CONFIRM_RADIUS}px`,
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="sidebar-delete-chat-title"
                style={{
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  lineHeight: '1.2',
                  color: '#2A2A2A',
                }}
              >
                Видалити чат
              </h2>
              <p
                id="sidebar-delete-chat-description"
                style={{
                  margin: '10px 0 0',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#5F6368',
                }}
              >
                Ви дійсно хочете видалити чат{' '}
                <span style={{ color: '#2A2A2A', fontWeight: 500 }}>
                  &quot;{chatBeingDeleted.title}&quot;
                </span>
                ?
              </p>
              {deleteFeedback ? (
                <p
                  style={{
                    margin: '10px 0 0',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '1.4',
                    color: '#C03A2B',
                  }}
                >
                  {deleteFeedback}
                </p>
              ) : null}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '18px',
                }}
              >
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={isDeleteSaving}
                  style={{
                    minWidth: '102px',
                    height: `${SIDEBAR_DELETE_CHAT_CONFIRM_BUTTON_HEIGHT}px`,
                    borderRadius: '8px',
                    border: '1px solid #D7D7D7',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#2A2A2A',
                    cursor: isDeleteSaving ? 'default' : 'pointer',
                  }}
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteConfirm()}
                  disabled={isDeleteSaving}
                  style={{
                    minWidth: '128px',
                    height: `${SIDEBAR_DELETE_CHAT_CONFIRM_BUTTON_HEIGHT}px`,
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isDeleteSaving ? '#F19999' : '#E14D4D',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    cursor: isDeleteSaving ? 'default' : 'pointer',
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
              title="Новий чат"
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
              title="Пошук"
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
              aria-label="Проєкти"
              className={stackedHoverFillClassName}
              title="Проєкти"
              style={{ ...navButtonStyle, color: palette.navText }}
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
                    color: palette.navText,
                    margin: 0,
                  }}
                >
                  Проєкти
                </p>
              </span>
            </button>
          </div>
        </div>

        {/* Лінія над історією — з’являється при прокрутці, тільки коли історія розгорнута */}
        {shouldShowScrollDivider && (
          <div
            style={{
              flexShrink: 0,
              paddingLeft: `${SIDEBAR_EDGE_PADDING}px`,
              paddingRight: `${SIDEBAR_EDGE_PADDING}px`,
            }}
          >
            <div
              style={{
                height: '1px',
                backgroundColor: palette.divider,
                marginLeft: '-8px',
                marginRight: '-8px',
              }}
            />
          </div>
        )}

        {/* Прокручується тільки Історія — список чатів (прокрутка тільки коли розгорнуто) */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
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
                        setHistoryScrolled(false);
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
        </div>

        {/* Bottom Section - Profile — завжди внизу, під лінією */}
        <div
          style={{
            flexShrink: 0,
            paddingBottom: '14px',
            paddingLeft: `${SIDEBAR_PROFILE_SECTION_PADDING_X}px`,
            paddingRight: `${SIDEBAR_PROFILE_SECTION_PADDING_X}px`,
            zIndex: 30,
          }}
        >
          {/* Horizontal line — відстань від лінії до елементів = відстань від низу */}
          <div
            style={{
              height: '1px',
              backgroundColor: palette.divider,
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
                    gap: '8px',
                    alignItems: 'center',
                    minHeight: '32px',
                    padding: '6px 8px',
                    border: 'none',
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
                alignItems: 'center',
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
                }}
                aria-hidden={collapsed}
              >
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
                    color: palette.navText,
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
                    color: palette.profileSecondaryText,
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
      {chatMenuPortal}
      {renameDialogPortal}
      {deleteDialogPortal}
    </>
  );
}

export default WorkspaceSidebar;
