'use client';

import { MessageList } from '@/features/message-list';
import type { Message } from '@/types/chat';

export interface ChatPanelProps {
  messages: Message[];
  isAssistantTyping?: boolean;
  regeneratingMessageId?: string | null;
  onSuggestionClick?: (text: string) => void;
  onRegenerate?: (assistantMessageId: string, modifier?: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onSetActiveVersion?: (assistantMessageId: string, index: number) => void;
  /** Sticky input area (textarea + buttons) — rendered below scrollable messages */
  inputSlot: React.ReactNode;
}

/** Composite chat UI: message list + sticky input area. */
export function ChatPanel({
  messages,
  isAssistantTyping,
  regeneratingMessageId,
  onSuggestionClick,
  onRegenerate,
  onEditMessage,
  onSetActiveVersion,
  inputSlot,
}: ChatPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <MessageList
          messages={messages}
          isAssistantTyping={isAssistantTyping}
          regeneratingMessageId={regeneratingMessageId}
          onSuggestionClick={onSuggestionClick}
          onRegenerate={onRegenerate}
          onEditMessage={onEditMessage}
          onSetActiveVersion={onSetActiveVersion}
        />
      </div>
      {inputSlot}
    </div>
  );
}
