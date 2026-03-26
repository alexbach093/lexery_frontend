'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { CopyIcon, EditIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { MessageAttachment, MessageVersion } from '@/types';

import { AssistantThinkingProcess } from './AssistantThinkingProcess';
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
  thinkingPreviewPinned?: boolean;
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
  thinkingPreviewPinned = false,
}: ChatMessageProps) {
  const attachmentsRef = useRef(attachments);
  const [userTooltipVisibleId, setUserTooltipVisibleId] = useState<UserMessageTooltipId>(null);
  const [userCopyFeedback, setUserCopyFeedback] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(content);
  const [editWidth, setEditWidth] = useState(320);
  const [manualThinkingProcessVisible, setManualThinkingProcessVisible] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const userMessageWrapperRef = useRef<HTMLDivElement>(null);
  const assistantMessageWrapperRef = useRef<HTMLDivElement>(null);
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
      const textarea = editTextareaRef.current;
      if (!textarea) return;
      textarea.focus();
      const end = textarea.value.length;
      textarea.setSelectionRange(end, end);
    });
    return () => cancelAnimationFrame(rafId);
  }, [isEditing]);

  useLayoutEffect(() => {
    if (!isEditing) return;
    const textarea = editTextareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const minHeight = 80;
    const maxHeight = Math.max(240, Math.min(window.innerHeight * 0.6, 480));
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [isEditing, editDraft]);

  useEffect(() => {
    const hasVersions = (versions?.length ?? 0) > 0;
    const rafId = requestAnimationFrame(() => {
      setActionRowVisible(!!hasVersions);
    });
    return () => cancelAnimationFrame(rafId);
  }, [versions?.length]);

  useEffect(() => {
    if (!manualThinkingProcessVisible) return;

    const rafId = requestAnimationFrame(() => {
      assistantMessageWrapperRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [manualThinkingProcessVisible]);

  if (role === 'user') {
    const USER_TOOLTIP_DELAY_MS = 900;

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
      const nextWidth = wrapper ? Math.max(wrapper.offsetWidth, 320) : 320;
      setEditWidth(nextWidth);
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
      'group flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-[#575757] transition-all duration-150 hover:bg-transparent active:scale-[0.92] active:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D5D5D] focus-visible:ring-offset-2 focus-visible:ring-offset-white';
    const userIconClasses =
      'block shrink-0 transition-[filter] duration-150 group-hover:[filter:brightness(0)_saturate(100%)_invert(0.45)]';

    if (isEditing) {
      return (
        <div
          className="ml-auto flex max-w-150 flex-col items-end gap-2.5 self-end"
          style={{ width: `${editWidth}px` }}
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
                <CopyIcon width={16} height={16} className={userIconClasses} aria-hidden="true" />
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
                <EditIcon width={16} height={16} className={userIconClasses} aria-hidden="true" />
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
  const showThinkingProcess = isTyping || thinkingPreviewPinned || manualThinkingProcessVisible;

  return (
    <MessageContainer role="assistant">
      <div ref={assistantMessageWrapperRef} className="relative w-full">
        {showThinkingProcess ? (
          <div className={cn('transition-all duration-300', content.trim() ? 'mb-8' : 'mb-0')}>
            <AssistantThinkingProcess
              isPinned={thinkingPreviewPinned || manualThinkingProcessVisible}
            />
          </div>
        ) : null}

        {content.trim() ? (
          <>
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
                  onViewProcess={() =>
                    setManualThinkingProcessVisible((currentValue) => !currentValue)
                  }
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
          </>
        ) : null}
      </div>
    </MessageContainer>
  );
}
