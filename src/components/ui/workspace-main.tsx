'use client';

import { useRef, useEffect } from 'react';

import { AttachmentsPanelCollapsed, AttachmentsPanelExpanded } from '@/features/attachments';
import { ChatInput } from '@/features/chat-input';
import { ChatMeta } from '@/features/chat-meta';
import { MessageList } from '@/features/message-list';
import { useWorkspaceChat } from '@/hooks/use-workspace-chat';

const CHAT_INPUT_MAX_WIDTH = 738;

export interface WorkspaceMainProps {
  className?: string;
  onReady?: () => void;
}

export function WorkspaceMain({ className, onReady }: WorkspaceMainProps) {
  const chat = useWorkspaceChat(onReady);
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const SYSTEM_PROMPT_MIN_H = 88;
  const SYSTEM_PROMPT_MAX_H = 320;

  useEffect(() => {
    if (!chat.systemPromptEditorOpen) return;
    const el = systemPromptTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const h = Math.min(Math.max(el.scrollHeight, SYSTEM_PROMPT_MIN_H), SYSTEM_PROMPT_MAX_H);
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > SYSTEM_PROMPT_MAX_H ? 'auto' : 'hidden';
  }, [chat.systemPromptEditorOpen, chat.systemPrompt]);

  const chatInputBoxStyle = chat.hasMessages
    ? {
        minHeight: '103px',
        backgroundColor: 'rgba(245, 246, 246, 1)',
        borderRadius: '16px',
        padding: '13px 13px 8px 13px',
        boxSizing: 'border-box' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
      }
    : {
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: '#F7F7F7',
        borderRadius: '16px',
        padding: '12px 16px 16px',
      };

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
    onStopGeneration: chat.handleStopGeneration,
    hasMessages: chat.hasMessages,
    placeholder: 'Запитайте будь-що',
    fileInputRef: chat.fileInputRef,
    textareaRef: chat.textareaRef,
    systemPromptEditorOpen: chat.systemPromptEditorOpen,
    onSystemPromptEditorToggle: () => chat.setSystemPromptEditorOpen(true),
    showExpandButton: chat.showExpandButton,
    onExpandToggle: chat.handleExpandToggle,
    filesExpanded: chat.filesExpanded,
    onAttach: chat.handleAttach,
  };

  return (
    <main
      className={className}
      style={{
        height: '100%',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flex: 1,
        overflow: 'visible',
      }}
    >
      <ChatMeta hasMessages={chat.hasMessages} compact={chat.tipsButtonCompact} />
      {!chat.hasMessages ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '0 20px 64px',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '22.587px',
              fontWeight: 700,
              lineHeight: 'normal',
              color: '#000',
              textAlign: 'center',
              marginBottom: '38px',
            }}
          >
            Доброго ранку, Олександре!
          </p>
          <div style={{ width: '693px', maxWidth: '100%', position: 'relative' }}>
            {chat.attachedFiles.length > 0 && chat.filesExpanded && (
              <AttachmentsPanelExpanded {...attachmentsPanelProps} variant="home" />
            )}
            <div style={chatInputBoxStyle}>
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
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'visible',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'transparent',
            }}
          >
            <div style={{ width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
              <div
                style={{ width: `${CHAT_INPUT_MAX_WIDTH}px`, maxWidth: '100%', margin: '0 auto' }}
              >
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
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              padding: '13px 20px 24px',
              backgroundColor: 'rgba(0,0,0,0)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              zIndex: 10,
              isolation: 'isolate',
            }}
          >
            <div style={{ width: `${CHAT_INPUT_MAX_WIDTH}px`, margin: '-12px auto 0' }}>
              {chat.attachedFiles.length > 0 && chat.filesExpanded && (
                <AttachmentsPanelExpanded {...attachmentsPanelProps} variant="chat" />
              )}
              <div style={chatInputBoxStyle}>
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
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
          onClick={() => chat.setSystemPromptEditorOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}
            aria-hidden
          />
          <div
            id="system-prompt-editor-dialog"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#fff',
              border: '1px solid #F4F4F6',
              borderRadius: '26px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="system-prompt-editor-title"
              style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, color: '#2A2A2A' }}
            >
              Системний промпт
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#575757' }}>
              Системний промпт для чату (опційно).
            </p>
            <textarea
              ref={systemPromptTextareaRef}
              value={chat.systemPrompt}
              onChange={(e) => chat.setSystemPrompt(e.target.value)}
              placeholder="Твоя задача давати мені повні відповіді..."
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                fontSize: '14px',
                lineHeight: '1.4',
                color: '#2A2A2A',
                resize: 'none',
                minHeight: `${SYSTEM_PROMPT_MIN_H}px`,
                maxHeight: `${SYSTEM_PROMPT_MAX_H}px`,
                overflowY: 'hidden',
              }}
              aria-label="Системний промпт"
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '16px',
              }}
            >
              <button
                type="button"
                onClick={() => chat.setSystemPromptEditorOpen(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: '#2A2A2A',
                  cursor: 'pointer',
                }}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => chat.setSystemPromptEditorOpen(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2A2A2A',
                  fontSize: '14px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
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

export default WorkspaceMain;
