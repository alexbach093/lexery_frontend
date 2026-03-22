'use client';

import { useEffect, useRef } from 'react';

import { ChatMessage } from '@/components/chat/ChatMessage';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

export interface MessageListProps {
  messages?: Message[] | null;
  isAssistantTyping?: boolean;
  regeneratingMessageId?: string | null;
  onSuggestionClick?: (text: string) => void;
  onRegenerate?: (assistantMessageId: string, modifier?: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onSetActiveVersion?: (assistantMessageId: string, index: number) => void;
  /** Optional custom classes for the list container */
  className?: string;
}

/** Message list container: renders the sequence of ChatMessages and handles auto-scrolling. */
export function MessageList({
  messages: messagesProp,
  isAssistantTyping = false,
  regeneratingMessageId = null,
  onSuggestionClick,
  onRegenerate,
  onEditMessage,
  onSetActiveVersion,
  className,
}: MessageListProps) {
  const messages = messagesProp ?? [];
  const listEndRef = useRef<HTMLDivElement>(null);

  const lastMsg = messages[messages.length - 1];
  const lastMessageSignature = `${lastMsg?.id ?? ''}:${lastMsg?.role ?? ''}:${lastMsg?.content ?? ''}`;

  // Keep streamed responses pinned to the latest content while they grow.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: isAssistantTyping ? 'auto' : 'smooth' });
  }, [isAssistantTyping, lastMessageSignature, messages.length]);

  const lastIsEmptyAssistant = lastMsg?.role === 'assistant' && !(lastMsg.content ?? '').trim();
  const showTypingInsideLast = isAssistantTyping && lastIsEmptyAssistant;
  const showTypingAsSeparate = false;

  return (
    <div className={cn('mx-auto box-border flex w-full max-w-180 flex-col gap-6 pt-13', className)}>
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
          suggestions={msg.suggestions}
          attachments={msg.attachments}
          onSuggestionClick={onSuggestionClick}
          onRegenerate={
            msg.role === 'assistant'
              ? (modifier?: string) => onRegenerate?.(msg.id, modifier)
              : undefined
          }
          isTyping={
            (msg.role === 'assistant' &&
              msg.id === regeneratingMessageId &&
              !(msg.content ?? '').trim()) ||
            (showTypingInsideLast && lastMsg?.id === msg.id)
          }
          messageId={msg.id}
          onEditMessage={msg.role === 'user' ? onEditMessage : undefined}
          versions={msg.role === 'assistant' ? msg.versions : undefined}
          activeVersionIndex={msg.role === 'assistant' ? msg.activeVersionIndex : undefined}
          onSetActiveVersion={
            msg.role === 'assistant'
              ? (index: number) => onSetActiveVersion?.(msg.id, index)
              : undefined
          }
        />
      ))}
      {showTypingAsSeparate && <ChatMessage role="assistant" content="" isTyping />}
      <div ref={listEndRef} aria-hidden="true" />
    </div>
  );
}
