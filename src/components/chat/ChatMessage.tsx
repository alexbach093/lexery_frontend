'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { formatFileSize } from '@/components/file-preview';
import type { MessageAttachment } from '@/types/chat';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  /** Suggestion pills (e.g. "Детальніше") — only for assistant. */
  suggestions?: string[];
  /** User message: files sent with the message (shown as bubbles with thumbnail + name). */
  attachments?: MessageAttachment[];
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

/** Іконка скріпки для блоку "N вкладень". */
function PaperclipIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="#666666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Кілька вкладень: рядок "N вкладень" + випадаючий список файлів (не зміщує сторінку). */
function UserAttachmentsMultiple({ attachments }: { attachments: MessageAttachment[] }) {
  const [expanded, setExpanded] = useState(false);
  const n = attachments.length;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {expanded && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '6px',
            zIndex: 20,
          }}
        >
          {attachments.map((att, i) => (
            <div
              key={`${att.name}-${att.size}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: '#F5F5F5',
                border: '1px solid #E8E8E8',
                borderRadius: '10px',
                width: 'max-content',
                maxWidth: '220px',
                boxSizing: 'border-box',
              }}
            >
              {att.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob URL from user upload
                <img
                  src={att.previewUrl}
                  alt=""
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    objectFit: 'cover',
                    display: 'block',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: '#E0E0E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="18" cy="6" r="3" fill="#9A9A9A" />
                    <path d="M2 24L10 10h4l8-6v20H2z" fill="#B0B0B0" />
                  </svg>
                </div>
              )}
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#333333',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {att.name}
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#F5F5F5',
          border: '1px solid #E8E8E8',
          borderRadius: '14px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: '#333333',
          boxSizing: 'border-box',
        }}
        className="rounded-xl hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none"
        aria-expanded={expanded}
        aria-label={expanded ? 'Згорнути вкладення' : 'Розгорнути вкладення'}
      >
        <PaperclipIcon />
        <span>
          {n} {n >= 5 ? 'вкладень' : 'вкладення'}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

/** User file bubble in chat: світлий блок, thumbnail + filename; розміщений над текстовою бульбашкою. */
function UserFileBubble({ attachment }: { attachment: MessageAttachment }) {
  const { name, size, previewUrl } = attachment;
  const thumbSize = 20;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 7px',
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '7px',
        borderBottomLeftRadius: '10px',
        width: 'max-content',
        maxWidth: '180px',
        boxSizing: 'border-box',
        border: '1px solid #E8E8E8',
      }}
    >
      <div
        style={{
          width: thumbSize,
          height: thumbSize,
          borderRadius: '4px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#E0E0E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL from user upload
          <img
            src={previewUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span style={{ color: '#888', fontSize: 8 }}>?</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '11px',
            lineHeight: '14px',
            color: '#333333',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '9px',
            color: '#888888',
          }}
        >
          {formatFileSize(size)}
        </span>
      </div>
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
  attachments = [],
  onSuggestionClick: _onSuggestionClick,
  isTyping = false,
}: ChatMessageProps) {
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
    };
  }, []);

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
        {content ? (
          <div
            style={{
              display: 'inline-block',
              width: 'max-content',
              maxWidth: '570px',
              background: '#F5F5F5',
              ...(attachments.length > 0
                ? {
                    borderTopLeftRadius: '18px',
                    borderTopRightRadius: '18px',
                    borderBottomRightRadius: '7px',
                    borderBottomLeftRadius: '18px',
                  }
                : { borderRadius: '18px' }),
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
        ) : null}
        {attachments.length === 1 ? (
          <UserFileBubble attachment={attachments[0]} />
        ) : attachments.length > 1 ? (
          <UserAttachmentsMultiple attachments={attachments} />
        ) : null}
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
