'use client';

import Image from 'next/image';

export interface ChatMetaProps {
  hasMessages: boolean;
  compact: boolean;
}

/** Top bar: Поради button (full or compact). */
export function ChatMeta({ hasMessages, compact }: ChatMetaProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '29px',
        right: '28px',
      }}
    >
      {!hasMessages ? (
        <button
          type="button"
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: '33px',
            padding: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E7E8',
            borderRadius: '5px',
            cursor: 'pointer',
            minWidth: '90px',
            boxSizing: 'border-box',
          }}
          aria-label="Поради"
        >
          <Image src="/images/workspace/tips.svg" alt="" width={13} height={13} />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '19.6px',
              letterSpacing: '0.14px',
              color: '#040404',
            }}
          >
            Поради
          </p>
        </button>
      ) : compact ? (
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            padding: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E7E8',
            borderRadius: '5px',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
          aria-label="Поради"
        >
          <Image src="/images/workspace/tips-chat.svg" alt="" width={32} height={32} />
        </button>
      ) : (
        <button
          type="button"
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: '33px',
            padding: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E7E8',
            borderRadius: '5px',
            cursor: 'pointer',
            minWidth: '90px',
            boxSizing: 'border-box',
          }}
          aria-label="Поради"
        >
          <Image src="/images/workspace/tips-chat.svg" alt="" width={32} height={32} />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '19.6px',
              letterSpacing: '0.14px',
              color: '#040404',
            }}
          >
            Поради
          </p>
        </button>
      )}
    </div>
  );
}
