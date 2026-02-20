'use client';

import { useEffect, useRef } from 'react';

import type { Message } from '@/types/chat';

import { ChatMessage } from './ChatMessage';

export interface ChatMessageListProps {
  messages: Message[];
  /** When true, show typing indicator as last item. */
  isAssistantTyping?: boolean;
  onSuggestionClick?: (text: string) => void;
}

export function ChatMessageList({
  messages,
  isAssistantTyping = false,
  onSuggestionClick,
}: ChatMessageListProps) {
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAssistantTyping]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '72px',
        padding: '52px 0 138px 0',
        maxWidth: '738px',
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
        />
      ))}
      {isAssistantTyping && <ChatMessage role="assistant" content="" isTyping />}
      <div ref={listEndRef} aria-hidden="true" />
    </div>
  );
}
