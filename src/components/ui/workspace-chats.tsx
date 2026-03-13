'use client';

import { useRouter } from 'next/navigation';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import { EditSquareIcon } from '@/components/ui/edit-square-icon';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  deleteChatLibraryItem,
  dispatchChatStoreUpdated,
  fetchChatLibrary,
  formatLastMessageLabel,
  getChatSearchText,
  type ChatLibraryItem,
  updateChatLibraryItem,
} from '@/lib/chat-library';

const UI_SCALE = 0.66;

function scale(value: number): number {
  return Math.max(1, Math.round(value * UI_SCALE));
}

function readableScale(value: number, minimum: number): number {
  return Math.max(minimum, scale(value));
}

function SearchIcon() {
  return (
    <svg
      width={scale(24)}
      height={scale(24)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M14.5 5.5L5.5 14.5M5.5 5.5l9 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACTION_ICON_STROKE = 1.75;
const ACTION_ICON_BOX_SIZE = 24;
const RENAME_CHAT_TITLE_MIN_LENGTH = 2;
const RENAME_CHAT_TITLE_MAX_LENGTH = 60;
const RENAME_SUCCESS_CLOSE_DELAY_MS = 250;
const DELETE_CHAT_CONFIRM_WIDTH = 560;
const DELETE_CHAT_CONFIRM_RADIUS = 24;
const DELETE_CHAT_CONFIRM_BUTTON_HEIGHT = 42;

function ChatActionButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.();
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleActionClick}
      style={{
        width: `${scale(34)}px`,
        height: `${scale(34)}px`,
        minWidth: `${scale(34)}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: `${scale(10)}px`,
        backgroundColor: 'transparent',
        color: isActive ? '#171717' : '#6B7280',
        cursor: 'pointer',
        transition: 'color 140ms ease',
      }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      {children}
    </button>
  );
}

function ChatStarIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      width={scale(28)}
      height={scale(28)}
      viewBox="-1 -1 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      {active ? (
        <path
          d="M10.0129 2.1438L12.2647 6.59517C12.3809 6.82488 12.6016 6.98469 12.8561 7.02054L17.7091 7.70431C18.3501 7.79462 18.6072 8.58274 18.1428 9.02336L14.6294 12.3572C14.4452 12.5319 14.3619 12.7883 14.4068 13.0379L15.2616 17.7803C15.3753 18.4108 14.7011 18.8923 14.1311 18.6L9.79783 16.3777C9.57029 16.261 9.30042 16.2612 9.07306 16.3783L4.74611 18.6074C4.17651 18.9008 3.50146 18.4205 3.61403 17.7898L4.46077 13.0459C4.50525 12.7962 4.42156 12.5401 4.23709 12.3658L0.718081 9.03777C0.252893 8.59791 0.508772 7.80937 1.14959 7.71804L6.00139 7.02679C6.25589 6.99057 6.47633 6.83044 6.59217 6.60056L8.83734 2.14567C9.1337 1.55735 9.71571 1.55659 10.0129 2.1438Z"
          fill="currentColor"
        />
      ) : null}
      <path
        d="M10.0129 2.1438L12.2647 6.59517C12.3809 6.82488 12.6016 6.98469 12.8561 7.02054L17.7091 7.70431C18.3501 7.79462 18.6072 8.58274 18.1428 9.02336L14.6294 12.3572C14.4452 12.5319 14.3619 12.7883 14.4068 13.0379L15.2616 17.7803C15.3753 18.4108 14.7011 18.8923 14.1311 18.6L9.79783 16.3777C9.57029 16.261 9.30042 16.2612 9.07306 16.3783L4.74611 18.6074C4.17651 18.9008 3.50146 18.4205 3.61403 17.7898L4.46077 13.0459C4.50525 12.7962 4.42156 12.5401 4.23709 12.3658L0.718081 9.03777C0.252893 8.59791 0.508772 7.80937 1.14959 7.71804L6.00139 7.02679C6.25589 6.99057 6.47633 6.83044 6.59217 6.60056L8.83734 2.14567C9.1337 1.55735 9.71571 1.55659 10.0129 2.1438Z"
        stroke="currentColor"
        strokeWidth={ACTION_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatPencilIcon() {
  return (
    <EditSquareIcon
      size={scale(ACTION_ICON_BOX_SIZE)}
      strokeWidth={14.2}
      style={{ display: 'block' }}
    />
  );
}

function ChatTrashIcon() {
  return (
    <svg
      width={scale(22)}
      height={scale(ACTION_ICON_BOX_SIZE)}
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      <path
        d="M2.82051 4.87179V17.1795C2.82051 18.3124 3.7389 19.2308 4.8718 19.2308H13.0769C14.2098 19.2308 15.1282 18.3124 15.1282 17.1795V4.87179"
        stroke="currentColor"
        strokeWidth={ACTION_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.769231 4.87179H17.1795"
        stroke="currentColor"
        strokeWidth={ACTION_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.84615 4.87179L5.89744 0.769231H12.0513L14.1026 4.87179"
        stroke="currentColor"
        strokeWidth={ACTION_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WorkspaceChats() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatLibrary, setChatLibrary] = useState<ChatLibraryItem[]>([]);
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
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const renameCloseTimeoutRef = useRef<number | null>(null);

  const secondaryTextStyle: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: `${readableScale(13, 13)}px`,
    lineHeight: `${readableScale(20, 20)}px`,
    letterSpacing: '0.14px',
    color: '#6B7280',
  };

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const chats = await fetchChatLibrary(DEFAULT_CHAT_USER_ID);
        if (!cancelled) setChatLibrary(chats);
      } catch {
        if (!cancelled) setChatLibrary([]);
      }
    };

    refresh();
    window.addEventListener(CHAT_STORE_UPDATED_EVENT, refresh);

    return () => {
      cancelled = true;
      window.removeEventListener(CHAT_STORE_UPDATED_EVENT, refresh);
    };
  }, []);

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
        setChatBeingRenamed(null);
        setRenameValue('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [chatBeingRenamed, isRenameSaving]);

  useEffect(() => {
    if (!chatBeingDeleted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleteSaving) {
        setChatBeingDeleted(null);
        setDeleteFeedback(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [chatBeingDeleted, isDeleteSaving]);

  useEffect(
    () => () => {
      if (renameCloseTimeoutRef.current !== null) {
        window.clearTimeout(renameCloseTimeoutRef.current);
      }
    },
    []
  );

  const filteredChats = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return chatLibrary;

    return chatLibrary.filter((chat) => getChatSearchText(chat).includes(normalizedQuery));
  }, [chatLibrary, deferredSearchQuery]);
  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const regularChats = filteredChats.filter((chat) => !chat.pinned);

  const openChat = (chatId: string) => {
    router.push(`/workspace?chat=${encodeURIComponent(chatId)}`);
  };

  const clearRenameCloseTimeout = () => {
    if (renameCloseTimeoutRef.current !== null) {
      window.clearTimeout(renameCloseTimeoutRef.current);
      renameCloseTimeoutRef.current = null;
    }
  };

  const closeRenameDialog = () => {
    clearRenameCloseTimeout();
    setChatBeingRenamed(null);
    setRenameValue('');
    setRenameFeedback(null);
  };

  const closeDeleteDialog = () => {
    setChatBeingDeleted(null);
    setDeleteFeedback(null);
  };

  const handleTogglePinned = async (chat: ChatLibraryItem) => {
    const nextPinned = !chat.pinned;

    setChatLibrary((prev) =>
      prev.map((item) => (item.id === chat.id ? { ...item, pinned: nextPinned } : item))
    );

    try {
      await updateChatLibraryItem(chat.id, {
        userId: DEFAULT_CHAT_USER_ID,
        pinned: nextPinned,
      });
      dispatchChatStoreUpdated();
    } catch {
      setChatLibrary((prev) =>
        prev.map((item) => (item.id === chat.id ? { ...item, pinned: chat.pinned } : item))
      );
    }
  };

  const handleRenameStart = (chat: ChatLibraryItem) => {
    clearRenameCloseTimeout();
    setChatBeingRenamed(chat);
    setRenameValue(chat.title);
    setIsRenameSaving(false);
    setRenameFeedback(null);
  };

  const handleDeleteStart = (chat: ChatLibraryItem) => {
    setChatBeingDeleted(chat);
    setDeleteFeedback(null);
    setIsDeleteSaving(false);
  };

  const handleRenameClose = () => {
    if (isRenameSaving) return;
    closeRenameDialog();
  };

  const handleRenameSave = async () => {
    if (!chatBeingRenamed) return;
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setRenameFeedback({ message: 'Введіть назву чату.', tone: 'error' });
      return;
    }

    if (nextTitle.length < RENAME_CHAT_TITLE_MIN_LENGTH) {
      setRenameFeedback({
        message: `Мінімум ${RENAME_CHAT_TITLE_MIN_LENGTH} символи.`,
        tone: 'error',
      });
      return;
    }

    if (nextTitle.length > RENAME_CHAT_TITLE_MAX_LENGTH) {
      setRenameFeedback({
        message: `Максимум ${RENAME_CHAT_TITLE_MAX_LENGTH} символів.`,
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

      setChatLibrary((prev) =>
        prev.map((item) =>
          item.id === updatedChat.id ? { ...item, title: updatedChat.title } : item
        )
      );
      dispatchChatStoreUpdated();
      setRenameFeedback({ message: 'Назву збережено.', tone: 'success' });
      renameCloseTimeoutRef.current = window.setTimeout(() => {
        closeRenameDialog();
      }, RENAME_SUCCESS_CLOSE_DELAY_MS);
    } catch {
      setRenameFeedback({
        message: 'Не вдалося зберегти назву. Спробуйте ще раз.',
        tone: 'error',
      });
    } finally {
      setIsRenameSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!chatBeingDeleted) return;

    setIsDeleteSaving(true);
    setDeleteFeedback(null);
    try {
      await deleteChatLibraryItem(chatBeingDeleted.id, DEFAULT_CHAT_USER_ID);
      setChatLibrary((prev) => prev.filter((item) => item.id !== chatBeingDeleted.id));
      dispatchChatStoreUpdated();
      closeDeleteDialog();
    } catch {
      setDeleteFeedback('Не вдалося видалити чат. Спробуйте ще раз.');
    } finally {
      setIsDeleteSaving(false);
    }
  };

  const renameTrimmedLength = renameValue.trim().length;
  const renameValidationMessage =
    renameTrimmedLength === 0
      ? null
      : renameTrimmedLength < RENAME_CHAT_TITLE_MIN_LENGTH
        ? `Мінімум ${RENAME_CHAT_TITLE_MIN_LENGTH} символи.`
        : renameTrimmedLength > RENAME_CHAT_TITLE_MAX_LENGTH
          ? `Максимум ${RENAME_CHAT_TITLE_MAX_LENGTH} символів.`
          : null;
  const renameHelperMessage =
    renameFeedback?.tone === 'success'
      ? renameFeedback.message
      : (renameValidationMessage ??
        renameFeedback?.message ??
        `${RENAME_CHAT_TITLE_MIN_LENGTH}-${RENAME_CHAT_TITLE_MAX_LENGTH} символів`);
  const renameHelperColor =
    renameFeedback?.tone === 'success'
      ? '#1E8E5A'
      : renameValidationMessage || renameFeedback?.tone === 'error'
        ? '#C03A2B'
        : '#7A7A7A';
  const isRenameValid =
    renameTrimmedLength >= RENAME_CHAT_TITLE_MIN_LENGTH &&
    renameTrimmedLength <= RENAME_CHAT_TITLE_MAX_LENGTH;
  const isRenameSaveDisabled = isRenameSaving || !isRenameValid;
  const handleRenameInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!isRenameSaveDisabled) {
      void handleRenameSave();
    }
  };

  const renderChatRow = (chat: ChatLibraryItem, options?: { hideDivider?: boolean }) => (
    <div
      key={chat.id}
      className={`workspace-chat-row${options?.hideDivider ? 'workspace-chat-row-no-divider' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => openChat(chat.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openChat(chat.id);
        }
      }}
      style={{
        width: '100%',
        padding: `${scale(14)}px ${scale(18)}px`,
        backgroundColor: 'transparent',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <div
        className="workspace-chat-row-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${scale(12)}px`,
          position: 'relative',
          zIndex: 1,
          borderRadius: `${scale(16)}px`,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${readableScale(4, 4)}px`,
            minWidth: 0,
            alignSelf: 'stretch',
            justifyContent: 'center',
            padding: `${scale(10)}px ${scale(14)}px`,
            textAlign: 'left',
            borderRadius: `${scale(16)}px`,
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              letterSpacing: '0.14px',
              color: '#000000',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {chat.title}
          </span>
          <span
            style={{
              ...secondaryTextStyle,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formatLastMessageLabel(chat.updatedAt)}
          </span>
        </div>
        <div
          className="workspace-chat-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${scale(20)}px`,
            flexShrink: 0,
            marginRight: `${scale(10)}px`,
          }}
        >
          <ChatActionButton
            label={chat.pinned ? 'Відкріпити чат' : 'Закріпити чат'}
            onClick={() => void handleTogglePinned(chat)}
          >
            <ChatStarIcon active={chat.pinned} />
          </ChatActionButton>
          <ChatActionButton label="Перейменувати чат" onClick={() => handleRenameStart(chat)}>
            <ChatPencilIcon />
          </ChatActionButton>
          <ChatActionButton label="Видалити чат" onClick={() => handleDeleteStart(chat)}>
            <ChatTrashIcon />
          </ChatActionButton>
        </div>
      </div>
    </div>
  );

  return (
    <main
      style={{
        height: '100%',
        flex: 1,
        minHeight: 0,
        color: '#000000',
        padding: `${scale(40)}px ${scale(64)}px ${scale(48)}px`,
        overflowY: 'auto',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div style={{ maxWidth: `${scale(1168)}px`, margin: '0 auto' }}>
        <div
          style={{
            marginTop: '10px',
            marginBottom: `${scale(34)}px`,
            paddingLeft: `${scale(32)}px`,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: `${readableScale(26, 22)}px`,
            lineHeight: `${readableScale(32, 28)}px`,
            letterSpacing: '-0.02em',
            color: '#000000',
          }}
        >
          Ваші чати
        </div>

        <label
          htmlFor="workspace-chats-search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${scale(14)}px`,
            height: `${scale(60)}px`,
            borderRadius: `${scale(16)}px`,
            border: '1px solid #E0E7E8',
            backgroundColor: '#FFFFFF',
            padding: `0 ${scale(20)}px`,
            color: '#9A9A9A',
            marginBottom: `${scale(28)}px`,
            boxShadow: 'inset 0 1px 0 rgba(244, 244, 246, 0.8)',
          }}
        >
          <SearchIcon />
          <input
            id="workspace-chats-search"
            className="workspace-chats-search-input"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Пошук по чатах..."
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: `${readableScale(17, 14)}px`,
              lineHeight: `${readableScale(20, 20)}px`,
              letterSpacing: '0.14px',
            }}
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="Очистити пошук"
              onClick={(event) => {
                event.preventDefault();
                setSearchQuery('');
              }}
              style={{
                width: '20px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: '#171717',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <SearchClearIcon />
            </button>
          ) : null}
        </label>

        <div
          className="workspace-chats-list"
          style={{
            position: 'relative',
          }}
        >
          {pinnedChats.length > 0 ? (
            <div
              className="workspace-pinned-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: `${scale(14)}px ${scale(18)}px`,
                color: '#6B7280',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: `${readableScale(13, 13)}px`,
                  lineHeight: `${readableScale(18, 18)}px`,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Закріплені
              </span>
            </div>
          ) : null}
          {pinnedChats.map((chat, index) =>
            renderChatRow(chat, { hideDivider: index === pinnedChats.length - 1 })
          )}
          {pinnedChats.length > 0 && regularChats.length > 0 ? (
            <div
              style={{
                padding: `${scale(14)}px ${scale(18)}px`,
                color: '#6B7280',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: `${readableScale(13, 13)}px`,
                  lineHeight: `${readableScale(18, 18)}px`,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Чати
              </span>
            </div>
          ) : null}
          {pinnedChats.length === 0 && regularChats.length > 0 ? (
            <div
              style={{
                padding: `${scale(14)}px ${scale(18)}px`,
                color: '#6B7280',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: `${readableScale(13, 13)}px`,
                  lineHeight: `${readableScale(18, 18)}px`,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Чати
              </span>
            </div>
          ) : null}
          {regularChats.map((chat) => renderChatRow(chat))}
          {filteredChats.length === 0 ? (
            <div
              style={{
                padding: `${scale(34)}px ${scale(18)}px`,
                borderBottom: '1px solid #E0E7E8',
                color: '#6B7280',
                fontFamily: 'Inter, sans-serif',
                fontSize: `${readableScale(16, 14)}px`,
                lineHeight: `${readableScale(20, 20)}px`,
              }}
            >
              За цим запитом чатів не знайдено.
            </div>
          ) : null}
        </div>
        <style jsx global>{`
          .workspace-chats-search-input::placeholder {
            font-family: Inter, sans-serif;
            font-weight: 500;
            font-size: ${readableScale(13, 13)}px;
            line-height: ${readableScale(20, 20)}px;
            letter-spacing: 0.14px;
            color: #6b7280;
            opacity: 1;
          }

          .workspace-chats-search-input::-webkit-search-cancel-button,
          .workspace-chats-search-input::-webkit-search-decoration,
          .workspace-chats-search-input::-webkit-search-results-button,
          .workspace-chats-search-input::-webkit-search-results-decoration {
            -webkit-appearance: none;
            appearance: none;
            display: none;
          }

          .workspace-chat-row::before {
            content: '';
            position: absolute;
            top: -1px;
            bottom: -1px;
            left: 0;
            right: 0;
            border-radius: ${scale(16)}px;
            background: #f5f5f5;
            opacity: 0;
            pointer-events: none;
            transition: opacity 140ms ease;
            z-index: 0;
          }

          .workspace-chat-row::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 1px;
            background: #e0e7e8;
            z-index: 0;
            transition: opacity 140ms ease;
          }

          .workspace-chat-row-no-divider::after {
            opacity: 0;
          }

          .workspace-chat-row:hover::before,
          .workspace-chat-row:focus-within::before {
            opacity: 1;
          }

          .workspace-chat-row:hover::after,
          .workspace-chat-row:focus-within::after {
            opacity: 0;
          }

          .workspace-chat-row:has(+ .workspace-chat-row:hover)::after,
          .workspace-chat-row:has(+ .workspace-chat-row:focus-within)::after {
            opacity: 0;
          }

          .workspace-chat-row:hover .workspace-chat-actions,
          .workspace-chat-row:focus-within .workspace-chat-actions {
            opacity: 1;
            pointer-events: auto;
          }

          .workspace-chat-actions {
            opacity: 0;
            pointer-events: none;
            transition: opacity 140ms ease;
          }
        `}</style>
      </div>
      {chatBeingRenamed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-chat-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
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
              id="rename-chat-title"
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
                  color: renameTrimmedLength > RENAME_CHAT_TITLE_MAX_LENGTH ? '#C03A2B' : '#9A9A9A',
                  whiteSpace: 'nowrap',
                }}
              >
                {renameTrimmedLength}/{RENAME_CHAT_TITLE_MAX_LENGTH}
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
        </div>
      ) : null}
      {chatBeingDeleted ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-chat-title"
          aria-describedby="delete-chat-description"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 125,
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
              width: `min(${DELETE_CHAT_CONFIRM_WIDTH}px, 100%)`,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E7E7',
              borderRadius: `${DELETE_CHAT_CONFIRM_RADIUS}px`,
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-chat-title"
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
              id="delete-chat-description"
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
                  height: `${DELETE_CHAT_CONFIRM_BUTTON_HEIGHT}px`,
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
                  height: `${DELETE_CHAT_CONFIRM_BUTTON_HEIGHT}px`,
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
        </div>
      ) : null}
    </main>
  );
}
