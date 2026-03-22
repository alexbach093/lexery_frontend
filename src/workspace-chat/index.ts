'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CHAT_TEXTAREA_MIN_HEIGHT,
  CHAT_TEXTAREA_MAX_HEIGHT,
  HOME_TEXTAREA_MIN_HEIGHT,
  HOME_TEXTAREA_MAX_HEIGHT,
} from '@/components/chat/ChatInput';
import {
  CHAT_STORE_UPDATED_EVENT,
  DEFAULT_CHAT_USER_ID,
  dispatchChatStoreUpdated,
  isChatStoreStorageEvent,
} from '@/lib/chat-library';
import { getChatRepository } from '@/lib/chat-repository';
import { messagesToStoredMessages, storedMessagesToMessages } from '@/lib/chat-session-mappers';
import type { Message, StoredChatSession } from '@/types';

import { WORKSPACE_START_NEW_CHAT_EVENT, WORKSPACE_OPEN_CHAT_EVENT } from './constants';
import {
  generateId,
  buildHistoryTitle,
  buildMessageAttachments,
  hasPendingAssistantResponse,
  type ApiMessage,
} from './helpers';
import { useChatAttachments } from './use-chat-attachments';
import { useChatStream } from './use-chat-stream';

export { WORKSPACE_START_NEW_CHAT_EVENT, WORKSPACE_OPEN_CHAT_EVENT } from './constants';

export function useWorkspaceChat(onReady?: () => void) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repository = useMemo(() => getChatRepository(), []);
  const activeChatIdFromUrl = searchParams.get('chat');

  const [currentChatId, setCurrentChatId] = useState<string | null>(activeChatIdFromUrl);
  const [isHydratingChat, setIsHydratingChat] = useState<boolean>(activeChatIdFromUrl != null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [value, setValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [tipsButtonCompact, setTipsButtonCompact] = useState(false);
  const [scrollToBottomRequest, setScrollToBottomRequest] = useState(0);

  const [systemPromptEditorOpen, setSystemPromptEditorOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [systemPromptDraft, setSystemPromptDraft] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hydrationRequestIdRef = useRef(0);
  const skipHydrationChatIdRef = useRef<string | null>(null);
  const dismissedChatIdRef = useRef<string | null>(null);
  const systemPromptRef = useRef(systemPrompt);
  const messagesRef = useRef<Message[]>([]);
  const currentChatIdRef = useRef<string | null>(currentChatId);

  const attachmentsData = useChatAttachments();
  const { attachedFiles, resetAttachments, handleAttach } = attachmentsData;

  const commitMessages = useCallback((nextMessages: Message[]) => {
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
  }, []);

  const persistExistingChat = useCallback(
    async (
      chatId: string,
      nextMessages: Message[],
      options?: { fallbackTitle?: string; createdAt?: string; systemPrompt?: string }
    ): Promise<void> => {
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
              buildHistoryTitle(nextMessages.find((m) => m.role === 'user')?.content ?? ''),
            createdAt: options?.createdAt ?? now,
            updatedAt: now,
            pinned: false,
            userId: DEFAULT_CHAT_USER_ID,
            messages: messagesToStoredMessages(nextMessages),
            systemPrompt: nextSystemPrompt,
          };
      await repository.saveChat(session);
      dispatchChatStoreUpdated();
    },
    [repository]
  );

  const streamData = useChatStream({ commitMessages, persistExistingChat, currentChatIdRef });
  const {
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
  } = streamData;

  const isAssistantTypingRef = useRef(isAssistantTyping);
  const regeneratingMessageIdRef = useRef<string | null>(regeneratingMessageId);

  const isEmpty = targetValue.trim().length === 0;
  const isGenerationInProgress =
    isAssistantTyping || regeneratingMessageId != null || isStoppingGeneration;
  const canSend = !isEmpty && !isGenerationInProgress;
  const hasMessages = (messages?.length ?? 0) > 0;

  useEffect(() => {
    systemPromptRef.current = systemPrompt;
  }, [systemPrompt]);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);
  useEffect(() => {
    isAssistantTypingRef.current = isAssistantTyping;
  }, [isAssistantTyping]);
  useEffect(() => {
    regeneratingMessageIdRef.current = regeneratingMessageId;
  }, [regeneratingMessageId]);
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setTipsButtonCompact(hasMessages), 0);
    return () => clearTimeout(timeoutId);
  }, [hasMessages]);

  const resetComposer = useCallback(
    (nextHasMessages: boolean) => {
      setValue('');
      setTargetValue('');
      resetAttachments();
      if (textareaRef.current) {
        textareaRef.current.style.height = `${nextHasMessages ? CHAT_TEXTAREA_MIN_HEIGHT : HOME_TEXTAREA_MIN_HEIGHT}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    },
    [resetAttachments]
  );

  const resizeTextarea = useCallback((element: HTMLTextAreaElement, isChat: boolean) => {
    element.style.height = 'auto';
    const minHeight = isChat ? CHAT_TEXTAREA_MIN_HEIGHT : HOME_TEXTAREA_MIN_HEIGHT;
    const maxHeight = isChat ? CHAT_TEXTAREA_MAX_HEIGHT : HOME_TEXTAREA_MAX_HEIGHT;
    const clampedHeight = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight);
    element.style.height = `${clampedHeight}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

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

      if (chatId && dismissedChatIdRef.current === chatId) {
        dismissedChatIdRef.current = null;
        skipHydrationChatIdRef.current = null;
        setCurrentChatId(null);
        setIsHydratingChat(false);
        setIsStoppingGeneration(false);
        startTransition(() => router.replace('/'));
        return;
      }

      if (chatId && skipHydrationChatIdRef.current === chatId) {
        const hasLocalChatState =
          currentChatIdRef.current === chatId &&
          (messagesRef.current.length > 0 ||
            isAssistantTypingRef.current ||
            regeneratingMessageIdRef.current != null);
        skipHydrationChatIdRef.current = null;
        if (hasLocalChatState) {
          setCurrentChatId(chatId);
          setIsHydratingChat(false);
          return;
        }
      }

      setIsAssistantTyping(false);
      setIsStoppingGeneration(false);
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
          setIsHydratingChat(false);
          startTransition(() => router.replace('/'));
          return;
        }
        setCurrentChatId(session.id);
        commitMessages(storedMessagesToMessages(session.messages));
        setSystemPrompt(session.systemPrompt ?? '');
        setIsAssistantTyping(
          streamingChatIdRef.current === session.id || hasPendingAssistantResponse(session.messages)
        );
        setIsHydratingChat(false);
      } catch {
        if (hydrationRequestIdRef.current !== requestId) return;
        setCurrentChatId(null);
        setIsHydratingChat(false);
      }
    },
    [
      commitMessages,
      repository,
      resetComposer,
      router,
      setIsAssistantTyping,
      setIsStoppingGeneration,
      setRegeneratingMessageId,
      streamingChatIdRef,
    ]
  );

  useEffect(() => {
    let isActive = true;
    Promise.resolve().then(() => {
      if (isActive) void hydrateChatSession(activeChatIdFromUrl);
    });
    return () => {
      isActive = false;
    };
  }, [activeChatIdFromUrl, hydrateChatSession]);

  useEffect(() => {
    const handleChatStoreUpdated = () => {
      const activeChatId = currentChatIdRef.current;
      if (!activeChatId) return;

      void repository
        .getChat(activeChatId)
        .then((session) => {
          if (currentChatIdRef.current !== activeChatId) return;
          if (!session) {
            setCurrentChatId(null);
            commitMessages([]);
            setSystemPrompt('');
            setIsAssistantTyping(false);
            setIsStoppingGeneration(false);
            setRegeneratingMessageId(null);
            setIsHydratingChat(false);
            startTransition(() => router.replace('/'));
            return;
          }
          commitMessages(storedMessagesToMessages(session.messages));
          setSystemPrompt(session.systemPrompt ?? '');
          setIsAssistantTyping(
            streamingChatIdRef.current === session.id ||
              hasPendingAssistantResponse(session.messages)
          );
          setIsHydratingChat(false);
        })
        .catch(() => {
          if (currentChatIdRef.current === activeChatId) setIsAssistantTyping(false);
        });
    };

    const handleStorage = (e: StorageEvent) => {
      if (isChatStoreStorageEvent(e)) handleChatStoreUpdated();
    };
    window.addEventListener(CHAT_STORE_UPDATED_EVENT, handleChatStoreUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(CHAT_STORE_UPDATED_EVENT, handleChatStoreUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [
    commitMessages,
    repository,
    router,
    setIsAssistantTyping,
    setIsStoppingGeneration,
    setRegeneratingMessageId,
    streamingChatIdRef,
  ]);

  const startNewChat = useCallback(() => {
    dismissedChatIdRef.current = currentChatId ?? skipHydrationChatIdRef.current;
    skipHydrationChatIdRef.current = null;
    setCurrentChatId(null);
    setIsHydratingChat(false);
    setIsAssistantTyping(false);
    setIsStoppingGeneration(false);
    setRegeneratingMessageId(null);
    commitMessages([]);
    setSystemPrompt('');
    setSystemPromptEditorOpen(false);
    resetComposer(false);
    const nextPath =
      typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';
    startTransition(() => router.replace(nextPath));
  }, [
    commitMessages,
    currentChatId,
    resetComposer,
    router,
    setIsAssistantTyping,
    setIsStoppingGeneration,
    setRegeneratingMessageId,
  ]);

  useEffect(() => {
    window.addEventListener(WORKSPACE_START_NEW_CHAT_EVENT, startNewChat);
    return () => window.removeEventListener(WORKSPACE_START_NEW_CHAT_EVENT, startNewChat);
  }, [startNewChat]);

  useEffect(() => {
    const handler = (event: Event) => {
      const chatId = (event as CustomEvent<{ chatId?: string }>).detail?.chatId;
      if (chatId) {
        dismissedChatIdRef.current = null;
        void hydrateChatSession(chatId);
      }
    };
    window.addEventListener(WORKSPACE_OPEN_CHAT_EVENT, handler as EventListener);
    return () => window.removeEventListener(WORKSPACE_OPEN_CHAT_EVENT, handler as EventListener);
  }, [hydrateChatSession]);

  useEffect(() => {
    if (textareaRef.current) resizeTextarea(textareaRef.current, hasMessages);
  }, [value, hasMessages, resizeTextarea]);

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
        skipHydrationChatIdRef.current = chatId;
        setCurrentChatId(chatId);
        startTransition(() => router.push(`/?chat=${encodeURIComponent(chatId!)}`));
        void createChatSession(chatId, buildHistoryTitle(text), nextMessages, {
          createdAt: new Date().toISOString(),
          systemPrompt: systemPromptRef.current,
        });
      } else {
        void persistExistingChat(chatId, nextMessages);
      }

      commitMessages(nextMessages);
      setScrollToBottomRequest((current) => current + 1);
      resetComposer(true);
      setIsStoppingGeneration(false);
      setIsAssistantTyping(true);
      streamAbortControllerRef.current?.abort();

      const controller = new AbortController();
      streamAbortControllerRef.current = controller;
      streamingChatIdRef.current = chatId;

      const messagesForApi: ApiMessage[] = [
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: text || '' },
      ];
      streamChatResponse(
        chatId,
        messagesForApi,
        assistantId,
        nextMessages,
        controller,
        controller.signal
      );
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
      setIsAssistantTyping,
      setIsStoppingGeneration,
      streamAbortControllerRef,
      streamingChatIdRef,
    ]
  );

  const handleSend = useCallback(() => {
    const text = targetValue.trim();
    if (text) void runSend(text);
  }, [runSend, targetValue]);

  const handleSuggestionClick = useCallback(
    (suggestionText: string) => void runSend(suggestionText),
    [runSend]
  );

  const handleRegenerate = useCallback(
    (assistantMessageId: string, modifier?: string) => {
      if (!currentChatId) return;
      const assistantIndex = messages.findIndex((item) => item.id === assistantMessageId);
      if (assistantIndex === -1 || messages[assistantIndex].role !== 'assistant') return;

      const messagesForApi: ApiMessage[] = messages
        .slice(0, assistantIndex)
        .map((item) => ({ role: item.role as 'user' | 'assistant', content: item.content }));
      if (modifier?.trim()) messagesForApi.push({ role: 'user', content: modifier.trim() });

      const nextMessages = messages.map((item) =>
        item.id === assistantMessageId ? { ...item, content: '' } : item
      );
      commitMessages(nextMessages);
      setIsStoppingGeneration(false);
      setRegeneratingMessageId(assistantMessageId);
      void persistExistingChat(currentChatId, nextMessages);

      streamAbortControllerRef.current?.abort();
      const controller = new AbortController();
      streamAbortControllerRef.current = controller;
      streamingChatIdRef.current = currentChatId;

      streamChatResponse(
        currentChatId,
        messagesForApi,
        assistantMessageId,
        nextMessages,
        controller,
        controller.signal,
        {
          modifier,
          appendVersion: true,
          onComplete: () => setRegeneratingMessageId(null),
        }
      );
    },
    [
      commitMessages,
      currentChatId,
      messages,
      persistExistingChat,
      streamChatResponse,
      setIsStoppingGeneration,
      setRegeneratingMessageId,
      streamAbortControllerRef,
      streamingChatIdRef,
    ]
  );

  const handleSetActiveVersion = useCallback(
    (assistantMessageId: string, index: number) => {
      if (!currentChatId) return;
      const nextMessages = messagesRef.current.map((msg) => {
        if (msg.id !== assistantMessageId || msg.role !== 'assistant' || !msg.versions) return msg;
        const nextIndex = Math.max(0, Math.min(index, msg.versions.length - 1));
        return { ...msg, content: msg.versions[nextIndex].content, activeVersionIndex: nextIndex };
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
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1 || messages[messageIndex].role !== 'user') return;

      const removeFollowingAssistant = messages[messageIndex + 1]?.role === 'assistant';
      const assistantId = generateId();
      const messagesForApi: ApiMessage[] = [
        ...messages
          .slice(0, messageIndex)
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: trimmed },
      ];

      const updatedMessages = messages.map((m) =>
        m.id === messageId ? { ...m, content: trimmed } : m
      );
      const upToEdited = updatedMessages.slice(0, messageIndex + 1);
      const after = removeFollowingAssistant
        ? updatedMessages.slice(messageIndex + 2)
        : updatedMessages.slice(messageIndex + 1);

      const newAssistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        versions: [],
        activeVersionIndex: 0,
      };

      const nextMessages: Message[] = [...upToEdited, newAssistantMessage, ...after];

      commitMessages(nextMessages);
      setIsStoppingGeneration(false);
      setIsAssistantTyping(true);
      void persistExistingChat(currentChatId, nextMessages);

      streamAbortControllerRef.current?.abort();
      const controller = new AbortController();
      streamAbortControllerRef.current = controller;
      streamingChatIdRef.current = currentChatId;

      streamChatResponse(
        currentChatId,
        messagesForApi,
        assistantId,
        nextMessages,
        controller,
        controller.signal
      );
    },
    [
      commitMessages,
      currentChatId,
      messages,
      persistExistingChat,
      streamChatResponse,
      setIsAssistantTyping,
      setIsStoppingGeneration,
      streamAbortControllerRef,
      streamingChatIdRef,
    ]
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

  const openSystemPromptEditor = useCallback(() => {
    setSystemPromptDraft(systemPromptRef.current);
    setSystemPromptEditorOpen(true);
  }, []);

  const handleSystemPromptCancel = useCallback(() => {
    setSystemPromptDraft('');
    setSystemPromptEditorOpen(false);
  }, []);

  const handleSystemPromptApply = useCallback(() => {
    setSystemPrompt(systemPromptDraft);
    setSystemPromptEditorOpen(false);
    if (currentChatId)
      void persistExistingChat(currentChatId, messages, { systemPrompt: systemPromptDraft });
  }, [currentChatId, messages, persistExistingChat, systemPromptDraft]);

  return {
    value,
    targetValue,
    messages,
    currentChatId,
    scrollToBottomRequest,
    isHydratingChat,
    hasMessages,
    canSend,
    isGenerationInProgress,
    tipsButtonCompact,
    systemPromptEditorOpen,
    setSystemPromptEditorOpen,
    systemPrompt,
    setSystemPrompt,
    systemPromptDraft,
    setSystemPromptDraft,
    openSystemPromptEditor,
    handleSystemPromptCancel,
    handleSystemPromptApply,
    textareaRef,
    handleChange,
    handleKeyDown,
    handleSend,
    handleSuggestionClick,
    handleRegenerate,
    handleSetActiveVersion,
    handleEditMessage,
    ...attachmentsData,
    ...streamData,
  };
}
