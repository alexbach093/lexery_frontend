'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { AiSuggestions } from '@/features/ai-suggestions';
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
  suggestions = [],
  attachments = [],
  onSuggestionClick,
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
    const hasVersions = (versions?.length ?? 0) > 0;
    const rafId = requestAnimationFrame(() => {
      setActionRowVisible(!!hasVersions);
    });
    return () => cancelAnimationFrame(rafId);
  }, [versions?.length]);

  if (role === 'user') {
    const iconSize = 16;
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

    if (isEditing) {
      return (
        <div
          style={{
            position: 'relative',
            alignSelf: 'flex-end',
            width: '100%',
            maxWidth: '400px',
            height: editSlotHeight,
            minHeight: editSlotHeight,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '400px',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '10px',
            }}
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
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: '18px',
                border: '1px solid #E0E0E0',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                lineHeight: '20px',
                color: '#2A2A2A',
                resize: 'none',
                minHeight: '80px',
                outline: 'none',
              }}
              aria-label="Редагувати повідомлення"
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E0E0E0',
                  background: '#fff',
                  fontSize: '14px',
                  color: '#2A2A2A',
                  cursor: 'pointer',
                }}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleDoneEdit}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2A2A2A',
                  fontSize: '14px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
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
            style={{
              display: 'inline-block',
              width: 'max-content',
              maxWidth: '600px',
              background: '#F5F5F5',
              ...(attachments.length === 1
                ? {
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '7px',
                    borderBottomRightRadius: '16px',
                    borderBottomLeftRadius: '16px',
                  }
                : attachments.length > 1
                  ? {
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                      borderBottomRightRadius: '7px',
                      borderBottomLeftRadius: '16px',
                    }
                  : { borderRadius: '16px' }),
              padding: '12px 14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
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
        {attachments.length > 1 ? <MessageAttachmentsMultiple attachments={attachments} /> : null}
        <div
          className="flex items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ flexShrink: 0, marginLeft: '-4px', gap: '8px' }}
          role="group"
          aria-label="Дії з повідомленням"
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
                onClick={handleStartEdit}
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
        <div style={{ width: '100%', position: 'relative' }}>
          <MessageMarkdown content={content} />
          {suggestions.length > 0 && onSuggestionClick && (
            <AiSuggestions suggestions={suggestions} onSuggestionClick={onSuggestionClick} />
          )}
          {versions && versions.length > 0 && (
            <div
              style={{
                opacity: actionRowVisible ? 1 : 0,
                transform: actionRowVisible ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              }}
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
