'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AttachmentsPanelCollapsed, AttachmentsPanelExpanded } from '@/components/attachments';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMeta } from '@/components/chat/ChatMeta';
import { MessageList } from '@/components/chat/MessageList';
import { BootScreen } from '@/components/ui/BootScreen';
import { useBoot } from '@/contexts/boot-context';
import { cn } from '@/lib/utils';
import { useWorkspaceChat } from '@/workspace-chat';

const BOOT_DONE_KEY = 'lexery-boot-done';
const BOOT_FADE_MS = 500;
const MIN_BOOT_MS = 50;

export default function WorkspacePage() {
  const { isBootComplete, setIsBootComplete } = useBoot();

  const [showBoot, setShowBoot] = useState(true);
  const [bootFading, setBootFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootStartRef = useRef<number>(0);
  const completedRef = useRef(false);

  // -- BOOT LOGIC --
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(BOOT_DONE_KEY) === '1') {
      completedRef.current = true;
      queueMicrotask(() => {
        setShowBoot(false);
        setBootFading(false);
        setIsBootComplete(true);
      });
    }
  }, [setIsBootComplete]);

  useEffect(() => {
    bootStartRef.current = Date.now();
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  const handleBootComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (typeof window !== 'undefined') sessionStorage.setItem(BOOT_DONE_KEY, '1');

    setBootFading(true);
    fadeTimeoutRef.current = setTimeout(() => {
      setShowBoot(false);
      setBootFading(false);
      setIsBootComplete(true);
      fadeTimeoutRef.current = null;
    }, BOOT_FADE_MS);
  };

  const handleWorkspaceReady = () => {
    const started = bootStartRef.current || Date.now();
    const elapsed = Date.now() - started;
    const remaining = Math.max(0, MIN_BOOT_MS - elapsed);
    if (remaining === 0) {
      handleBootComplete();
    } else {
      fadeTimeoutRef.current = setTimeout(handleBootComplete, remaining);
    }
  };

  // -- CHAT LOGIC --
  const chat = useWorkspaceChat(handleWorkspaceReady);
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!chat.systemPromptEditorOpen) return;
    const el = systemPromptTextareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    const h = Math.min(Math.max(el.scrollHeight, 88), 320);
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > 320 ? 'auto' : 'hidden';
  }, [chat.systemPromptDraft, chat.systemPromptEditorOpen]);

  const chatInputBoxClasses = cn(
    'flex flex-col rounded-2xl',
    chat.hasMessages
      ? 'box-border min-h-[103px] overflow-hidden bg-[#F5F6F6] px-[13px] pb-2 pt-[13px]'
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

  return (
    <>
      <main
        className={cn(
          'relative flex h-full flex-1 flex-col overflow-visible bg-transparent transition-opacity duration-600 ease-out',
          isBootComplete ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!isBootComplete}
      >
        <ChatMeta hasMessages={chat.hasMessages} compact={chat.tipsButtonCompact} />

        {chat.isHydratingChat ? (
          <div className="flex flex-1 items-center justify-center px-5 pb-16">
            <p className="text-center font-sans text-[16px] leading-6 text-[#6B7280]">
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
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-x-visible overflow-y-auto bg-transparent">
              <div className="box-border w-full px-5">
                <div className="mx-auto w-full max-w-184.5">
                  <MessageList
                    messages={chat.messages}
                    isAssistantTyping={chat.isAssistantTyping}
                    regeneratingMessageId={chat.regeneratingMessageId}
                    onSuggestionClick={chat.handleSuggestionClick}
                    onRegenerate={chat.handleRegenerate}
                    onEditMessage={chat.handleEditMessage}
                    onSetActiveVersion={chat.handleSetActiveVersion}
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 isolate z-10 rounded-t-4xl bg-transparent px-5 pt-3.25 pb-6">
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
              className="relative w-full max-w-130 rounded-[26px] border border-[#F4F4F6] bg-white p-6"
              onClick={(e) => e.stopPropagation()}
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
                onChange={(e) => chat.setSystemPromptDraft(e.target.value)}
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

      {/* Boot Screen Overlay */}
      {showBoot && (
        <div
          className={cn(
            'fixed inset-0 z-[9999] transition-opacity duration-500 ease-out',
            bootFading ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
          )}
          aria-hidden={bootFading}
        >
          <BootScreen duration={60000} onComplete={() => {}} />
        </div>
      )}
    </>
  );
}
