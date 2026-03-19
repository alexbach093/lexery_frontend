'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AttachedFile } from '@/features/attachments';
import { getFileFormatIdOrExt, getFormatOptionForFile } from '@/features/attachments';
import {
  CHAT_TEXTAREA_MIN_HEIGHT,
  CHAT_TEXTAREA_MAX_HEIGHT,
  HOME_TEXTAREA_MIN_HEIGHT,
  HOME_TEXTAREA_MAX_HEIGHT,
} from '@/features/chat-input';
import { DEFAULT_CHAT_USER_ID, dispatchChatStoreUpdated } from '@/lib/chat-library';
import { getChatRepository } from '@/lib/chat-repository';
import { messagesToStoredMessages, storedMessagesToMessages } from '@/lib/chat-session-mappers';
import type { Message, MessageAttachment, MessageVersion, StoredChatSession } from '@/types';

const HISTORY_TITLE_MAX_LENGTH = 60;
const ASSISTANT_SUGGESTIONS = ['Детальніше', 'Ще приклад'] as const;

/** Подія для відкриття нового чату (кнопка «Новий чат» у сайдбарі). */
export const WORKSPACE_START_NEW_CHAT_EVENT = 'workspace-start-new-chat';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function buildHistoryTitle(text: string): string {
  const raw = text.trim();
  if (!raw) return 'Новий чат';
  return (
    raw.slice(0, HISTORY_TITLE_MAX_LENGTH) + (raw.length > HISTORY_TITLE_MAX_LENGTH ? '…' : '')
  );
}

function buildMessageAttachments(files: AttachedFile[]): MessageAttachment[] | undefined {
  if (files.length === 0) return undefined;

  return files.map((item) => ({
    name: item.file.name,
    size: item.file.size,
    previewUrl:
      item.file.type.startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/i.test(item.file.name)
        ? URL.createObjectURL(item.file)
        : null,
    type: item.file.type,
    blob: item.file,
  }));
}

function finalizeAssistantMessage(
  message: Message,
  options: {
    content: string;
    modifier?: string;
    appendVersion?: boolean;
    includeSuggestions?: boolean;
  }
): Message {
  const createdAt = new Date().toISOString();
  const nextVersion: MessageVersion = {
    content: options.content,
    createdAt,
    modifier: options.modifier,
  };
  const existingVersions =
    message.versions?.length && options.appendVersion
      ? message.versions.map((version) => ({ ...version }))
      : options.appendVersion && message.content.trim()
        ? [{ content: message.content, createdAt }]
        : [];
  const versions = options.appendVersion ? [...existingVersions, nextVersion] : [nextVersion];

  return {
    ...message,
    content: options.content,
    versions,
    activeVersionIndex: versions.length - 1,
    suggestions: options.includeSuggestions ? [...ASSISTANT_SUGGESTIONS] : message.suggestions,
  };
}

type ApiMessage = { role: 'user' | 'assistant'; content: string };

export function useWorkspaceChat(onReady?: () => void) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repository = useMemo(() => getChatRepository(), []);
  const activeChatIdFromUrl = searchParams.get('chat');

  const [currentChatId, setCurrentChatId] = useState<string | null>(activeChatIdFromUrl);
  const [isHydratingChat, setIsHydratingChat] = useState<boolean>(activeChatIdFromUrl != null);
  const [value, setValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  const [tipsButtonCompact, setTipsButtonCompact] = useState(false);
  const [filesOverflow, setFilesOverflow] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [expandButtonClosing, setExpandButtonClosing] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [systemPromptEditorOpen, setSystemPromptEditorOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);
  const fileListScrollRef = useRef<HTMLDivElement>(null);
  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const expandCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrationRequestIdRef = useRef(0);
  const skipHydrationChatIdRef = useRef<string | null>(null);
  const systemPromptRef = useRef(systemPrompt);
  const messagesRef = useRef<Message[]>([]);

  const isEmpty = targetValue.trim().length === 0;
  const isGenerationInProgress = isAssistantTyping || regeneratingMessageId != null;
  const canSend = (!isEmpty || attachedFiles.length > 0) && !isGenerationInProgress;
  const hasMessages = (messages?.length ?? 0) > 0;

  useEffect(() => {
    systemPromptRef.current = systemPrompt;
  }, [systemPrompt]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const availableFormatOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; label: string }[] = [];
    for (const { file } of attachedFiles) {
      const opt = getFormatOptionForFile(file);
      if (!seen.has(opt.id)) {
        seen.add(opt.id);
        list.push(opt);
      }
    }
    return list;
  }, [attachedFiles]);

  const filteredAttachedFiles = useMemo(
    () =>
      attachedFiles
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter(({ item }) => {
          if (selectedFormats.size > 0 && !selectedFormats.has(getFileFormatIdOrExt(item.file)))
            return false;
          if (
            fileSearchQuery.trim() &&
            !item.file.name.toLowerCase().includes(fileSearchQuery.trim().toLowerCase())
          ) {
            return false;
          }
          return true;
        }),
    [attachedFiles, selectedFormats, fileSearchQuery]
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (!hasMessages) {
      const timeoutId = setTimeout(() => setTipsButtonCompact(false), 0);
      return () => clearTimeout(timeoutId);
    }

    const timeoutId = setTimeout(() => setTipsButtonCompact(true), 0);
    return () => clearTimeout(timeoutId);
  }, [hasMessages]);

  useEffect(() => {
    if (availableFormatOptions.length === 0) return;
    const ids = new Set(availableFormatOptions.map((option) => option.id));
    const rafId = requestAnimationFrame(() => {
      setSelectedFormats((prev) => {
        const next = new Set([...prev].filter((formatId) => ids.has(formatId)));
        return next.size === prev.size ? prev : next;
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [availableFormatOptions]);

  useEffect(() => {
    if (attachedFiles.length === 0) {
      queueMicrotask(() => {
        setFilesOverflow(false);
        setFilesExpanded(false);
        setExpandButtonClosing(false);
        setSelectedFormats(new Set());
        setFileSearchQuery('');
      });
      return;
    }

    const element = fileListRef.current;
    if (!element) return;

    const checkOverflow = () => setFilesOverflow(element.scrollWidth > element.clientWidth);
    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [attachedFiles.length, filesExpanded]);

  useEffect(() => {
    return () => {
      if (expandCloseTimeoutRef.current) clearTimeout(expandCloseTimeoutRef.current);
    };
  }, []);

  const releaseDraftAttachments = useCallback((filesToRelease: AttachedFile[]) => {
    filesToRelease.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, []);

  const resetComposer = useCallback(
    (nextHasMessages: boolean) => {
      setValue('');
      setTargetValue('');
      setAttachedFiles((prev) => {
        releaseDraftAttachments(prev);
        return [];
      });
      setFilesOverflow(false);
      setFilesExpanded(false);
      setExpandButtonClosing(false);
      setSelectedFormats(new Set());
      setFileSearchQuery('');

      if (textareaRef.current) {
        textareaRef.current.style.height = `${
          nextHasMessages ? CHAT_TEXTAREA_MIN_HEIGHT : HOME_TEXTAREA_MIN_HEIGHT
        }px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    },
    [releaseDraftAttachments]
  );

  const handleExpandToggle = useCallback(() => {
    setFilesExpanded((prev) => {
      if (prev) {
        setExpandButtonClosing(true);
        if (expandCloseTimeoutRef.current) clearTimeout(expandCloseTimeoutRef.current);
        expandCloseTimeoutRef.current = setTimeout(() => {
          setExpandButtonClosing(false);
          expandCloseTimeoutRef.current = null;
        }, 400);
      } else {
        if (expandCloseTimeoutRef.current) {
          clearTimeout(expandCloseTimeoutRef.current);
          expandCloseTimeoutRef.current = null;
        }
        setExpandButtonClosing(false);
      }
      return !prev;
    });
  }, []);

  const handleRemoveAllFiles = useCallback(() => {
    setAttachedFiles((prev) => {
      releaseDraftAttachments(prev);
      return [];
    });
  }, [releaseDraftAttachments]);

  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  }, []);

  const resizeTextarea = useCallback((element: HTMLTextAreaElement, isChat: boolean) => {
    element.style.height = 'auto';
    const minHeight = isChat ? CHAT_TEXTAREA_MIN_HEIGHT : HOME_TEXTAREA_MIN_HEIGHT;
    const maxHeight = isChat ? CHAT_TEXTAREA_MAX_HEIGHT : HOME_TEXTAREA_MAX_HEIGHT;
    const clampedHeight = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight);
    element.style.height = `${clampedHeight}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  const commitMessages = useCallback((nextMessages: Message[]) => {
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
  }, []);

  const persistExistingChat = useCallback(
    async (
      chatId: string,
      nextMessages: Message[],
      options?: { fallbackTitle?: string; createdAt?: string; systemPrompt?: string }
    ) => {
      const existing = await repository.getChat(chatId);
      const now = new Date().toISOString();
      const nextSystemPrompt = options?.systemPrompt ?? systemPromptRef.current;

      const session: StoredChatSession = existing
        ? {
            ...existing,
            messages: messagesToStoredMessages(nextMessages),
            systemPrompt: nextSystemPrompt,
            updatedAt: now,
          }
        : {
            id: chatId,
            title:
              options?.fallbackTitle ??
              buildHistoryTitle(
                nextMessages.find((message) => message.role === 'user')?.content ?? ''
              ),
            createdAt: options?.createdAt ?? now,
            updatedAt: now,
            pinned: false,
            userId: DEFAULT_CHAT_USER_ID,
            messages: messagesToStoredMessages(nextMessages),
            systemPrompt: nextSystemPrompt,
          };

      await repository.saveChat(session);
      dispatchChatStoreUpdated();
      return session;
    },
    [repository]
  );

  const createChatSession = useCallback(
    async (
      chatId: string,
      title: string,
      nextMessages: Message[],
      options?: { createdAt?: string; systemPrompt?: string }
    ) => {
      const createdAt = options?.createdAt ?? new Date().toISOString();
      const session: StoredChatSession = {
        id: chatId,
        title,
        createdAt,
        updatedAt: createdAt,
        pinned: false,
        userId: DEFAULT_CHAT_USER_ID,
        messages: messagesToStoredMessages(nextMessages),
        systemPrompt: options?.systemPrompt ?? systemPromptRef.current,
      };

      await repository.createChat(session);
      dispatchChatStoreUpdated();
      return session;
    },
    [repository]
  );

  const hydrateChatSession = useCallback(
    async (chatId: string | null) => {
      const requestId = ++hydrationRequestIdRef.current;

      if (chatId && skipHydrationChatIdRef.current === chatId) {
        skipHydrationChatIdRef.current = null;
        setCurrentChatId(chatId);
        setIsHydratingChat(false);
        return;
      }

      streamAbortControllerRef.current?.abort();
      streamAbortControllerRef.current = null;
      setIsAssistantTyping(false);
      setRegeneratingMessageId(null);
      setSystemPromptEditorOpen(false);
      resetComposer(false);

      if (!chatId) {
        skipHydrationChatIdRef.current = null;
        setCurrentChatId(null);
        commitMessages([]);
        setSystemPrompt('');
        setIsHydratingChat(false);
        return;
      }

      setIsHydratingChat(true);
      setCurrentChatId(chatId);
      commitMessages([]);
      setSystemPrompt('');

      try {
        const session = await repository.getChat(chatId);
        if (hydrationRequestIdRef.current !== requestId) return;

        if (!session) {
          setCurrentChatId(null);
          commitMessages([]);
          setSystemPrompt('');
          setIsHydratingChat(false);
          startTransition(() => router.replace('/workspace'));
          return;
        }

        setCurrentChatId(session.id);
        commitMessages(storedMessagesToMessages(session.messages));
        setSystemPrompt(session.systemPrompt ?? '');
        setIsHydratingChat(false);
      } catch {
        if (hydrationRequestIdRef.current !== requestId) return;
        setCurrentChatId(null);
        commitMessages([]);
        setSystemPrompt('');
        setIsHydratingChat(false);
      }
    },
    [commitMessages, repository, resetComposer, router]
  );

  useEffect(() => {
    void hydrateChatSession(activeChatIdFromUrl);
  }, [activeChatIdFromUrl, hydrateChatSession]);

  const startNewChat = useCallback(() => {
    skipHydrationChatIdRef.current = null;
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    setCurrentChatId(null);
    setIsHydratingChat(false);
    setIsAssistantTyping(false);
    setRegeneratingMessageId(null);
    commitMessages([]);
    setSystemPrompt('');
    setSystemPromptEditorOpen(false);
    resetComposer(false);
  }, [commitMessages, resetComposer]);

  useEffect(() => {
    const handler = () => startNewChat();
    window.addEventListener(WORKSPACE_START_NEW_CHAT_EVENT, handler);
    return () => window.removeEventListener(WORKSPACE_START_NEW_CHAT_EVENT, handler);
  }, [startNewChat]);

  useEffect(() => {
    if (textareaRef.current) resizeTextarea(textareaRef.current, hasMessages);
  }, [value, hasMessages, resizeTextarea]);

  const streamChatResponse = useCallback(
    (
      chatId: string,
      messagesForApi: ApiMessage[],
      assistantMessageId: string,
      signal?: AbortSignal,
      options?: { modifier?: string; appendVersion?: boolean; onComplete?: () => void }
    ) => {
      fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi }),
        signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error ?? 'Помилка запиту');
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('Немає потоку відповіді');

          const decoder = new TextDecoder();
          let buffer = '';
          let streamDone = false;
          let pendingContent = '';

          const finalize = () => {
            streamAbortControllerRef.current = null;
            setIsAssistantTyping(false);
            options?.onComplete?.();
            const nextMessages = messagesRef.current.map((message) => {
              if (message.id !== assistantMessageId || message.role !== 'assistant') {
                return message;
              }

              const content = (message.content ?? '').trim() || 'Немає відповіді.';
              return finalizeAssistantMessage(message, {
                content,
                modifier: options?.modifier,
                appendVersion: options?.appendVersion,
                includeSuggestions: true,
              });
            });

            commitMessages(nextMessages);
            void persistExistingChat(chatId, nextMessages);
          };

          const flushPendingContent = () => {
            if (!pendingContent) return;

            const chunkToAppend = pendingContent;
            pendingContent = '';

            commitMessages(
              messagesRef.current.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: (message.content ?? '') + chunkToAppend }
                  : message
              )
            );
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
                  const parsed = JSON.parse(data) as { content?: string; error?: string };
                  if (parsed.error) throw new Error(parsed.error);
                  if (typeof parsed.content === 'string' && parsed.content.length > 0) {
                    pendingContent += parsed.content;
                    flushPendingContent();
                  }
                } catch {
                  // Skip malformed stream chunks.
                }
              }
            }
          } finally {
            flushPendingContent();
          }

          if (streamDone && pendingContent.length === 0) {
            finalize();
          } else if (!streamDone) {
            streamAbortControllerRef.current = null;
            setIsAssistantTyping(false);
            options?.onComplete?.();
          }
        })
        .catch((error) => {
          streamAbortControllerRef.current = null;
          setIsAssistantTyping(false);
          options?.onComplete?.();

          const isAbortError = error instanceof Error && error.name === 'AbortError';
          const nextContent = isAbortError
            ? null
            : `**Помилка:** ${error instanceof Error ? error.message : 'Помилка отримання відповіді'}`;
          const nextMessages = messagesRef.current.map((message) => {
            if (message.id !== assistantMessageId || message.role !== 'assistant') {
              return message;
            }

            const content = isAbortError
              ? (message.content ?? '').trim() || 'Немає відповіді.'
              : (nextContent ?? 'Немає відповіді.');

            return finalizeAssistantMessage(message, {
              content,
              modifier: options?.modifier,
              appendVersion: options?.appendVersion,
              includeSuggestions: false,
            });
          });

          commitMessages(nextMessages);
          void persistExistingChat(chatId, nextMessages);
        });
    },
    [commitMessages, persistExistingChat]
  );

  const handleStopGeneration = useCallback(() => {
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    setIsAssistantTyping(false);
    setRegeneratingMessageId(null);
  }, []);

  const runSend = useCallback(
    async (text: string) => {
      const assistantId = generateId();
      const nextUserMessage: Message = {
        id: generateId(),
        role: 'user',
        content: text || '',
        attachments: buildMessageAttachments(attachedFiles),
      };
      const nextAssistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        versions: [],
        activeVersionIndex: 0,
      };
      const nextMessages = [...messages, nextUserMessage, nextAssistantMessage];

      let chatId = currentChatId;
      if (!chatId) {
        chatId = generateId();
        const title = buildHistoryTitle(text);
        const createdAt = new Date().toISOString();
        const createdChatId = chatId;

        skipHydrationChatIdRef.current = createdChatId;
        setCurrentChatId(createdChatId);
        startTransition(() => {
          router.push(`/workspace?chat=${encodeURIComponent(createdChatId)}`);
        });

        void createChatSession(createdChatId, title, nextMessages, {
          createdAt,
          systemPrompt: systemPromptRef.current,
        });
      } else {
        void persistExistingChat(chatId, nextMessages);
      }

      commitMessages(nextMessages);
      resetComposer(true);
      setIsAssistantTyping(true);
      streamAbortControllerRef.current?.abort();

      const controller = new AbortController();
      streamAbortControllerRef.current = controller;

      const messagesForApi: ApiMessage[] = [
        ...messages.map((message) => ({ role: message.role, content: message.content })),
        { role: 'user', content: text || '' },
      ];

      streamChatResponse(chatId, messagesForApi, assistantId, controller.signal);
    },
    [
      attachedFiles,
      createChatSession,
      currentChatId,
      messages,
      persistExistingChat,
      resetComposer,
      router,
      streamChatResponse,
      commitMessages,
    ]
  );

  const handleSend = useCallback(() => {
    const text = targetValue.trim();
    if (!text && attachedFiles.length === 0) return;
    void runSend(text);
  }, [attachedFiles.length, runSend, targetValue]);

  const handleSuggestionClick = useCallback(
    (suggestionText: string) => {
      void runSend(suggestionText);
    },
    [runSend]
  );

  const handleRegenerate = useCallback(
    (assistantMessageId: string, modifier?: string) => {
      if (!currentChatId) return;

      const message = messages.find((item) => item.id === assistantMessageId);
      if (!message || message.role !== 'assistant') return;

      const assistantIndex = messages.findIndex((item) => item.id === assistantMessageId);
      let messagesForApi: ApiMessage[] = messages
        .slice(0, assistantIndex)
        .map((item) => ({ role: item.role, content: item.content }));

      if (messagesForApi.length === 0) return;
      if (modifier?.trim()) {
        messagesForApi = [...messagesForApi, { role: 'user', content: modifier.trim() }];
      }

      const nextMessages = messages.map((item) =>
        item.id === assistantMessageId ? { ...item, content: '' } : item
      );

      commitMessages(nextMessages);
      setRegeneratingMessageId(assistantMessageId);
      void persistExistingChat(currentChatId, nextMessages);

      streamAbortControllerRef.current?.abort();
      const controller = new AbortController();
      streamAbortControllerRef.current = controller;

      streamChatResponse(currentChatId, messagesForApi, assistantMessageId, controller.signal, {
        modifier,
        appendVersion: true,
        onComplete: () => setRegeneratingMessageId(null),
      });
    },
    [commitMessages, currentChatId, messages, persistExistingChat, streamChatResponse]
  );

  const handleSetActiveVersion = useCallback(
    (assistantMessageId: string, index: number) => {
      if (!currentChatId) return;

      const nextMessages = messagesRef.current.map((message) => {
        if (
          message.id !== assistantMessageId ||
          message.role !== 'assistant' ||
          !message.versions
        ) {
          return message;
        }

        const nextIndex = Math.max(0, Math.min(index, message.versions.length - 1));
        return {
          ...message,
          content: message.versions[nextIndex].content,
          activeVersionIndex: nextIndex,
        };
      });

      commitMessages(nextMessages);
      void persistExistingChat(currentChatId, nextMessages);
    },
    [commitMessages, currentChatId, persistExistingChat]
  );

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (!currentChatId) return;

      const trimmed = newContent.trim();
      const messageIndex = messages.findIndex((message) => message.id === messageId);
      if (messageIndex === -1 || messages[messageIndex].role !== 'user') return;

      const nextMessage = messages[messageIndex + 1];
      const removeFollowingAssistant = nextMessage?.role === 'assistant';
      const assistantId = generateId();
      const messagesForApi: ApiMessage[] = [
        ...messages.slice(0, messageIndex).map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: 'user', content: trimmed },
      ];

      const updatedMessages = messages.map((message) =>
        message.id === messageId ? { ...message, content: trimmed } : message
      );
      const upToEdited = updatedMessages.slice(0, messageIndex + 1);
      const after = removeFollowingAssistant
        ? updatedMessages.slice(messageIndex + 2)
        : updatedMessages.slice(messageIndex + 1);
      const nextMessages = [
        ...upToEdited,
        {
          id: assistantId,
          role: 'assistant' as const,
          content: '',
          versions: [],
          activeVersionIndex: 0,
        },
        ...after,
      ];

      commitMessages(nextMessages);
      setIsAssistantTyping(true);
      void persistExistingChat(currentChatId, nextMessages);

      streamAbortControllerRef.current?.abort();
      const controller = new AbortController();
      streamAbortControllerRef.current = controller;

      streamChatResponse(currentChatId, messagesForApi, assistantId, controller.signal);
    },
    [commitMessages, currentChatId, messages, persistExistingChat, streamChatResponse]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setTargetValue(nextValue);
      setValue(nextValue);
      resizeTextarea(event.target, hasMessages);
    },
    [hasMessages, resizeTextarea]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (canSend) handleSend();
      }
    },
    [canSend, handleSend]
  );

  const handleAttach = useCallback((files: File[]) => {
    const nextItems: AttachedFile[] = Array.from(files).map((file) => ({
      file,
      previewUrl:
        file.type.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/i.test(file.name)
          ? URL.createObjectURL(file)
          : null,
    }));

    setAttachedFiles((prev) => [...prev, ...nextItems]);
  }, []);

  const handleSystemPromptApply = useCallback(() => {
    setSystemPromptEditorOpen(false);
    if (!currentChatId) return;
    void persistExistingChat(currentChatId, messages, { systemPrompt });
  }, [currentChatId, messages, persistExistingChat, systemPrompt]);

  const showExpandButton = filesOverflow || filesExpanded || expandButtonClosing;

  return {
    value,
    targetValue,
    attachedFiles,
    messages,
    isAssistantTyping,
    regeneratingMessageId,
    tipsButtonCompact,
    selectedFormats,
    setSelectedFormats,
    fileSearchQuery,
    setFileSearchQuery,
    systemPromptEditorOpen,
    setSystemPromptEditorOpen,
    systemPrompt,
    setSystemPrompt,
    handleSystemPromptApply,
    currentChatId,
    isHydratingChat,
    hasMessages,
    canSend,
    isGenerationInProgress,
    availableFormatOptions,
    filteredAttachedFiles,
    textareaRef,
    fileInputRef,
    fileListRef,
    fileListScrollRef,
    showExpandButton,
    filesExpanded,
    handleExpandToggle,
    handleRemoveAllFiles,
    handleRemoveFile,
    handleSend,
    handleSuggestionClick,
    handleRegenerate,
    handleSetActiveVersion,
    handleEditMessage,
    handleChange,
    handleKeyDown,
    handleStopGeneration,
    handleAttach,
  };
}
