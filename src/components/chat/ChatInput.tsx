'use client';

import React from 'react';

import {
  PaperclipIcon,
  SystemPromptIcon,
  DecorativeSparkleIcon,
  DecorativeShapeIcon,
  ChevronDownIcon,
  StopGenerationIcon,
  ChatSendIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

export const HOME_TEXTAREA_MIN_HEIGHT = 82;
export const HOME_TEXTAREA_MAX_HEIGHT = 280;
export const CHAT_TEXTAREA_MIN_HEIGHT = 30;
export const CHAT_TEXTAREA_MAX_HEIGHT = 240;
export const AI_SPACE_EDITOR_ACTIVE_BG = '#EFEFEF';

export interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  canSend: boolean;
  isGenerationInProgress: boolean;
  isStoppingGeneration: boolean;
  onStopGeneration: () => void;
  hasMessages: boolean;
  placeholder?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  systemPromptEditorOpen: boolean;
  onSystemPromptEditorToggle: () => void;
  showExpandButton: boolean;
  onExpandToggle: () => void;
  filesExpanded: boolean;
  onAttach: (files: File[]) => void;
}

export function ChatInput({
  value,
  onChange,
  onKeyDown,
  onSend,
  canSend,
  isGenerationInProgress,
  isStoppingGeneration,
  onStopGeneration,
  hasMessages,
  placeholder = 'Запитайте будь-що',
  fileInputRef,
  textareaRef,
  systemPromptEditorOpen,
  onSystemPromptEditorToggle,
  showExpandButton,
  onExpandToggle,
  filesExpanded,
  onAttach,
}: ChatInputProps) {
  return (
    <>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        className={cn(
          'w-full resize-none border-none bg-transparent font-sans text-[16px] leading-6 font-normal tracking-[0.14px] text-black caret-black outline-none placeholder:text-[#8C8C8C]',
          hasMessages
            ? 'h-7.5 max-h-60 min-h-7.5 overflow-y-auto'
            : 'h-20.5 max-h-70 min-h-20.5 overflow-y-hidden'
        )}
      />
      <div
        className={cn(
          'flex shrink-0 items-center justify-between',
          hasMessages ? 'mt-1.5' : 'mt-3'
        )}
      >
        <div className="flex h-10 shrink-0 items-center gap-0.5 rounded-[9px] bg-[#EDEDED] px-2.5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="*/*"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) onAttach(Array.from(files));
              e.target.value = '';
            }}
            aria-hidden
            tabIndex={-1}
          />

          {/* File Upload Button */}
          <button
            type="button"
            className="workspace-action-btn workspace-icon-btn flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0"
            aria-label="Завантажити файл"
            onClick={() => fileInputRef.current?.click()}
          >
            <PaperclipIcon width={16} height={16} className="text-[#575757]" aria-hidden="true" />
          </button>

          {/* System Prompt Editor Toggle */}
          <button
            type="button"
            className={cn(
              'workspace-action-btn workspace-icon-btn flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-md p-0',
              systemPromptEditorOpen
                ? 'border border-[#E0E0E0] bg-[#F4F4F4]'
                : 'border-none bg-transparent'
            )}
            aria-label="Редактор промпту"
            aria-pressed={systemPromptEditorOpen}
            onClick={onSystemPromptEditorToggle}
          >
            <SystemPromptIcon
              width={16}
              height={16}
              className="text-[#575757]"
              aria-hidden="true"
            />
          </button>

          {/* Decorative Elements */}
          <span
            aria-hidden
            className="pointer-events-none flex h-7.5 w-7.5 shrink-0 items-center justify-center select-none"
          >
            <DecorativeSparkleIcon width={16} height={16} className="text-[#D0D0D0]" />
          </span>
          <span
            aria-hidden
            className="pointer-events-none flex h-7.5 w-7.5 shrink-0 items-center justify-center select-none"
          >
            <DecorativeShapeIcon width={16} height={16} className="text-[#D0D0D0]" />
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showExpandButton && (
            <button
              type="button"
              onClick={onExpandToggle}
              className="workspace-action-btn workspace-icon-btn workspace-icon-btn--no-hover-scale flex h-9.25 w-9.25 cursor-pointer items-center justify-center rounded-lg border-none bg-[#EDEDED] p-0"
              aria-label={filesExpanded ? 'Згорнути файли' : 'Розгорнути файли'}
            >
              <span
                className={cn(
                  'flex items-center justify-center transition-transform duration-400 ease-[cubic-bezier(0.34,1.2,0.64,1)]',
                  filesExpanded ? 'rotate-180' : 'rotate-0'
                )}
              >
                <ChevronDownIcon
                  width={20}
                  height={20}
                  className="text-[#6B6B6B]"
                  aria-hidden="true"
                />
              </span>
            </button>
          )}

          {/* Action Button (Stop or Send) */}
          {isStoppingGeneration ? (
            <button
              type="button"
              disabled
              className="flex h-11 w-11 shrink-0 cursor-default items-center justify-center rounded-lg border-none bg-[#E3E3E3] p-0.75"
              aria-label="Зупиняємо генерацію"
            >
              <StopGenerationIcon
                width={38}
                height={38}
                className="text-[#8A8A8A]"
                aria-hidden="true"
              />
            </button>
          ) : isGenerationInProgress ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="workspace-action-btn animate-pulse-subtle flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-[#F0F0F0] p-0.75"
              aria-label="Зупинити генерацію"
            >
              <StopGenerationIcon
                width={38}
                height={38}
                className="text-[#2A2A2A]"
                aria-hidden="true"
              />
            </button>
          ) : (
            <button
              disabled={!canSend}
              onClick={onSend}
              className={cn(
                'workspace-action-btn workspace-send-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-none bg-transparent p-0.75',
                canSend ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
              aria-label="Надіслати повідомлення"
            >
              <ChatSendIcon
                width={38}
                height={38}
                canSend={canSend}
                className={canSend ? 'text-[#2A2A2A]' : ''}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
