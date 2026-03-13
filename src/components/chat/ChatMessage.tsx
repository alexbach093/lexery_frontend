'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { MessageAttachment, MessageVersion } from '@/types/chat';

import { MessageActions } from './MessageActions';
import { MessageAttachments, MessageAttachmentsMultiple } from './MessageAttachments';
import { MessageContainer } from './MessageContainer';
import { MessageMarkdown } from './MessageMarkdown';
import { MessageVersions } from './MessageVersions';

type UserMessageTooltipId = 'copy' | 'edit' | null;

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggestions?: string[];
  attachments?: MessageAttachment[];
  onSuggestionClick?: (text: string) => void;
  isTyping?: boolean;
  onRegenerate?: (modifier?: string) => void;
  messageId?: string;
  onEditMessage?: (messageId: string, newContent: string) => void;
  versions?: MessageVersion[];
  activeVersionIndex?: number;
  onSetActiveVersion?: (index: number) => void;
}

/** Typing indicator: pulsing dots. */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-0" aria-live="polite" aria-label="Набір відповіді">
      <span className="h-1.5 w-1.5 animate-[chat-typing_1.4s_ease-in-out_infinite_both] rounded-full bg-[#616161]" />
      <span className="h-1.5 w-1.5 animate-[chat-typing_1.4s_ease-in-out_0.2s_infinite_both] rounded-full bg-[#616161]" />
      <span className="h-1.5 w-1.5 animate-[chat-typing_1.4s_ease-in-out_0.4s_infinite_both] rounded-full bg-[#616161]" />
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
  messageId,
  onEditMessage,
  versions,
  activeVersionIndex = 0,
  onSetActiveVersion,
}: ChatMessageProps) {
  const attachmentsRef = useRef(attachments);
  const [userTooltipVisibleId, setUserTooltipVisibleId] = useState<UserMessageTooltipId>(null);
  const [userCopyFeedback, setUserCopyFeedback] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(content);
  const [editSlotHeight, setEditSlotHeight] = useState(60);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editBlockRef = useRef<HTMLDivElement>(null);
  const userMessageWrapperRef = useRef<HTMLDivElement>(null);
  const editBlockHeightRef = useRef<number>(0);
  const [actionRowVisible, setActionRowVisible] = useState(false);
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

  useEffect(() => {
    if (!isEditing) return;
    const rafId = requestAnimationFrame(() => {
      setEditDraft(content);
      editTextareaRef.current?.focus();
    });
    return () => cancelAnimationFrame(rafId);
  }, [isEditing, content]);

  useEffect(() => {
    if (!isEditing) return;
    const block = editBlockRef.current;
    if (!block) return;

    const syncEditSlotHeight = () => {
      const nextHeight = Math.max(editBlockHeightRef.current || 0, block.offsetHeight);
      setEditSlotHeight(nextHeight);
    };

    syncEditSlotHeight();

    const resizeObserver = new ResizeObserver(() => {
      syncEditSlotHeight();
    });
    resizeObserver.observe(block);

    return () => resizeObserver.disconnect();
  }, [isEditing, editDraft]);

  useEffect(() => {
    const hasVersions = (versions?.length ?? 0) > 0;
    const rafId = requestAnimationFrame(() => {
      setActionRowVisible(!!hasVersions);
    });
    return () => cancelAnimationFrame(rafId);
  }, [versions?.length]);

  if (role === 'user') {
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

    const handleStartEdit = () => {
      const wrapper = userMessageWrapperRef.current;
      const h = wrapper ? wrapper.offsetHeight : 60;
      editBlockHeightRef.current = h;
      setEditSlotHeight(h);
      setEditDraft(content);
      setIsEditing(true);
    };

    const handleCancelEdit = () => setIsEditing(false);

    const handleDoneEdit = () => {
      if (!messageId || !onEditMessage) return;
      const trimmed = editDraft.trim();
      if (trimmed === '') return;
      onEditMessage(messageId, trimmed);
      setIsEditing(false);
    };

    // Style variables for repeating user action buttons
    const userBtnClasses =
      'group flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-[#575757] transition-all duration-150 hover:bg-transparent active:scale-[0.92] active:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 focus-visible:ring-offset-white';
    const userIconClasses =
      'block shrink-0 transition-[filter] duration-150 group-hover:[filter:brightness(0)_saturate(100%)_invert(0.45)]';

    if (isEditing) {
      return (
        <div
          className="relative w-full max-w-100 self-end overflow-visible"
          style={{
            height: editSlotHeight,
            minHeight: editSlotHeight,
          }}
        >
          <div
            ref={editBlockRef}
            className="absolute top-0 right-0 z-20 flex w-full max-w-100 flex-col items-end gap-2.5"
          >
            <textarea
              ref={editTextareaRef}
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleDoneEdit();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelEdit();
                }
              }}
              rows={3}
              className="box-border min-h-20 w-full resize-none rounded-[18px] border border-[#E0E0E0] px-3.5 py-3 font-sans text-[15px] leading-5 text-[#2A2A2A] outline-none"
              aria-label="Редагувати повідомлення"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="cursor-pointer rounded-md border border-[#E0E0E0] bg-white px-3 py-1.5 text-sm text-[#2A2A2A] transition-colors hover:bg-gray-50"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleDoneEdit}
                className="cursor-pointer rounded-md border-none bg-[#2A2A2A] px-3 py-1.5 text-sm text-white transition-colors hover:bg-black"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <MessageContainer role="user" className="group" innerRef={userMessageWrapperRef}>
        {attachments.length === 1 ? <MessageAttachments attachments={attachments} /> : null}
        {content ? (
          <div
            className={cn(
              'box-border inline-block w-max max-w-150 bg-[#F5F5F5] px-3.5 py-3 font-sans text-[15px] leading-5 font-normal tracking-[0.13px] wrap-break-word text-black',
              attachments.length === 1
                ? 'rounded-tl-2xl rounded-tr-[7px] rounded-b-2xl'
                : attachments.length > 1
                  ? 'rounded-l-2xl rounded-tr-2xl rounded-br-[7px]'
                  : 'rounded-2xl'
            )}
          >
            {content}
          </div>
        ) : null}
        {attachments.length > 1 ? <MessageAttachmentsMultiple attachments={attachments} /> : null}

        <div
          className="-ml-1 flex shrink-0 items-center gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          role="group"
          aria-label="Дії з повідомленням"
        >
          <div
            className="flex items-center gap-2"
            onMouseLeave={hideUserTooltip}
            onBlurCapture={hideUserTooltip}
          >
            <div
              className="relative inline-flex"
              onMouseEnter={() => showUserTooltipAfterDelay('copy')}
              onFocusCapture={() => showUserTooltipAfterDelay('copy')}
            >
              <button
                type="button"
                className={userBtnClasses}
                aria-label="Копіювати"
                aria-describedby="user-msg-tooltip-copy"
                onClick={handleUserCopy}
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                  className={userIconClasses}
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
                id="user-msg-tooltip-copy"
                role="tooltip"
                className={cn(
                  'bg-muted text-muted-foreground pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 rounded-lg px-3 py-1.5 font-sans text-xs leading-[1.3] font-medium whitespace-nowrap shadow-none transition-all duration-150 ease-out',
                  userTooltipVisibleId === 'copy' || userCopyFeedback
                    ? 'visible -translate-x-1/2 translate-y-0 opacity-100'
                    : 'invisible -translate-x-1/2 translate-y-1 opacity-0'
                )}
              >
                {userCopyFeedback ? 'Скопійовано' : 'Копіювати'}
              </span>
            </div>

            <div
              className="relative inline-flex"
              onMouseEnter={() => showUserTooltipAfterDelay('edit')}
              onFocusCapture={() => showUserTooltipAfterDelay('edit')}
            >
              <button
                type="button"
                className={userBtnClasses}
                aria-label="Редагувати"
                aria-describedby="user-msg-tooltip-edit"
                onClick={handleStartEdit}
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                  className={userIconClasses}
                >
                  <path
                    d="M6.71162 3.80806L9.19185 6.28829M3.91069 12.1895L12.1895 3.91072C12.5886 3.51157 12.5886 2.86443 12.1895 2.46528L10.5346 0.810425C10.1355 0.41128 9.48834 0.41128 9.08919 0.810424L0.810395 9.08922C0.618719 9.2809 0.511037 9.54087 0.511037 9.81194V11.4668C0.511037 12.0313 0.968635 12.4889 1.53311 12.4889H3.18797C3.45904 12.4889 3.71901 12.3812 3.91069 12.1895Z"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span
                id="user-msg-tooltip-edit"
                role="tooltip"
                className={cn(
                  'bg-muted text-muted-foreground pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 rounded-lg px-3 py-1.5 font-sans text-xs leading-[1.3] font-medium whitespace-nowrap shadow-none transition-all duration-150 ease-out',
                  userTooltipVisibleId === 'edit'
                    ? 'visible -translate-x-1/2 translate-y-0 opacity-100'
                    : 'invisible -translate-x-1/2 translate-y-1 opacity-0'
                )}
              >
                Редагувати
              </span>
            </div>
          </div>
        </div>
      </MessageContainer>
    );
  }

  // Assistant
  const showHistoryButton = versions && versions.length > 1;

  return (
    <MessageContainer role="assistant">
      {isTyping ? (
        <TypingIndicator />
      ) : (
        <div className="relative w-full">
          <MessageMarkdown content={content} />
          {versions && versions.length > 0 && (
            <div
              className={cn(
                'transition-all duration-400 ease-out',
                actionRowVisible ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
              )}
            >
              <MessageActions
                content={content}
                onRegenerate={onRegenerate}
                trailing={
                  showHistoryButton && versions ? (
                    <MessageVersions
                      versions={versions}
                      activeVersionIndex={activeVersionIndex}
                      onVersionChange={(i) => onSetActiveVersion?.(i)}
                    />
                  ) : null
                }
              />
            </div>
          )}
        </div>
      )}
    </MessageContainer>
  );
}
