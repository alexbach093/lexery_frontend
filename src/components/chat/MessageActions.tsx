'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  CopyIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RefreshIcon,
  SendIcon,
  PlusIcon,
  MinusIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

type TooltipId = 'copy' | 'thumbs-up' | 'thumbs-down' | 'refresh' | null;

export interface MessageActionsProps {
  content: string;
  onRegenerate?: (modifier?: string) => void;
  onViewProcess?: () => void;
  /** Element on the left in the row. */
  leading?: React.ReactNode;
  /** Element on the right in the row (e.g., History button). */
  trailing?: React.ReactNode;
}

/** Action icons row below AI response — copy, like, dislike, regenerate, "View process". */
export function MessageActions({
  content,
  onRegenerate,
  onViewProcess,
  leading,
  trailing,
}: MessageActionsProps) {
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
  const TOOLTIP_DELAY_MS = 900;

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
    'group flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-[#575757] transition-all duration-150 active:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D5D5D] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

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
            <CopyIcon width={16} height={16} className={defaultIconHoverFilter} aria-hidden />
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
                ? 'text-[#16a34a] hover:bg-transparent active:scale-100'
                : 'hover:bg-transparent hover:text-[#333] active:scale-[0.92]'
            )}
            aria-label="Подобається"
            aria-describedby="chat-action-tooltip-thumbs-up"
            onClick={() => handleLike('like')}
          >
            <ThumbsUpIcon width={16} height={16} className="block shrink-0" aria-hidden />
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
                ? 'text-[#ef4444] hover:bg-transparent active:scale-100'
                : 'hover:bg-transparent hover:text-[#333] active:scale-[0.92]'
            )}
            aria-label="Не подобається"
            aria-describedby="chat-action-tooltip-thumbs-down"
            onClick={() => handleLike('dislike')}
          >
            <ThumbsDownIcon width={16} height={16} className="block shrink-0" aria-hidden />
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
            <RefreshIcon width={16} height={16} className={defaultIconHoverFilter} aria-hidden />
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
                    <SendIcon
                      width={24}
                      height={24}
                      className="transition-colors duration-150"
                      aria-hidden
                    />
                  </button>
                </div>
                <div className="my-0.5 h-px bg-[#E0E0E0]" />
                <button
                  type="button"
                  onClick={() => runRegenerate()}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-1.5 text-left text-sm text-[#2A2A2A] transition-colors duration-150 hover:bg-[#f7f7f7]"
                >
                  <RefreshIcon
                    width={14}
                    height={14}
                    className="block shrink-0 opacity-90"
                    aria-hidden
                  />
                  Спробувати знову
                </button>
                <button
                  type="button"
                  onClick={() => runRegenerate('Додай більше деталей')}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-1.5 text-left text-sm text-[#2A2A2A] transition-colors duration-150 hover:bg-[#f7f7f7]"
                >
                  <PlusIcon width={14} height={14} aria-hidden />
                  Додати деталі
                </button>
                <button
                  type="button"
                  onClick={() => runRegenerate('Зроби відповідь коротшою')}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-1.5 text-left text-sm text-[#2A2A2A] transition-colors duration-150 hover:bg-[#f7f7f7]"
                >
                  <MinusIcon width={14} height={14} aria-hidden />
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
          className="ml-1.5 h-auto w-auto cursor-pointer rounded-md border-none bg-transparent px-3 py-1 font-sans text-sm font-normal text-[#9A9A9A] transition-colors duration-150 hover:bg-transparent hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#5D5D5D] focus-visible:outline-none focus-visible:ring-inset"
          aria-label="Переглянути процес"
          onClick={onViewProcess}
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
