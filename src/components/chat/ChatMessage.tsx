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
  /** Regenerate last assistant response (only for last assistant message). modifier = custom instruction for change. */
  onRegenerate?: (modifier?: string) => void;
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
            fontSize: '14px',
            lineHeight: '20px',
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

type TooltipId = 'copy' | 'thumbs-up' | 'thumbs-down' | 'refresh' | null;
type UserMessageTooltipId = 'copy' | 'edit' | null;

/** Action icons row below AI response — copy, like, dislike, regenerate, "Переглянути процес". Icons from public/images/chat/*.svg */
function ActionIconsRow({
  content,
  onRegenerate,
}: {
  content: string;
  onRegenerate?: (modifier?: string) => void;
}) {
  const iconSize = 14;
  const size = 32; // square clickable area (circle = border-radius on container)
  const [tooltipVisibleId, setTooltipVisibleId] = useState<TooltipId>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [feedbackLike, setFeedbackLike] = useState<'like' | 'dislike' | null>(null);
  const [showThankYouTooltip, setShowThankYouTooltip] = useState(false);
  const [regeneratePopoverOpen, setRegeneratePopoverOpen] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [regeneratePopoverBelow, setRegeneratePopoverBelow] = useState(false);
  const regenerateAnchorRef = useRef<HTMLDivElement>(null);
  const regeneratePopoverRef = useRef<HTMLDivElement>(null);

  const POPOVER_APPROX_HEIGHT = 200;

  const toggleRegeneratePopover = () => {
    setRegeneratePopoverOpen((open) => {
      if (!open && regenerateAnchorRef.current) {
        const rect = regenerateAnchorRef.current.getBoundingClientRect();
        setRegeneratePopoverBelow(rect.top < POPOVER_APPROX_HEIGHT + 12);
      }
      return !open;
    });
  };

  const handleLike = (value: 'like' | 'dislike') => {
    if (feedbackLike === value) return;
    setFeedbackLike(value);
    setShowThankYouTooltip(true);
    setTimeout(() => setShowThankYouTooltip(false), 1500);
  };

  const handleCopy = () => {
    if (!content.trim()) return;
    navigator.clipboard.writeText(content).then(
      () => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 1500);
      },
      () => {}
    );
  };
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const halfSecondTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredIdRef = useRef<TooltipId>(null);
  const hasWaitedEnoughRef = useRef(false);

  const TOOLTIP_DELAY_MS = 1250;

  const showTooltipAfterDelay = (id: TooltipId) => {
    hoveredIdRef.current = id;
    setTooltipVisibleId(null);
    if (hasWaitedEnoughRef.current) {
      setTooltipVisibleId(id);
      return;
    }
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    if (halfSecondTimeoutRef.current) {
      clearTimeout(halfSecondTimeoutRef.current);
      halfSecondTimeoutRef.current = null;
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipVisibleId(hoveredIdRef.current);
      tooltipTimeoutRef.current = null;
    }, TOOLTIP_DELAY_MS);
    halfSecondTimeoutRef.current = setTimeout(() => {
      hasWaitedEnoughRef.current = true;
      halfSecondTimeoutRef.current = null;
    }, TOOLTIP_DELAY_MS);
  };
  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    if (halfSecondTimeoutRef.current) {
      clearTimeout(halfSecondTimeoutRef.current);
      halfSecondTimeoutRef.current = null;
    }
    hasWaitedEnoughRef.current = false;
    hoveredIdRef.current = null;
    setTooltipVisibleId(null);
  };

  useEffect(
    () => () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      if (halfSecondTimeoutRef.current) clearTimeout(halfSecondTimeoutRef.current);
    },
    []
  );

  useEffect(() => {
    if (!regeneratePopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        regenerateAnchorRef.current?.contains(target) ||
        regeneratePopoverRef.current?.contains(target)
      )
        return;
      setRegeneratePopoverOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [regeneratePopoverOpen]);

  const runRegenerate = (modifier?: string) => {
    onRegenerate?.(modifier);
    setRegeneratePopoverOpen(false);
    setRegeneratePrompt('');
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    padding: 0,
    cursor: 'pointer',
    border: 'none',
    borderRadius: 9999,
    background: 'transparent',
    transition: 'background-color 150ms ease',
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '14px',
      }}
      role="group"
      aria-label="Дії з відповіддю"
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        onMouseLeave={hideTooltip}
        onBlurCapture={hideTooltip}
      >
        <div
          className="chat-action-tooltip-anchor"
          onMouseEnter={() => showTooltipAfterDelay('copy')}
          onFocusCapture={() => showTooltipAfterDelay('copy')}
        >
          <button
            type="button"
            style={btnStyle}
            className="chat-action-btn chat-action-btn--circle"
            aria-label="Копіювати"
            aria-describedby="chat-action-tooltip-copy"
            onClick={handleCopy}
          >
            <Image
              src="/images/chat/copy.svg"
              alt=""
              width={iconSize}
              height={iconSize}
              aria-hidden
              className="chat-action-icon"
            />
          </button>
          <span
            id="chat-action-tooltip-copy"
            className="chat-action-tooltip"
            role="tooltip"
            style={{
              opacity: tooltipVisibleId === 'copy' || copyFeedback ? 1 : 0,
              visibility: tooltipVisibleId === 'copy' || copyFeedback ? 'visible' : 'hidden',
              transform:
                tooltipVisibleId === 'copy' || copyFeedback
                  ? 'translateX(-50%) translateY(0)'
                  : 'translateX(-50%) translateY(4px)',
            }}
          >
            {copyFeedback ? 'Скопійовано' : 'Копіювати'}
          </span>
        </div>
        <div
          className="chat-action-tooltip-anchor"
          onMouseEnter={() => showTooltipAfterDelay('thumbs-up')}
          onFocusCapture={() => showTooltipAfterDelay('thumbs-up')}
        >
          <button
            type="button"
            style={btnStyle}
            className={`chat-action-btn chat-action-btn--circle${feedbackLike === 'like' ? 'chat-action-btn--liked' : ''}`}
            aria-label="Подобається"
            aria-describedby="chat-action-tooltip-thumbs-up"
            onClick={() => handleLike('like')}
          >
            <Image
              src="/images/chat/thumbs-up.svg"
              alt=""
              width={iconSize}
              height={iconSize}
              aria-hidden
              className="chat-action-icon"
            />
          </button>
          <span
            id="chat-action-tooltip-thumbs-up"
            className="chat-action-tooltip"
            role="tooltip"
            style={{
              opacity:
                tooltipVisibleId === 'thumbs-up' || (feedbackLike === 'like' && showThankYouTooltip)
                  ? 1
                  : 0,
              visibility:
                tooltipVisibleId === 'thumbs-up' || (feedbackLike === 'like' && showThankYouTooltip)
                  ? 'visible'
                  : 'hidden',
              transform:
                tooltipVisibleId === 'thumbs-up' || (feedbackLike === 'like' && showThankYouTooltip)
                  ? 'translateX(-50%) translateY(0)'
                  : 'translateX(-50%) translateY(4px)',
            }}
          >
            {feedbackLike === 'like' && showThankYouTooltip ? 'Дякуємо за відгук!' : 'Подобається'}
          </span>
        </div>
        <div
          className="chat-action-tooltip-anchor"
          onMouseEnter={() => showTooltipAfterDelay('thumbs-down')}
          onFocusCapture={() => showTooltipAfterDelay('thumbs-down')}
        >
          <button
            type="button"
            style={btnStyle}
            className={`chat-action-btn chat-action-btn--circle${feedbackLike === 'dislike' ? 'chat-action-btn--disliked' : ''}`}
            aria-label="Не подобається"
            aria-describedby="chat-action-tooltip-thumbs-down"
            onClick={() => handleLike('dislike')}
          >
            <Image
              src="/images/chat/thumbs-down.svg"
              alt=""
              width={iconSize}
              height={iconSize}
              aria-hidden
              className="chat-action-icon"
            />
          </button>
          <span
            id="chat-action-tooltip-thumbs-down"
            className="chat-action-tooltip"
            role="tooltip"
            style={{
              opacity:
                tooltipVisibleId === 'thumbs-down' ||
                (feedbackLike === 'dislike' && showThankYouTooltip)
                  ? 1
                  : 0,
              visibility:
                tooltipVisibleId === 'thumbs-down' ||
                (feedbackLike === 'dislike' && showThankYouTooltip)
                  ? 'visible'
                  : 'hidden',
              transform:
                tooltipVisibleId === 'thumbs-down' ||
                (feedbackLike === 'dislike' && showThankYouTooltip)
                  ? 'translateX(-50%) translateY(0)'
                  : 'translateX(-50%) translateY(4px)',
            }}
          >
            {feedbackLike === 'dislike' && showThankYouTooltip
              ? 'Дякуємо за відгук!'
              : 'Не подобається'}
          </span>
        </div>
        <div
          ref={regenerateAnchorRef}
          className="chat-action-tooltip-anchor"
          style={{ position: 'relative' }}
          onMouseEnter={() => showTooltipAfterDelay('refresh')}
          onFocusCapture={() => showTooltipAfterDelay('refresh')}
        >
          <button
            type="button"
            style={btnStyle}
            className="chat-action-btn chat-action-btn--circle"
            aria-label="Згенерувати знову"
            aria-expanded={regeneratePopoverOpen}
            aria-haspopup="dialog"
            aria-describedby="chat-action-tooltip-refresh"
            onClick={toggleRegeneratePopover}
          >
            <Image
              src="/images/chat/refresh.svg"
              alt=""
              width={iconSize}
              height={iconSize}
              aria-hidden
              className="chat-action-icon"
            />
          </button>
          <span
            id="chat-action-tooltip-refresh"
            className="chat-action-tooltip"
            role="tooltip"
            style={{
              opacity: tooltipVisibleId === 'refresh' && !regeneratePopoverOpen ? 1 : 0,
              visibility:
                tooltipVisibleId === 'refresh' && !regeneratePopoverOpen ? 'visible' : 'hidden',
              transform:
                tooltipVisibleId === 'refresh' && !regeneratePopoverOpen
                  ? 'translateX(-50%) translateY(0)'
                  : 'translateX(-50%) translateY(4px)',
            }}
          >
            Згенерувати знову
          </span>
          {regeneratePopoverOpen && (
            <div
              ref={regeneratePopoverRef}
              role="dialog"
              aria-label="Змінити відповідь"
              style={{
                position: 'absolute',
                ...(regeneratePopoverBelow
                  ? { top: '100%', marginTop: '6px' }
                  : { bottom: '100%', marginBottom: '6px' }),
                right: 0,
                width: '220px',
                padding: '8px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                boxShadow: 'none',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (regeneratePrompt.trim()) runRegenerate(regeneratePrompt.trim());
                    }
                  }}
                  placeholder="Уточнення"
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #E0E0E0',
                    backgroundColor: '#F7F7F7',
                    color: '#2A2A2A',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  aria-label="Текст зміни відповіді"
                />
                <button
                  type="button"
                  disabled={!regeneratePrompt.trim()}
                  onClick={() => regeneratePrompt.trim() && runRegenerate(regeneratePrompt.trim())}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    padding: 0,
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: regeneratePrompt.trim() ? '#2A2A2A' : '#EDEDED',
                    color: regeneratePrompt.trim() ? '#FFFFFF' : '#ABABAB',
                    cursor: regeneratePrompt.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                  }}
                  aria-label="Надіслати"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 37 37"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transition: 'fill 0.15s ease' }}
                  >
                    <path
                      d="M24.8618 13.2114L24.8618 22.2812C24.8618 22.4222 24.8341 22.5618 24.7801 22.692C24.7262 22.8222 24.6471 22.9405 24.5475 23.0402C24.4478 23.1398 24.3295 23.2189 24.1993 23.2728C24.0691 23.3268 23.9295 23.3545 23.7886 23.3545C23.6476 23.3545 23.5081 23.3268 23.3779 23.2728C23.2476 23.2189 23.1293 23.1398 23.0297 23.0402C22.93 22.9405 22.8509 22.8222 22.797 22.692C22.7431 22.5618 22.7153 22.4222 22.7153 22.2812L22.7229 15.7888L13.9629 24.5487C13.7625 24.7492 13.4906 24.8618 13.2071 24.8618C12.9236 24.8618 12.6517 24.7492 12.4513 24.5487C12.2508 24.3482 12.1382 24.0764 12.1382 23.7929C12.1382 23.5094 12.2508 23.2375 12.4513 23.0371L21.2112 14.2771L14.7187 14.2847C14.4341 14.2847 14.1611 14.1716 13.9598 13.9703C13.7586 13.7691 13.6455 13.4961 13.6455 13.2114C13.6455 12.9268 13.7586 12.6538 13.9598 12.4525C14.1611 12.2512 14.4341 12.1382 14.7187 12.1382L23.7886 12.1382C23.9297 12.1376 24.0695 12.165 24.2 12.2187C24.3305 12.2724 24.449 12.3514 24.5488 12.4512C24.6485 12.551 24.7276 12.6695 24.7813 12.8C24.835 12.9305 24.8624 13.0703 24.8618 13.2114Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div style={{ height: 1, backgroundColor: '#E0E0E0', margin: '2px 0' }} />
              <button
                type="button"
                onClick={() => runRegenerate()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#2A2A2A',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                className="chat-regenerate-option-btn"
              >
                <Image
                  src="/images/chat/refresh.svg"
                  alt=""
                  width={14}
                  height={14}
                  style={{ opacity: 0.9 }}
                />
                Спробувати знову
              </button>
              <button
                type="button"
                onClick={() => runRegenerate('Додай більше деталей')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#2A2A2A',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                className="chat-regenerate-option-btn"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Додати деталі
              </button>
              <button
                type="button"
                onClick={() => runRegenerate('Зроби відповідь коротшою')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#2A2A2A',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                className="chat-regenerate-option-btn"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                </svg>
                Коротше
              </button>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        style={{
          ...btnStyle,
          width: 'auto',
          height: 'auto',
          padding: '4px 12px',
          marginLeft: '6px',
          borderRadius: 6,
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 400,
          color: '#9A9A9A',
          backgroundColor: 'transparent',
        }}
        className="chat-action-btn chat-action-btn--no-highlight hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
        aria-label="Переглянути процес"
        title="Переглянути процес"
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
          opacity: expanded ? 1 : 0,
          visibility: expanded ? 'visible' : 'hidden',
          transform: expanded ? 'translateY(0)' : 'translateY(-8px)',
          transition:
            'opacity 0.2s cubic-bezier(0.33, 0.8, 0.5, 1), transform 0.2s cubic-bezier(0.33, 0.8, 0.5, 1), visibility 0.2s',
          pointerEvents: expanded ? 'auto' : 'none',
          ...(n > 4 ? { maxHeight: '170px', overflowY: 'auto' as const } : {}),
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
        borderTopRightRadius: '7px',
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
        gap: 0,
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
  onRegenerate,
}: ChatMessageProps) {
  const attachmentsRef = useRef(attachments);
  const [userTooltipVisibleId, setUserTooltipVisibleId] = useState<UserMessageTooltipId>(null);
  const [userCopyFeedback, setUserCopyFeedback] = useState(false);
  const userTooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userHalfSecondTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userHoveredIdRef = useRef<UserMessageTooltipId>(null);
  const userHasWaitedEnoughRef = useRef(false);

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
  useEffect(
    () => () => {
      if (userTooltipTimeoutRef.current) clearTimeout(userTooltipTimeoutRef.current);
      if (userHalfSecondTimeoutRef.current) clearTimeout(userHalfSecondTimeoutRef.current);
    },
    []
  );

  if (role === 'user') {
    const iconSize = 14;
    const iconBtnStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      padding: 0,
      cursor: 'pointer',
      flexShrink: 0,
      border: 'none',
      borderRadius: 9999,
      background: 'transparent',
      transition: 'background-color 150ms ease',
    };
    const USER_TOOLTIP_DELAY_MS = 1250;

    const showUserTooltipAfterDelay = (id: UserMessageTooltipId) => {
      userHoveredIdRef.current = id;
      setUserTooltipVisibleId(null);
      if (userHasWaitedEnoughRef.current) {
        setUserTooltipVisibleId(id);
        return;
      }
      if (userTooltipTimeoutRef.current) {
        clearTimeout(userTooltipTimeoutRef.current);
        userTooltipTimeoutRef.current = null;
      }
      if (userHalfSecondTimeoutRef.current) {
        clearTimeout(userHalfSecondTimeoutRef.current);
        userHalfSecondTimeoutRef.current = null;
      }
      userTooltipTimeoutRef.current = setTimeout(() => {
        setUserTooltipVisibleId(userHoveredIdRef.current);
        userTooltipTimeoutRef.current = null;
      }, USER_TOOLTIP_DELAY_MS);
      userHalfSecondTimeoutRef.current = setTimeout(() => {
        userHasWaitedEnoughRef.current = true;
        userHalfSecondTimeoutRef.current = null;
      }, USER_TOOLTIP_DELAY_MS);
    };
    const hideUserTooltip = () => {
      if (userTooltipTimeoutRef.current) {
        clearTimeout(userTooltipTimeoutRef.current);
        userTooltipTimeoutRef.current = null;
      }
      if (userHalfSecondTimeoutRef.current) {
        clearTimeout(userHalfSecondTimeoutRef.current);
        userHalfSecondTimeoutRef.current = null;
      }
      userHasWaitedEnoughRef.current = false;
      userHoveredIdRef.current = null;
      setUserTooltipVisibleId(null);
    };
    const handleUserCopy = () => {
      if (!content.trim()) return;
      navigator.clipboard.writeText(content).then(
        () => {
          setUserCopyFeedback(true);
          setTimeout(() => setUserCopyFeedback(false), 1500);
        },
        () => {}
      );
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
        {attachments.length === 1 ? <UserFileBubble attachment={attachments[0]} /> : null}
        {content ? (
          <div
            style={{
              display: 'inline-block',
              width: 'max-content',
              maxWidth: '570px',
              background: '#F5F5F5',
              ...(attachments.length === 1
                ? {
                    borderTopLeftRadius: '18px',
                    borderTopRightRadius: '7px',
                    borderBottomRightRadius: '18px',
                    borderBottomLeftRadius: '18px',
                  }
                : attachments.length > 1
                  ? {
                      borderTopLeftRadius: '18px',
                      borderTopRightRadius: '18px',
                      borderBottomRightRadius: '7px',
                      borderBottomLeftRadius: '18px',
                    }
                  : { borderRadius: '18px' }),
              padding: '9px 14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
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
        {attachments.length > 1 ? <UserAttachmentsMultiple attachments={attachments} /> : null}
        <div
          className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ flexShrink: 0, marginLeft: '-4px' }}
          role="group"
          aria-label="Дії з повідомленням"
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 0 }}
            onMouseLeave={hideUserTooltip}
            onBlurCapture={hideUserTooltip}
          >
            <div
              className="chat-action-tooltip-anchor"
              onMouseEnter={() => showUserTooltipAfterDelay('copy')}
              onFocusCapture={() => showUserTooltipAfterDelay('copy')}
            >
              <button
                type="button"
                style={iconBtnStyle}
                className="chat-action-btn chat-action-btn--circle focus-visible:outline-none"
                aria-label="Копіювати"
                aria-describedby="user-msg-tooltip-copy"
                onClick={handleUserCopy}
              >
                <Image
                  src="/images/chat/copy.svg"
                  alt=""
                  width={iconSize}
                  height={iconSize}
                  aria-hidden
                  className="chat-action-icon"
                />
              </button>
              <span
                id="user-msg-tooltip-copy"
                className="chat-action-tooltip"
                role="tooltip"
                style={{
                  opacity: userTooltipVisibleId === 'copy' || userCopyFeedback ? 1 : 0,
                  visibility:
                    userTooltipVisibleId === 'copy' || userCopyFeedback ? 'visible' : 'hidden',
                  transform:
                    userTooltipVisibleId === 'copy' || userCopyFeedback
                      ? 'translateX(-50%) translateY(0)'
                      : 'translateX(-50%) translateY(4px)',
                }}
              >
                {userCopyFeedback ? 'Скопійовано' : 'Копіювати'}
              </span>
            </div>
            <div
              className="chat-action-tooltip-anchor"
              onMouseEnter={() => showUserTooltipAfterDelay('edit')}
              onFocusCapture={() => showUserTooltipAfterDelay('edit')}
            >
              <button
                type="button"
                style={iconBtnStyle}
                className="chat-action-btn chat-action-btn--circle focus-visible:outline-none"
                aria-label="Редагувати"
                aria-describedby="user-msg-tooltip-edit"
              >
                <Image
                  src="/images/chat/edit.svg"
                  alt=""
                  width={iconSize}
                  height={iconSize}
                  aria-hidden
                  className="chat-action-icon"
                />
              </button>
              <span
                id="user-msg-tooltip-edit"
                className="chat-action-tooltip"
                role="tooltip"
                style={{
                  opacity: userTooltipVisibleId === 'edit' ? 1 : 0,
                  visibility: userTooltipVisibleId === 'edit' ? 'visible' : 'hidden',
                  transform:
                    userTooltipVisibleId === 'edit'
                      ? 'translateX(-50%) translateY(0)'
                      : 'translateX(-50%) translateY(4px)',
                }}
              >
                Редагувати
              </span>
            </div>
          </div>
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
          <ActionIconsRow content={content} onRegenerate={onRegenerate} />
        </div>
      )}
    </div>
  );
}
