'use client';

import Image from 'next/image';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  /** Suggestion pills (e.g. "Детальніше") — only for assistant. */
  suggestions?: string[];
  onSuggestionClick?: (text: string) => void;
  /** When true, show typing indicator instead of content. */
  isTyping?: boolean;
}

/** Parse **bold** and newlines into React nodes. */
function parseContent(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;
  const key = () => `b-${keyIdx++}`;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key()}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(<strong key={key()}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key()}>{text.slice(lastIndex)}</span>);
  }
  return parts;
}

/** Split by newlines and render with bold parsing per line. */
function AssistantContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '21px',
            letterSpacing: '0.13px',
            color: '#000000',
            margin: 0,
            marginBottom: i < lines.length - 1 ? '4px' : 0,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {parseContent(line)}
        </p>
      ))}
    </>
  );
}

/** Action icons row below AI response — copy, like, dislike, regenerate, "Переглянути процес". Icons from public/images/chat/*.svg */
function ActionIconsRow() {
  const iconSize = 14;
  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '14px',
      }}
      role="group"
      aria-label="Дії з відповіддю"
    >
      <button type="button" style={btnStyle} aria-label="Копіювати">
        <Image src="/images/chat/copy.svg" alt="" width={iconSize} height={iconSize} aria-hidden />
      </button>
      <button type="button" style={btnStyle} aria-label="Подобається">
        <Image
          src="/images/chat/thumbs-up.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          aria-hidden
        />
      </button>
      <button type="button" style={btnStyle} aria-label="Не подобається">
        <Image
          src="/images/chat/thumbs-down.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          aria-hidden
        />
      </button>
      <button type="button" style={btnStyle} aria-label="Згенерувати знову">
        <Image
          src="/images/chat/refresh.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          aria-hidden
        />
      </button>
      <button
        type="button"
        style={{
          ...btnStyle,
          width: 'auto',
          height: 'auto',
          padding: '2px 0',
          marginLeft: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#9A9A9A',
        }}
        aria-label="Переглянути процес"
        className="hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
      >
        Переглянути процес
      </button>
    </div>
  );
}

/** Typing indicator: pulsing dots. */
function TypingIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      aria-live="polite"
      aria-label="Набір відповіді"
    >
      <span
        className="chat-typing-dot"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#616161',
          animation: 'chat-typing 1.4s ease-in-out infinite both',
        }}
      />
      <span
        className="chat-typing-dot"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#616161',
          animation: 'chat-typing 1.4s ease-in-out 0.2s infinite both',
        }}
      />
      <span
        className="chat-typing-dot"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#616161',
          animation: 'chat-typing 1.4s ease-in-out 0.4s infinite both',
        }}
      />
    </div>
  );
}

export function ChatMessage({
  role,
  content,
  suggestions: _suggestions = [],
  onSuggestionClick: _onSuggestionClick,
  isTyping = false,
}: ChatMessageProps) {
  if (role === 'user') {
    const iconBtnStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 0,
      flexShrink: 0,
      borderRadius: 6,
    };
    return (
      <div
        className="group"
        style={{
          alignSelf: 'flex-end',
          width: 'max-content',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            width: 'max-content',
            maxWidth: '570px',
            background: '#F5F5F5',
            borderRadius: '19px',
            padding: '9px 14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: '21px',
            letterSpacing: '0.13px',
            color: '#000000',
            boxSizing: 'border-box',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {content}
        </div>
        <div
          className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ flexShrink: 0, marginLeft: '-4px' }}
          role="group"
          aria-label="Дії з повідомленням"
        >
          <button
            type="button"
            style={iconBtnStyle}
            aria-label="Копіювати"
            className="rounded hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
          >
            <Image src="/images/chat/copy.svg" alt="" width={14} height={14} aria-hidden />
          </button>
          <button
            type="button"
            style={iconBtnStyle}
            aria-label="Редагувати"
            className="rounded hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
          >
            <Image src="/images/chat/edit.svg" alt="" width={14} height={14} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  // Assistant
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {isTyping ? (
        <TypingIndicator />
      ) : (
        <div style={{ width: '100%' }}>
          <AssistantContent content={content} />
          <ActionIconsRow />
        </div>
      )}
    </div>
  );
}
