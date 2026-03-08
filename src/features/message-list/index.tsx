'use client';

import { useEffect, useRef } from 'react';

import { ChatMessage } from '@/components/chat/ChatMessage';
import type { Message } from '@/types/chat';

export interface MessageListProps {
  messages?: Message[] | null;
  isAssistantTyping?: boolean;
  regeneratingMessageId?: string | null;
  onSuggestionClick?: (text: string) => void;
  onRegenerate?: (assistantMessageId: string, modifier?: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onSetActiveVersion?: (assistantMessageId: string, index: number) => void;
}

export function MessageList({
  messages: messagesProp,
  isAssistantTyping = false,
  regeneratingMessageId = null,
  onSuggestionClick,
  onRegenerate,
  onEditMessage,
  onSetActiveVersion,
}: MessageListProps) {
  const messages = messagesProp ?? [];
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAssistantTyping]);

  const lastMsg = messages[messages.length - 1];
  const lastIsEmptyAssistant = lastMsg?.role === 'assistant' && !(lastMsg.content ?? '').trim();
  const showTypingInsideLast = isAssistantTyping && lastIsEmptyAssistant;
  const showTypingAsSeparate = false;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '52px 0 138px 0',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
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
