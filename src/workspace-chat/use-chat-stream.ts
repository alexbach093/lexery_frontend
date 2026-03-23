import { useCallback, useRef, useState } from 'react';

import type { Message } from '@/types';

import { finalizeAssistantMessage, type ApiMessage } from './helpers';

interface UseChatStreamProps {
  commitMessages: (messages: Message[]) => void;
  persistExistingChat: (chatId: string, messages: Message[]) => Promise<void>;
  currentChatIdRef: React.MutableRefObject<string | null>;
}

export function useChatStream({
  commitMessages,
  persistExistingChat,
  currentChatIdRef,
}: UseChatStreamProps) {
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [isStoppingGeneration, setIsStoppingGeneration] = useState(false);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);

  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const streamingChatIdRef = useRef<string | null>(null);

  const handleStopGeneration = useCallback(() => {
    setIsStoppingGeneration(true);
    streamingChatIdRef.current = null;
    const activeReader = streamReaderRef.current;
    streamReaderRef.current = null;
    void activeReader?.cancel().catch(() => undefined);
    streamAbortControllerRef.current?.abort();
    setIsAssistantTyping(false);
    setRegeneratingMessageId(null);
  }, []);

  const streamChatResponse = useCallback(
    (
      chatId: string,
      messagesForApi: ApiMessage[],
      assistantMessageId: string,
      initialMessages: Message[],
      controller: AbortController,
      signal?: AbortSignal,
      options?: {
        modifier?: string;
        appendVersion?: boolean;
        onComplete?: () => void;
        persistDuringStream?: boolean;
      }
    ) => {
      let streamMessages = initialMessages;
      let queuedPersistedMessages: Message[] | null = null;
      let persistInFlight = false;
      const isCurrentController = () => streamAbortControllerRef.current === controller;

      const flushPersistedMessages = () => {
        if (persistInFlight || !queuedPersistedMessages) return;
        const nextMessages = queuedPersistedMessages;
        queuedPersistedMessages = null;
        persistInFlight = true;
        void persistExistingChat(chatId, nextMessages)
          .catch(() => undefined)
          .finally(() => {
            persistInFlight = false;
            flushPersistedMessages();
          });
      };

      const schedulePersistedMessages = (nextMessages: Message[]) => {
        queuedPersistedMessages = nextMessages;
        flushPersistedMessages();
      };

      const clearCurrentStream = () => {
        if (!isCurrentController()) return false;
        streamAbortControllerRef.current = null;
        streamReaderRef.current = null;
        if (streamingChatIdRef.current === chatId) {
          streamingChatIdRef.current = null;
        }
        setIsStoppingGeneration(false);
        return true;
      };

      const completeVisibleStream = () => {
        if (currentChatIdRef.current === chatId) {
          setIsAssistantTyping(false);
          options?.onComplete?.();
        }
      };

      const syncActiveChatMessages = (nextMessages: Message[]) => {
        streamMessages = nextMessages;
        if (currentChatIdRef.current === chatId && isCurrentController()) {
          commitMessages(nextMessages);
        }
      };

      const finalizeVisibleMessages = (nextMessages: Message[]) => {
        if (!clearCurrentStream()) return;
        if (currentChatIdRef.current === chatId) {
          commitMessages(nextMessages);
        }
        completeVisibleStream();
        schedulePersistedMessages(nextMessages);
      };

      const buildInterruptedMessages = (errorContent?: string | null) =>
        streamMessages.flatMap((message) => {
          if (message.id !== assistantMessageId || message.role !== 'assistant') return [message];
          const trimmedContent = (message.content ?? '').trim();

          if (errorContent == null && trimmedContent.length === 0) {
            if (options?.appendVersion && (message.versions?.length ?? 0) > 0) {
              const versionIndex = Math.max(
                0,
                Math.min(
                  message.activeVersionIndex ?? message.versions!.length - 1,
                  message.versions!.length - 1
                )
              );
              return [
                {
                  ...message,
                  content: message.versions![versionIndex].content,
                  activeVersionIndex: versionIndex,
                },
              ];
            }
            return [];
          }

          return [
            finalizeAssistantMessage(message, {
              content: trimmedContent || errorContent || 'Немає відповіді.',
              modifier: options?.modifier,
              appendVersion: options?.appendVersion,
              includeSuggestions: false,
            }),
          ];
        });

      fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi }),
        signal,
      })
        .then(async (response) => {
          if (!response.ok)
            throw new Error((await response.json().catch(() => ({})))?.error ?? 'Помилка запиту');
          const reader = response.body?.getReader();
          if (!reader) throw new Error('Немає потоку відповіді');
          if (isCurrentController()) streamReaderRef.current = reader;

          const decoder = new TextDecoder();
          let buffer = '';
          let streamDone = false;
          let pendingContent = '';

          const finalize = () => {
            const nextMessages = streamMessages.map((msg) =>
              msg.id === assistantMessageId && msg.role === 'assistant'
                ? finalizeAssistantMessage(msg, {
                    content: (msg.content ?? '').trim() || 'Немає відповіді.',
                    modifier: options?.modifier,
                    appendVersion: options?.appendVersion,
                    includeSuggestions: true,
                  })
                : msg
            );
            finalizeVisibleMessages(nextMessages);
          };

          const flushPendingContent = () => {
            if (!pendingContent) return;
            const chunkToAppend = pendingContent;
            pendingContent = '';
            const nextMessages = streamMessages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: (msg.content ?? '') + chunkToAppend }
                : msg
            );
            syncActiveChatMessages(nextMessages);
            if (options?.persistDuringStream) schedulePersistedMessages(nextMessages);
          };

          try {
            while (!streamDone) {
              const { done, value: chunk } = await reader.read();
              if (done) break;
              buffer += decoder.decode(chunk, { stream: true });
              const parts = buffer.split('\n\n');
              buffer = parts.pop() ?? '';

              for (const line of parts) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6);
                if (data === '[DONE]') {
                  streamDone = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.error) throw new Error(parsed.error);
                  if (typeof parsed.content === 'string' && parsed.content.length > 0) {
                    pendingContent += parsed.content;
                    flushPendingContent();
                  }
                } catch {}
              }
            }
          } finally {
            flushPendingContent();
          }

          if (streamDone && pendingContent.length === 0) finalize();
          else if (!streamDone) finalizeVisibleMessages(buildInterruptedMessages(null));
        })
        .catch((error) => {
          const isAbortError = error instanceof Error && error.name === 'AbortError';
          const nextContent = isAbortError
            ? null
            : `**Помилка:** ${error instanceof Error ? error.message : 'Помилка'}`;
          finalizeVisibleMessages(buildInterruptedMessages(nextContent));
        });
    },
    [commitMessages, persistExistingChat, currentChatIdRef]
  );

  return {
    isAssistantTyping,
    setIsAssistantTyping,
    isStoppingGeneration,
    setIsStoppingGeneration,
    regeneratingMessageId,
    setRegeneratingMessageId,
    streamChatResponse,
    handleStopGeneration,
    streamAbortControllerRef,
    streamingChatIdRef,
  };
}
