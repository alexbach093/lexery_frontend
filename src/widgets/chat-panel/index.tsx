'use client';

import { MessageList } from '@/features/message-list';
import { cn } from '@/lib/utils'; // Path to your cn utility
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
  /** Optional container class name */
  className?: string;
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
  className,
}: ChatPanelProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)}>
      {/* Scrollable area for message history */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
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

      {/* Input slot remains at the bottom of the container */}
      {inputSlot}
    </div>
  );
}
