'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
} from 'react';

import { AttachmentsPanelCollapsed, AttachmentsPanelExpanded } from '@/components/attachments';
import { ChatFileDropOverlay } from '@/components/chat/ChatFileDropOverlay';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMeta } from '@/components/chat/ChatMeta';
import { MessageList } from '@/components/chat/MessageList';
import { cn } from '@/lib/utils';
import { useWorkspaceChat } from '@/workspace-chat';

interface WorkspaceScreenProps {
  routeChatId: string | null;
}

type ChatScrollAreaStyle = CSSProperties & {
  '--chat-composer-offset': string;
};

export function WorkspaceScreen({ routeChatId }: WorkspaceScreenProps) {
  const chat = useWorkspaceChat({ routeChatId });
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [composerHeight, setComposerHeight] = useState(0);
  const dragDepthRef = useRef(0);
  const [isFileDropActive, setIsFileDropActive] = useState(false);

  const isFileDragEvent = useCallback((event: ReactDragEvent<HTMLElement>) => {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }, []);

  const handleDragEnter = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsFileDropActive(true);
    },
    [isFileDragEvent]
  );

  const handleDragOver = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      if (!isFileDropActive) {
        setIsFileDropActive(true);
      }
    },
    [isFileDragEvent, isFileDropActive]
  );

  const handleDragLeave = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsFileDropActive(false);
      }
    },
    [isFileDragEvent]
  );

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (!isFileDragEvent(event)) return;
      event.preventDefault();
      dragDepthRef.current = 0;
      setIsFileDropActive(false);

      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length > 0) {
        chat.handleAttach(files);
      }
    },
    [chat, isFileDragEvent]
  );

  useEffect(() => {
    if (!chat.systemPromptEditorOpen) return;
    const element = systemPromptTextareaRef.current;
    if (!element) return;

    element.style.height = 'auto';
    const nextHeight = Math.min(Math.max(element.scrollHeight, 88), 320);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > 320 ? 'auto' : 'hidden';
  }, [chat.systemPromptDraft, chat.systemPromptEditorOpen]);

  useLayoutEffect(() => {
    const element = composerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const syncComposerHeight = () => {
      const nextHeight = Math.round(element.getBoundingClientRect().height);
      setComposerHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight
      );
    };

    syncComposerHeight();

    const resizeObserver = new ResizeObserver(() => {
      syncComposerHeight();
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [chat.attachedFiles.length, chat.filesExpanded, chat.hasMessages]);

  const chatInputBoxClasses = cn(
    'flex flex-col rounded-2xl',
    chat.hasMessages
      ? 'box-border min-h-[103px] overflow-hidden bg-[#F6F6F6] px-[13px] pb-2 pt-[13px]'
      : 'bg-[#F7F7F7] px-4 pb-4 pt-3'
  );

  const attachmentsPanelProps = {
    fileSearchQuery: chat.fileSearchQuery,
    onFileSearchQueryChange: chat.setFileSearchQuery,
    onRemoveAll: chat.handleRemoveAllFiles,
    selectedFormats: chat.selectedFormats,
    onSelectedFormatsChange: chat.setSelectedFormats,
    availableFormatOptions: chat.availableFormatOptions,
    filteredAttachedFiles: chat.filteredAttachedFiles,
    onRemove: (originalIndex: number) => chat.handleRemoveFile(originalIndex),
    fileListScrollRef: chat.fileListScrollRef,
  };

  const chatInputProps = {
    value: chat.value,
    onChange: chat.handleChange,
    onKeyDown: chat.handleKeyDown,
    onSend: chat.handleSend,
    canSend: chat.canSend,
    isGenerationInProgress: chat.isGenerationInProgress,
    isStoppingGeneration: chat.isStoppingGeneration,
    onStopGeneration: chat.handleStopGeneration,
    hasMessages: chat.hasMessages,
    placeholder: 'Запитайте будь-що',
    fileInputRef: chat.fileInputRef,
    textareaRef: chat.textareaRef,
    systemPromptEditorOpen: chat.systemPromptEditorOpen,
    onSystemPromptEditorToggle: chat.openSystemPromptEditor,
    showExpandButton: chat.showExpandButton,
    onExpandToggle: chat.handleExpandToggle,
    filesExpanded: chat.filesExpanded,
    onAttach: chat.handleAttach,
  };

  const chatScrollAreaStyle: ChatScrollAreaStyle = {
    '--chat-composer-offset': `${composerHeight}px`,
    scrollPaddingBottom: 'calc(var(--chat-composer-offset, 0px) + 24px)',
  };

  return (
    <main
      className="relative flex h-full flex-1 flex-col overflow-visible bg-transparent"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ChatMeta hasMessages={chat.hasMessages} compact={chat.tipsButtonCompact} />

      {chat.isHydratingChat ? (
        <div className="flex flex-1 items-center justify-center px-5 pb-16">
          <p className="text-center font-sans text-[16px] leading-6 text-[#727272]">
            Завантаження чату...
          </p>
        </div>
      ) : !chat.hasMessages ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16">
          {chat.attachedFiles.length === 0 && (
            <p className="mb-9.5 text-center font-sans text-[22.587px] leading-normal font-bold text-black">
              Доброго ранку, Олександре!
            </p>
          )}
          <div className="relative w-full max-w-173.25">
            {chat.attachedFiles.length > 0 && chat.filesExpanded && (
              <AttachmentsPanelExpanded {...attachmentsPanelProps} variant="home" />
            )}
            <div className={chatInputBoxClasses}>
              {chat.attachedFiles.length > 0 && !chat.filesExpanded && (
                <AttachmentsPanelCollapsed
                  attachedFiles={chat.attachedFiles}
                  onRemove={chat.handleRemoveFile}
                  fileListRef={chat.fileListRef}
                />
              )}
              <ChatInput {...chatInputProps} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className="flex min-h-0 flex-1 flex-col overflow-x-visible overflow-y-auto bg-transparent"
            style={chatScrollAreaStyle}
          >
            <div className="flex min-h-full flex-col">
              <div className="box-border w-full flex-1 px-5">
                <div className="mx-auto w-full max-w-184.5">
                  <MessageList
                    messages={chat.messages}
                    isAssistantTyping={chat.isAssistantTyping}
                    regeneratingMessageId={chat.regeneratingMessageId}
                    scrollToBottomRequest={chat.scrollToBottomRequest}
                    suppressAutoScroll={chat.suppressAutoScroll}
                    onSuggestionClick={chat.handleSuggestionClick}
                    onRegenerate={chat.handleRegenerate}
                    onEditMessage={chat.handleEditMessage}
                    onSetActiveVersion={chat.handleSetActiveVersion}
                    thinkingPreviewPinned={chat.thinkingPreviewPinned}
                    className="pb-[calc(var(--chat-composer-offset,0px)+24px)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            ref={composerRef}
            className="absolute right-3 bottom-0 left-0 isolate z-10 rounded-t-4xl bg-white px-5 pt-3.25 pb-6 shadow-[0_-18px_36px_rgba(255,255,255,0.96)]"
          >
            <div className="mx-auto -mt-3 w-full max-w-184.5">
              {chat.attachedFiles.length > 0 && chat.filesExpanded && (
                <AttachmentsPanelExpanded {...attachmentsPanelProps} variant="chat" />
              )}
              <div className={chatInputBoxClasses}>
                {chat.attachedFiles.length > 0 && !chat.filesExpanded && (
                  <AttachmentsPanelCollapsed
                    attachedFiles={chat.attachedFiles}
                    onRemove={chat.handleRemoveFile}
                    fileListRef={chat.fileListRef}
                  />
                )}
                <ChatInput {...chatInputProps} />
              </div>
            </div>
          </div>
        </div>
      )}

      {isFileDropActive && <ChatFileDropOverlay />}

      {chat.systemPromptEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-prompt-editor-title"
          className="fixed inset-0 z-100 box-border flex items-center justify-center p-6"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden
            onClick={chat.handleSystemPromptCancel}
          />
          <div
            id="system-prompt-editor-dialog"
            className="relative w-full max-w-130 rounded-[26px] border border-[#F4F4F4] bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="system-prompt-editor-title"
              className="mb-4 text-lg font-semibold text-[#2A2A2A]"
            >
              Системний промпт
            </h2>
            <textarea
              ref={systemPromptTextareaRef}
              value={chat.systemPromptDraft}
              onChange={(event) => chat.setSystemPromptDraft(event.target.value)}
              placeholder="Твоя задача давати мені повні відповіді..."
              rows={3}
              className="box-border max-h-80 min-h-22 w-full resize-none rounded-xl border border-[#E0E0E0] p-3 text-sm leading-[1.4] text-[#2A2A2A] outline-none focus:border-[#E0E0E0] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
              aria-label="Системний промпт"
            />
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={chat.handleSystemPromptCancel}
                className="cursor-pointer rounded-lg border border-[#E0E0E0] bg-white px-4 py-2.5 text-sm text-[#2A2A2A] transition-colors hover:bg-gray-50"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={chat.handleSystemPromptApply}
                className="cursor-pointer rounded-lg bg-[#2A2A2A] px-4 py-2.5 text-sm text-white transition-colors hover:bg-black"
              >
                Застосувати
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default WorkspaceScreen;
