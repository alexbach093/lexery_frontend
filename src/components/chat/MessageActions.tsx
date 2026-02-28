'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type TooltipId = 'copy' | 'thumbs-up' | 'thumbs-down' | 'refresh' | null;

export interface MessageActionsProps {
  content: string;
  onRegenerate?: (modifier?: string) => void;
  /** Елемент зліва в рядку. */
  leading?: React.ReactNode;
  /** Елемент справа в рядку (наприклад кнопка Історія). */
  trailing?: React.ReactNode;
}

/** Action icons row below AI response — copy, like, dislike, regenerate, "Переглянути процес". */
export function MessageActions({ content, onRegenerate, leading, trailing }: MessageActionsProps) {
  const iconSize = 16;
  const size = 32;
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
  const TOOLTIP_DELAY_MS = 1250;

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
        gap: '8px',
        marginTop: '14px',
      }}
      role="group"
      aria-label="Дії з відповіддю"
    >
      {leading}
      <div
        className="chat-action-icons-stagger"
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
            className={`chat-action-btn chat-action-btn--circle chat-action-btn--thumbs${feedbackLike === 'like' ? 'chat-action-btn--liked' : ''}`}
            aria-label="Подобається"
            aria-describedby="chat-action-tooltip-thumbs-up"
            onClick={() => handleLike('like')}
          >
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 12 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="chat-action-icon"
              style={{ display: 'block' }}
            >
              <path
                d="M8.88126 10.5459H1.71581C1.01911 10.5459 0.45433 9.98113 0.45433 9.28444V5.5C0.45433 4.8033 1.01911 4.23852 1.71581 4.23852H2.9329C3.35468 4.23852 3.74856 4.02773 3.98252 3.67678L5.80357 0.945213C6.00812 0.638382 6.35249 0.454083 6.72125 0.454083C7.40279 0.454083 7.92121 1.06606 7.80917 1.73832L7.63728 2.76966C7.50912 3.53857 8.10207 4.23852 8.88159 4.23852H9.63815C10.4342 4.23852 11.0312 4.9668 10.8751 5.7474L10.1182 9.53183C10.0003 10.1215 9.48258 10.5459 8.88126 10.5459Z"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M2.97729 4.23852V10.5459" stroke="currentColor" strokeWidth="0.9" />
            </svg>
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
            className={`chat-action-btn chat-action-btn--circle chat-action-btn--thumbs${feedbackLike === 'dislike' ? 'chat-action-btn--disliked' : ''}`}
            aria-label="Не подобається"
            aria-describedby="chat-action-tooltip-thumbs-down"
            onClick={() => handleLike('dislike')}
          >
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 12 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="chat-action-icon"
              style={{ display: 'block' }}
            >
              <path
                d="M2.47304 0.454082L9.63849 0.454083C10.3352 0.454083 10.9 1.01887 10.9 1.71556L10.9 5.5C10.9 6.1967 10.3352 6.76148 9.63849 6.76148L8.42139 6.76148C7.99961 6.76148 7.60574 6.97227 7.37178 7.32321L5.55073 10.0548C5.34618 10.3616 5.00181 10.5459 4.63305 10.5459C3.95151 10.5459 3.43309 9.93394 3.54513 9.26168L3.71702 8.23034C3.84517 7.46143 3.25222 6.76148 2.47271 6.76148L1.71615 6.76148C0.920101 6.76148 0.323052 6.0332 0.47917 5.2526L1.23606 1.46817C1.35399 0.878519 1.87172 0.454082 2.47304 0.454082Z"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8.37701 6.76148L8.37701 0.454083" stroke="currentColor" strokeWidth="0.9" />
            </svg>
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
                width: '210px',
                padding: '8px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                boxShadow: 'none',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', minWidth: 0 }}>
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
                    flex: '1 1 0',
                    minWidth: 0,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #E0E0E0',
                    backgroundColor: '#F7F7F7',
                    color: '#2A2A2A',
                    fontSize: '14px',
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
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    padding: 0,
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: regeneratePrompt.trim() ? '#2A2A2A' : '#EDEDED',
                    color: regeneratePrompt.trim() ? '#FFFFFF' : '#ABABAB',
                    cursor: regeneratePrompt.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                    flexShrink: 0,
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
                  fontSize: '14px',
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
                  fontSize: '14px',
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
                  fontSize: '14px',
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
      <div
        className="chat-action-item-animate"
        style={{ display: 'inline-block', animationDelay: '280ms' }}
      >
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
            fontSize: '14px',
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
      {trailing ? (
        <div
          className="chat-action-item-animate"
          style={{ marginLeft: 'auto', animationDelay: '350ms' }}
        >
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
