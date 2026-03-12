'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { EditSquareIcon } from '@/components/ui/edit-square-icon';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  fetchChatLibrary,
  formatLastMessageLabel,
  getChatSearchText,
  type ChatLibraryItem,
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
      width={scale(22)}
      height={scale(22)}
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

const ACTION_ICON_SIZE = 20;
const ACTION_ICON_STROKE = 1.45;

function ChatActionButton({ label, children }: { label: string; children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
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
        backgroundColor: isActive ? '#F3F4F6' : 'transparent',
        color: isActive ? '#171717' : '#6B7280',
        cursor: 'pointer',
        transition: 'background-color 140ms ease, color 140ms ease',
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
      width={scale(ACTION_ICON_SIZE)}
      height={scale(ACTION_ICON_SIZE)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      <path
        d="M10.0129 2.1438L12.2647 6.59517C12.3809 6.82488 12.6016 6.98469 12.8561 7.02054L17.7091 7.70431C18.3501 7.79462 18.6072 8.58274 18.1428 9.02336L14.6294 12.3572C14.4452 12.5319 14.3619 12.7883 14.4068 13.0379L15.2616 17.7803C15.3753 18.4108 14.7011 18.8923 14.1311 18.6L9.79783 16.3777C9.57029 16.261 9.30042 16.2612 9.07306 16.3783L4.74611 18.6074C4.17651 18.9008 3.50146 18.4205 3.61403 17.7898L4.46077 13.0459C4.50525 12.7962 4.42156 12.5401 4.23709 12.3658L0.718081 9.03777C0.252893 8.59791 0.508772 7.80937 1.14959 7.71804L6.00139 7.02679C6.25589 6.99057 6.47633 6.83044 6.59217 6.60056L8.83734 2.14567C9.1337 1.55735 9.71571 1.55659 10.0129 2.1438Z"
        stroke="currentColor"
        strokeWidth={ACTION_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active ? (
        <path
          d="M3.30273 3.30957L16.6974 16.6906"
          stroke="currentColor"
          strokeWidth={ACTION_ICON_STROKE}
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

function ChatPencilIcon() {
  return <EditSquareIcon size={scale(18)} strokeWidth={16.9} style={{ display: 'block' }} />;
}

function ChatTrashIcon() {
  return (
    <svg
      width={scale(ACTION_ICON_SIZE)}
      height={scale(ACTION_ICON_SIZE)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      <path
        d="M3.75 5.41667H16.25M8 2.91667H12C12.3682 2.91667 12.6667 3.21514 12.6667 3.58333V5.41667H7.33333V3.58333C7.33333 3.21514 7.63181 2.91667 8 2.91667ZM5.41667 5.41667H14.5833V15.75C14.5833 16.8546 13.6879 17.75 12.5833 17.75H7.41667C6.3121 17.75 5.41667 16.8546 5.41667 15.75V5.41667Z"
        stroke="currentColor"
        strokeWidth={ACTION_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.33325 8.33325V14.1666M11.6666 8.33325V14.1666"
        stroke="currentColor"
        strokeWidth={ACTION_ICON_STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WorkspaceChats() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatLibrary, setChatLibrary] = useState<ChatLibraryItem[]>([]);
  const deferredSearchQuery = useDeferredValue(searchQuery);

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

  const filteredChats = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return chatLibrary;

    return chatLibrary.filter((chat) => getChatSearchText(chat).includes(normalizedQuery));
  }, [chatLibrary, deferredSearchQuery]);

  const openChat = (chatId: string) => {
    router.push(`/workspace?chat=${encodeURIComponent(chatId)}`);
  };

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
            placeholder="Search your chats..."
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
        </label>

        <div
          style={{
            borderTop: '1px solid #E0E7E8',
          }}
        >
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: `${scale(12)}px`,
                padding: `${scale(14)}px ${scale(18)}px`,
                borderBottom: '1px solid #E0E7E8',
                backgroundColor: 'transparent',
              }}
            >
              <button
                type="button"
                onClick={() => openChat(chat.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${readableScale(4, 4)}px`,
                  minWidth: 0,
                  padding: `${scale(10)}px 0`,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
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
              </button>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${scale(6)}px`,
                  flexShrink: 0,
                }}
              >
                <ChatActionButton label="Pin chat">
                  <ChatStarIcon />
                </ChatActionButton>
                <ChatActionButton label="Rename chat">
                  <ChatPencilIcon />
                </ChatActionButton>
                <ChatActionButton label="Delete chat">
                  <ChatTrashIcon />
                </ChatActionButton>
              </div>
            </div>
          ))}
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
              No chats found for this query.
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
        `}</style>
      </div>
    </main>
  );
}
