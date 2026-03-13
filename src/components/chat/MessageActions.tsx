'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

type TooltipId = 'copy' | 'thumbs-up' | 'thumbs-down' | 'refresh' | null;

export interface MessageActionsProps {
  content: string;
  onRegenerate?: (modifier?: string) => void;
  /** Element on the left in the row. */
  leading?: React.ReactNode;
  /** Element on the right in the row (e.g., History button). */
  trailing?: React.ReactNode;
}

/** Action icons row below AI response — copy, like, dislike, regenerate, "View process". */
export function MessageActions({ content, onRegenerate, leading, trailing }: MessageActionsProps) {
  const [tooltipVisibleId, setTooltipVisibleId] = useState<TooltipId>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [feedbackLike, setFeedbackLike] = useState<'like' | 'dislike' | null>(null);
  const [showThankYouTooltip, setShowThankYouTooltip] = useState(false);
  const [regeneratePopoverOpen, setRegeneratePopoverOpen] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const regenerateAnchorRef = useRef<HTMLDivElement>(null);
  const regeneratePopoverRef = useRef<HTMLDivElement>(null);

  const POPOVER_APPROX_HEIGHT = 200;
  const POPOVER_WIDTH = 210;
  const POPOVER_GAP = 6;
  const POPOVER_VIEWPORT_MARGIN = 8;
  const TOOLTIP_DELAY_MS = 1250;

  const updateRegeneratePopoverPosition = useCallback(() => {
    const anchor = regenerateAnchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popoverHeight = regeneratePopoverRef.current?.offsetHeight ?? POPOVER_APPROX_HEIGHT;

    const preferredTop =
      rect.top > popoverHeight + POPOVER_GAP + POPOVER_VIEWPORT_MARGIN
        ? rect.top - popoverHeight - POPOVER_GAP
        : rect.bottom + POPOVER_GAP;

    const maxTop = Math.max(
      POPOVER_VIEWPORT_MARGIN,
      viewportHeight - popoverHeight - POPOVER_VIEWPORT_MARGIN
    );
    const maxLeft = Math.max(
      POPOVER_VIEWPORT_MARGIN,
      viewportWidth - POPOVER_WIDTH - POPOVER_VIEWPORT_MARGIN
    );

    const nextTop = Math.min(Math.max(POPOVER_VIEWPORT_MARGIN, preferredTop), maxTop);
    const nextLeft = Math.min(
      Math.max(POPOVER_VIEWPORT_MARGIN, rect.right - POPOVER_WIDTH),
      maxLeft
    );

    setPopoverPos((prev) =>
      prev && prev.top === nextTop && prev.left === nextLeft
        ? prev
        : { top: nextTop, left: nextLeft }
    );
  }, []);

  const toggleRegeneratePopover = () => {
    setRegeneratePopoverOpen((open) => !open);
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

  useEffect(() => {
    if (!regeneratePopoverOpen) {
      queueMicrotask(() => setPopoverPos(null));
      return;
    }

    let frameId: number | null = null;
    const schedulePositionUpdate = () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        updateRegeneratePopoverPosition();
        frameId = null;
      });
    };

    schedulePositionUpdate();
    window.addEventListener('resize', schedulePositionUpdate);
    window.addEventListener('scroll', schedulePositionUpdate, true);

    const observer = new ResizeObserver(schedulePositionUpdate);
    if (regenerateAnchorRef.current) observer.observe(regenerateAnchorRef.current);
    if (regeneratePopoverRef.current) observer.observe(regeneratePopoverRef.current);

    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', schedulePositionUpdate);
      window.removeEventListener('scroll', schedulePositionUpdate, true);
      observer.disconnect();
    };
  }, [regeneratePopoverOpen, updateRegeneratePopoverPosition]);

  const runRegenerate = (modifier?: string) => {
    onRegenerate?.(modifier);
    setRegeneratePopoverOpen(false);
    setRegeneratePrompt('');
  };

  const copyVisible = tooltipVisibleId === 'copy' || copyFeedback;
  const thumbsUpVisible =
    tooltipVisibleId === 'thumbs-up' || (feedbackLike === 'like' && showThankYouTooltip);
  const thumbsDownVisible =
    tooltipVisibleId === 'thumbs-down' || (feedbackLike === 'dislike' && showThankYouTooltip);
  const refreshVisible = tooltipVisibleId === 'refresh' && !regeneratePopoverOpen;

  // Base styling properties
  const baseBtnClasses =
    'group flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-[#575757] transition-all duration-150 active:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const defaultIconHoverFilter =
    'block shrink-0 transition-[filter] duration-150 group-hover:[filter:brightness(0)_saturate(100%)_invert(0.45)]';

  const tooltipClasses =
    'absolute bottom-full left-1/2 z-10 mb-2 pointer-events-none whitespace-nowrap rounded-lg bg-muted px-3 py-1.5 font-sans text-xs font-medium leading-[1.3] text-muted-foreground shadow-none transition-all duration-150 ease-out';

  return (
    <div className="mt-3.5 flex items-center gap-2" role="group" aria-label="Дії з відповіддю">
      {leading}

      <div
        className="chat-action-icons-stagger flex items-center gap-2"
        onMouseLeave={hideTooltip}
        onBlurCapture={hideTooltip}
      >
        <div
          className="relative inline-flex"
          onMouseEnter={() => showTooltipAfterDelay('copy')}
          onFocusCapture={() => showTooltipAfterDelay('copy')}
        >
          <button
            type="button"
            className={cn(baseBtnClasses, 'hover:bg-transparent active:scale-[0.92]')}
            aria-label="Копіювати"
            aria-describedby="chat-action-tooltip-copy"
            onClick={handleCopy}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className={defaultIconHoverFilter}
            >
              <g transform="translate(8, 8) scale(1.23077) translate(-5.5, -6.5)">
                <path
                  d="M8.02285 0.454063H1.71573C1.01907 0.454063 0.454309 1.01882 0.454309 1.71549V8.65331"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.97715 4.23833C2.97715 3.54167 3.54191 2.97691 4.23858 2.97691H9.28427C9.98093 2.97691 10.5457 3.54167 10.5457 4.23833V10.5454C10.5457 11.2421 9.98093 11.8069 9.28427 11.8069H4.23858C3.54191 11.8069 2.97715 11.2421 2.97715 10.5454V4.23833Z"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </button>
          <span
            id="chat-action-tooltip-copy"
            role="tooltip"
            className={cn(
              tooltipClasses,
              copyVisible
                ? 'visible -translate-x-1/2 translate-y-0 opacity-100'
                : 'invisible -translate-x-1/2 translate-y-1 opacity-0'
            )}
          >
            {copyFeedback ? 'Скопійовано' : 'Копіювати'}
          </span>
        </div>

        <div
          className="relative inline-flex"
          onMouseEnter={() => showTooltipAfterDelay('thumbs-up')}
          onFocusCapture={() => showTooltipAfterDelay('thumbs-up')}
        >
          <button
            type="button"
            className={cn(
              baseBtnClasses,
              feedbackLike === 'like'
                ? 'bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/10 active:scale-100'
                : 'hover:bg-transparent hover:text-[#333] active:scale-[0.92]'
            )}
            aria-label="Подобається"
            aria-describedby="chat-action-tooltip-thumbs-up"
            onClick={() => handleLike('like')}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 12 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="block shrink-0"
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
            role="tooltip"
            className={cn(
              tooltipClasses,
              thumbsUpVisible
                ? 'visible -translate-x-1/2 translate-y-0 opacity-100'
                : 'invisible -translate-x-1/2 translate-y-1 opacity-0'
            )}
          >
            {feedbackLike === 'like' && showThankYouTooltip ? 'Дякуємо за відгук!' : 'Подобається'}
          </span>
        </div>

        <div
          className="relative inline-flex"
          onMouseEnter={() => showTooltipAfterDelay('thumbs-down')}
          onFocusCapture={() => showTooltipAfterDelay('thumbs-down')}
        >
          <button
            type="button"
            className={cn(
              baseBtnClasses,
              feedbackLike === 'dislike'
                ? 'bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10 active:scale-100'
                : 'hover:bg-transparent hover:text-[#333] active:scale-[0.92]'
            )}
            aria-label="Не подобається"
            aria-describedby="chat-action-tooltip-thumbs-down"
            onClick={() => handleLike('dislike')}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 12 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="block shrink-0"
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
            role="tooltip"
            className={cn(
              tooltipClasses,
              thumbsDownVisible
                ? 'visible -translate-x-1/2 translate-y-0 opacity-100'
                : 'invisible -translate-x-1/2 translate-y-1 opacity-0'
            )}
          >
            {feedbackLike === 'dislike' && showThankYouTooltip
              ? 'Дякуємо за відгук!'
              : 'Не подобається'}
          </span>
        </div>

        <div
          ref={regenerateAnchorRef}
          className="relative inline-flex"
          onMouseEnter={() => showTooltipAfterDelay('refresh')}
          onFocusCapture={() => showTooltipAfterDelay('refresh')}
        >
          <button
            type="button"
            className={cn(baseBtnClasses, 'hover:bg-transparent active:scale-[0.92]')}
            aria-label="Згенерувати знову"
            aria-expanded={regeneratePopoverOpen}
            aria-haspopup="dialog"
            aria-describedby="chat-action-tooltip-refresh"
            onClick={toggleRegeneratePopover}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 13 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className={defaultIconHoverFilter}
            >
              <path
                d="M3.26939 9.73042C5.38619 11.8472 8.8182 11.8472 10.935 9.73042C13.0518 7.61362 13.0518 4.18161 10.935 2.06481C8.8182 -0.0519925 5.38619 -0.0519925 3.26939 2.06481C2.21031 3.12389 1.68111 4.5122 1.68179 5.90029L1.68178 7.10215"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0.477455 5.89761L1.68199 7.10215L2.88652 5.89762"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span
            id="chat-action-tooltip-refresh"
            role="tooltip"
            className={cn(
              tooltipClasses,
              refreshVisible
                ? 'visible -translate-x-1/2 translate-y-0 opacity-100'
                : 'invisible -translate-x-1/2 translate-y-1 opacity-0'
            )}
          >
            Згенерувати знову
          </span>
          {regeneratePopoverOpen &&
            popoverPos &&
            createPortal(
              <div
                ref={regeneratePopoverRef}
                role="dialog"
                aria-label="Змінити відповідь"
                className="fixed z-1000 flex w-52.5 flex-col gap-1 rounded-[10px] border border-[#E0E0E0] bg-white p-2 shadow-none"
                style={{
                  top: popoverPos.top,
                  left: popoverPos.left,
                }}
              >
                <div className="flex min-w-0 items-center gap-1.5">
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
                    className="min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#F7F7F7] px-2.5 py-1.5 text-sm text-[#2A2A2A] outline-none"
                    aria-label="Текст зміни відповіді"
                  />
                  <button
                    type="button"
                    disabled={!regeneratePrompt.trim()}
                    onClick={() =>
                      regeneratePrompt.trim() && runRegenerate(regeneratePrompt.trim())
                    }
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-none p-0 transition-colors duration-150',
                      regeneratePrompt.trim()
                        ? 'cursor-pointer bg-[#2A2A2A] text-white'
                        : 'cursor-not-allowed bg-[#EDEDED] text-[#ABABAB]'
                    )}
                    aria-label="Надіслати"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 37 37"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-colors duration-150"
                    >
                      <path
                        d="M24.8618 13.2114L24.8618 22.2812C24.8618 22.4222 24.8341 22.5618 24.7801 22.692C24.7262 22.8222 24.6471 22.9405 24.5475 23.0402C24.4478 23.1398 24.3295 23.2189 24.1993 23.2728C24.0691 23.3268 23.9295 23.3545 23.7886 23.3545C23.6476 23.3545 23.5081 23.3268 23.3779 23.2728C23.2476 23.2189 23.1293 23.1398 23.0297 23.0402C22.93 22.9405 22.8509 22.8222 22.797 22.692C22.7431 22.5618 22.7153 22.4222 22.7153 22.2812L22.7229 15.7888L13.9629 24.5487C13.7625 24.7492 13.4906 24.8618 13.2071 24.8618C12.9236 24.8618 12.6517 24.7492 12.4513 24.5487C12.2508 24.3482 12.1382 24.0764 12.1382 23.7929C12.1382 23.5094 12.2508 23.2375 12.4513 23.0371L21.2112 14.2771L14.7187 14.2847C14.4341 14.2847 14.1611 14.1716 13.9598 13.9703C13.7586 13.7691 13.6455 13.4961 13.6455 13.2114C13.6455 12.9268 13.7586 12.6538 13.9598 12.4525C14.1611 12.2512 14.4341 12.1382 14.7187 12.1382L23.7886 12.1382C23.9297 12.1376 24.0695 12.165 24.2 12.2187C24.3305 12.2724 24.449 12.3514 24.5488 12.4512C24.6485 12.551 24.7276 12.6695 24.7813 12.8C24.835 12.9305 24.8624 13.0703 24.8618 13.2114Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
                <div className="my-0.5 h-px bg-[#E0E0E0]" />
                <button
                  type="button"
                  onClick={() => runRegenerate()}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-1.5 text-left text-sm text-[#2A2A2A] transition-colors duration-150 hover:bg-[#f7f7f7]"
                >
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 13 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="block shrink-0 opacity-90"
                    aria-hidden
                  >
                    <path
                      d="M3.26939 9.73042C5.38619 11.8472 8.8182 11.8472 10.935 9.73042C13.0518 7.61362 13.0518 4.18161 10.935 2.06481C8.8182 -0.0519925 5.38619 -0.0519925 3.26939 2.06481C2.21031 3.12389 1.68111 4.5122 1.68179 5.90029L1.68178 7.10215"
                      stroke="currentColor"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M0.477455 5.89761L1.68199 7.10215L2.88652 5.89762"
                      stroke="currentColor"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Спробувати знову
                </button>
                <button
                  type="button"
                  onClick={() => runRegenerate('Додай більше деталей')}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-1.5 text-left text-sm text-[#2A2A2A] transition-colors duration-150 hover:bg-[#f7f7f7]"
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
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-1.5 text-left text-sm text-[#2A2A2A] transition-colors duration-150 hover:bg-[#f7f7f7]"
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
              </div>,
              document.body
            )}
        </div>
      </div>

      <div className="chat-action-item-animate inline-block" style={{ animationDelay: '280ms' }}>
        <button
          type="button"
          className="ml-1.5 h-auto w-auto cursor-pointer rounded-md border-none bg-transparent px-3 py-1 font-sans text-sm font-normal text-[#9A9A9A] transition-colors duration-150 hover:bg-transparent hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
          aria-label="Переглянути процес"
          title="Переглянути процес"
        >
          Переглянути процес
        </button>
      </div>

      {trailing ? (
        <div className="chat-action-item-animate ml-auto" style={{ animationDelay: '350ms' }}>
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
