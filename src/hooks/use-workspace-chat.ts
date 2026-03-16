'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AttachedFile } from '@/features/attachments';
import { getFileFormatIdOrExt, getFormatOptionForFile } from '@/features/attachments';
import {
  CHAT_TEXTAREA_MIN_HEIGHT,
  CHAT_TEXTAREA_MAX_HEIGHT,
  HOME_TEXTAREA_MIN_HEIGHT,
  HOME_TEXTAREA_MAX_HEIGHT,
} from '@/features/chat-input';
import { upsertRecentChat } from '@/lib/recent-chats';
import type { Message, MessageVersion } from '@/types';

const HISTORY_TITLE_MAX_LENGTH = 60;

/** Подія для відкриття нового чату (кнопка «Новий чат» у сайдбарі). */
export const WORKSPACE_START_NEW_CHAT_EVENT = 'workspace-start-new-chat';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

type ApiMessage = { role: 'user' | 'assistant'; content: string };

export function useWorkspaceChat(onReady?: () => void) {
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

  const isEmpty = targetValue.trim().length === 0;
  const isGenerationInProgress = isAssistantTyping || regeneratingMessageId != null;
  const canSend = (!isEmpty || attachedFiles.length > 0) && !isGenerationInProgress;
  const hasMessages = (messages?.length ?? 0) > 0;

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
          )
            return false;
          return true;
        }),
    [attachedFiles, selectedFormats, fileSearchQuery]
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (!hasMessages) {
      const t = setTimeout(() => setTipsButtonCompact(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTipsButtonCompact(true), 0);
    return () => clearTimeout(t);
  }, [hasMessages]);

  useEffect(() => {
    if (availableFormatOptions.length === 0) return;
    const ids = new Set(availableFormatOptions.map((o) => o.id));
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
    const el = fileListRef.current;
    if (!el) return;
    const checkOverflow = () => setFilesOverflow(el.scrollWidth > el.clientWidth);
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [attachedFiles.length, filesExpanded]);

  useEffect(() => {
    return () => {
      if (expandCloseTimeoutRef.current) clearTimeout(expandCloseTimeoutRef.current);
    };
  }, []);

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
      prev.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const resizeTextarea = useCallback((el: HTMLTextAreaElement, isChat: boolean) => {
    el.style.height = 'auto';
    const minH = isChat ? CHAT_TEXTAREA_MIN_HEIGHT : HOME_TEXTAREA_MIN_HEIGHT;
    const maxH = isChat ? CHAT_TEXTAREA_MAX_HEIGHT : HOME_TEXTAREA_MAX_HEIGHT;
    const clamped = Math.min(Math.max(el.scrollHeight, minH), maxH);
    el.style.height = `${clamped}px`;
    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
  }, []);

  const resetInput = useCallback(() => {
    setValue('');
    setTargetValue('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = `${CHAT_TEXTAREA_MIN_HEIGHT}px`;
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, []);

  const startNewChat = useCallback(() => {
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    setIsAssistantTyping(false);
    setRegeneratingMessageId(null);
    setMessages([]);
    resetInput();
  }, [resetInput]);

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
      messagesForApi: ApiMessage[],
      assistantMessageId: string,
      onError: (message: string) => void,
      signal?: AbortSignal,
      options?: { modifier?: string; appendVersion?: boolean; onComplete?: () => void }
    ) => {
      fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi }),
        signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error ?? 'Помилка запиту');
          }
          const reader = res.body?.getReader();
          if (!reader) throw new Error('Немає потоку відповіді');
          const decoder = new TextDecoder();
          let buffer = '';
          let streamDone = false;
          let pendingContent = '';
          const TYPEWRITER_MS = 25;
          const finalize = () => {
            streamAbortControllerRef.current = null;
            setIsAssistantTyping(false);
            options?.onComplete?.();
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantMessageId || m.role !== 'assistant') return m;
                const content = (m.content ?? '').trim() || 'Немає відповіді.';
                const newVersion: MessageVersion = {
                  content,
                  createdAt: new Date().toISOString(),
                  modifier: options?.modifier,
                };
                const versions: MessageVersion[] =
                  options?.appendVersion && m.versions?.length
                    ? [...m.versions, newVersion]
                    : [newVersion];
                return {
                  ...m,
                  content,
                  suggestions: ['Детальніше', 'Ще приклад'],
                  versions,
                  activeVersionIndex: versions.length - 1,
                };
              })
            );
          };
          const typewriterInterval = setInterval(() => {
            if (pendingContent.length > 0) {
              const char = pendingContent[0];
              pendingContent = pendingContent.slice(1);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId ? { ...m, content: (m.content ?? '') + char } : m
                )
              );
            }
            if (streamDone && pendingContent.length === 0) {
              clearInterval(typewriterInterval);
              finalize();
            }
          }, TYPEWRITER_MS);
          try {
            while (!streamDone) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
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
                  if (typeof parsed.content === 'string' && parsed.content.length > 0)
                    pendingContent += parsed.content;
                } catch {
                  /* skip */
                }
              }
            }
          } finally {
            if (!streamDone) clearInterval(typewriterInterval);
          }
          if (streamDone && pendingContent.length === 0) {
            clearInterval(typewriterInterval);
            finalize();
          } else if (!streamDone) {
            streamAbortControllerRef.current = null;
            setIsAssistantTyping(false);
            options?.onComplete?.();
          }
        })
        .catch((err) => {
          streamAbortControllerRef.current = null;
          if (err instanceof Error && err.name === 'AbortError') {
            setIsAssistantTyping(false);
            options?.onComplete?.();
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantMessageId || m.role !== 'assistant') return m;
                const content = (m.content ?? '').trim() || 'Немає відповіді.';
                const newVersion: MessageVersion = {
                  content,
                  createdAt: new Date().toISOString(),
                  modifier: options?.modifier,
                };
                const versions: MessageVersion[] =
                  options?.appendVersion && m.versions?.length
                    ? [...m.versions, newVersion]
                    : [newVersion];
                return { ...m, content, versions, activeVersionIndex: versions.length - 1 };
              })
            );
            return;
          }
          onError(err instanceof Error ? err.message : 'Помилка отримання відповіді');
          setIsAssistantTyping(false);
          options?.onComplete?.();
        });
    },
    []
  );

  const handleStopGeneration = useCallback(() => {
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    setIsAssistantTyping(false);
    setRegeneratingMessageId(null);
  }, []);

  const runSend = useCallback(
    (text: string) => {
      const attachments =
        attachedFiles.length > 0
          ? attachedFiles.map((a) => ({
              name: a.file.name,
              size: a.file.size,
              previewUrl: a.previewUrl,
            }))
          : undefined;
      const assistantId = generateId();
      const isNewChat = messages.length === 0;
      if (isNewChat) {
        const raw = text.trim();
        const title =
          raw.length > 0
            ? raw.slice(0, HISTORY_TITLE_MAX_LENGTH) +
              (raw.length > HISTORY_TITLE_MAX_LENGTH ? '…' : '')
            : 'Новий чат';
        const chatId = generateId();
        upsertRecentChat({
          id: chatId,
          title,
          createdAt: new Date().toISOString(),
        });
      }
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'user', content: text || '', attachments },
        { id: assistantId, role: 'assistant', content: '', versions: [], activeVersionIndex: 0 },
      ]);
      resetInput();
      setIsAssistantTyping(true);
      streamAbortControllerRef.current?.abort();
      const controller = new AbortController();
      streamAbortControllerRef.current = controller;
      const messagesForApi: ApiMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: text || '' },
      ];
      streamChatResponse(
        messagesForApi,
        assistantId,
        (errorMessage) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: `**Помилка:** ${errorMessage}`,
                    versions: [
                      {
                        content: `**Помилка:** ${errorMessage}`,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                    activeVersionIndex: 0,
                  }
                : m
            )
          );
        },
        controller.signal
      );
    },
    [attachedFiles, resetInput, messages, streamChatResponse]
  );

  const handleSend = useCallback(() => {
    const text = targetValue.trim();
    if (!text && attachedFiles.length === 0) return;
    runSend(text);
  }, [targetValue, attachedFiles, runSend]);

  const handleSuggestionClick = useCallback(
    (suggestionText: string) => runSend(suggestionText),
    [runSend]
  );

  const handleRegenerate = useCallback(
    (assistantMessageId: string, modifier?: string) => {
      const msg = messages.find((m) => m.id === assistantMessageId);
      if (!msg || msg.role !== 'assistant') return;
      const assistantIndex = messages.findIndex((m) => m.id === assistantMessageId);
      let messagesForApi: ApiMessage[] = messages
        .slice(0, assistantIndex)
        .map((m) => ({ role: m.role, content: m.content }));
      if (messagesForApi.length === 0) return;
      if (modifier?.trim())
        messagesForApi = [...messagesForApi, { role: 'user', content: modifier.trim() }];
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMessageId ? { ...m, content: '' } : m))
      );
      setRegeneratingMessageId(assistantMessageId);
      streamAbortControllerRef.current?.abort();
      const controller = new AbortController();
      streamAbortControllerRef.current = controller;
      streamChatResponse(
        messagesForApi,
        assistantMessageId,
        (errorMessage) => {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantMessageId) return m;
              const newVersion: MessageVersion = {
                content: `**Помилка:** ${errorMessage}`,
                createdAt: new Date().toISOString(),
                modifier,
              };
              const versions = m.versions ?? [
                { content: m.content, createdAt: new Date().toISOString() },
              ];
              return {
                ...m,
                content: newVersion.content,
                versions: [...versions, newVersion],
                activeVersionIndex: versions.length,
              };
            })
          );
        },
        controller.signal,
        { modifier, appendVersion: true, onComplete: () => setRegeneratingMessageId(null) }
      );
    },
    [messages, streamChatResponse]
  );

  const handleSetActiveVersion = useCallback((assistantMessageId: string, index: number) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== assistantMessageId || m.role !== 'assistant' || !m.versions) return m;
        const i = Math.max(0, Math.min(index, m.versions.length - 1));
        return { ...m, content: m.versions[i].content, activeVersionIndex: i };
      })
    );
  }, []);

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      const trimmed = newContent.trim();
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx === -1 || messages[idx].role !== 'user') return;
      const nextMessage = messages[idx + 1];
      const removeFollowingAssistant = nextMessage?.role === 'assistant';
      const assistantId = generateId();
      const messagesForApi: ApiMessage[] = [
        ...messages.slice(0, idx).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: trimmed },
      ];
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === messageId ? { ...m, content: trimmed } : m));
        const upToEdited = updated.slice(0, idx + 1);
        const after = removeFollowingAssistant ? prev.slice(idx + 2) : prev.slice(idx + 1);
        return [
          ...upToEdited,
          { id: assistantId, role: 'assistant', content: '', versions: [], activeVersionIndex: 0 },
          ...after,
        ];
      });
      setIsAssistantTyping(true);
      streamAbortControllerRef.current?.abort();
      const controller = new AbortController();
      streamAbortControllerRef.current = controller;
      streamChatResponse(
        messagesForApi,
        assistantId,
        (errorMessage) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: `**Помилка:** ${errorMessage}`,
                    versions: [
                      {
                        content: `**Помилка:** ${errorMessage}`,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                    activeVersionIndex: 0,
                  }
                : m
            )
          );
        },
        controller.signal
      );
    },
    [messages, streamChatResponse]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      setTargetValue(next);
      setValue(next);
      resizeTextarea(e.target, hasMessages);
    },
    [resizeTextarea, hasMessages]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (canSend) handleSend();
      }
    },
    [canSend, handleSend]
  );

  const handleAttach = useCallback((files: File[]) => {
    const newItems: AttachedFile[] = Array.from(files).map((file) => ({
      file,
      previewUrl:
        file.type.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/i.test(file.name)
          ? URL.createObjectURL(file)
          : null,
    }));
    setAttachedFiles((prev) => [...prev, ...newItems]);
  }, []);

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
