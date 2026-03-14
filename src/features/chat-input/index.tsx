'use client';

import Image from 'next/image';
import React from 'react';

import { cn } from '@/lib/utils';

export const HOME_TEXTAREA_MIN_HEIGHT = 82;
export const HOME_TEXTAREA_MAX_HEIGHT = 280;
export const CHAT_TEXTAREA_MIN_HEIGHT = 30;
export const CHAT_TEXTAREA_MAX_HEIGHT = 240;
export const AI_SPACE_EDITOR_ACTIVE_BG = '#E8F0FE';

export interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  canSend: boolean;
  isGenerationInProgress: boolean;
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
            <Image src="/icons/chat-input-attach.svg" alt="" width={16} height={16} aria-hidden />
          </button>

          {/* System Prompt Editor Toggle */}
          <button
            type="button"
            className={cn(
              'workspace-action-btn workspace-icon-btn flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-md p-0',
              systemPromptEditorOpen
                ? 'border border-[#0070f3] bg-[#E8F0FE]'
                : 'border-none bg-transparent'
            )}
            aria-label="Редактор промпту"
            aria-pressed={systemPromptEditorOpen}
            onClick={onSystemPromptEditorToggle}
          >
            <svg
              width="16"
              height="16"
              viewBox="28.3 0 13.5 13.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M35.0366 4.26644L37.4843 6.7141M28.9175 12.8333V9.77368L38.0962 0.594947L41.1558 3.65452L31.9771 12.8333H28.9175Z"
                stroke={systemPromptEditorOpen ? '#0070f3' : '#575757'}
                strokeWidth="1.16071"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Decorative Elements */}
          <span
            aria-hidden
            className="pointer-events-none flex h-7.5 w-7.5 shrink-0 items-center justify-center select-none"
          >
            <Image src="/icons/chat-input-deco-1.svg" alt="" width={16} height={16} aria-hidden />
          </span>
          <span
            aria-hidden
            className="pointer-events-none flex h-7.5 w-7.5 shrink-0 items-center justify-center select-none"
          >
            <Image src="/icons/chat-input-deco-2.svg" alt="" width={16} height={16} aria-hidden />
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
                <Image
                  src="/icons/chat-input-expand.svg"
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden
                />
              </span>
            </button>
          )}

          {/* Action Button (Stop or Send) */}
          {isGenerationInProgress ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="workspace-action-btn animate-pulse-subtle flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-[#F0F0F0] p-0.75"
              aria-label="Stop generation"
            >
              <Image src="/icons/stop.svg" alt="" width={38} height={38} aria-hidden />
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
              <svg
                width="38"
                height="38"
                viewBox="0 0 37 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect
                  x="0.37"
                  y="0.37"
                  width="36.26"
                  height="36.26"
                  rx="8.63"
                  fill={canSend ? '#2A2A2A' : '#EDEDED'}
                />
                {canSend && (
                  <rect
                    x="0.37"
                    y="0.37"
                    width="36.26"
                    height="36.26"
                    rx="8.63"
                    stroke="#9A9A9A"
                    strokeWidth="0.74"
                  />
                )}
                <path
                  d="M24.8618 13.2114L24.8618 22.2812C24.8618 22.4222 24.8341 22.5618 24.7801 22.692C24.7262 22.8222 24.6471 22.9405 24.5475 23.0402C24.4478 23.1398 24.3295 23.2189 24.1993 23.2728C24.0691 23.3268 23.9295 23.3545 23.7886 23.3545C23.6476 23.3545 23.5081 23.3268 23.3779 23.2728C23.2476 23.2189 23.1293 23.1398 23.0297 23.0402C22.93 22.9405 22.8509 22.8222 22.797 22.692C22.7431 22.5618 22.7153 22.4222 22.7153 22.2812L22.7229 15.7888L13.9629 24.5487C13.7625 24.7492 13.4906 24.8618 13.2071 24.8618C12.9236 24.8618 12.6517 24.7492 12.4513 24.5487C12.2508 24.3482 12.1382 24.0764 12.1382 23.7929C12.1382 23.5094 12.2508 23.2375 12.4513 23.0371L21.2112 14.2771L14.7187 14.2847C14.4341 14.2847 14.1611 14.1716 13.9598 13.9703C13.7586 13.7691 13.6455 13.4961 13.6455 13.2114C13.6455 12.9268 13.7586 12.6538 13.9598 12.4525C14.1611 12.2512 14.4341 12.1382 14.7187 12.1382L23.7886 12.1382C23.9297 12.1376 24.0695 12.165 24.2 12.2187C24.3305 12.2724 24.449 12.3514 24.5488 12.4512C24.6485 12.551 24.7276 12.6695 24.7813 12.8C24.835 12.9305 24.8624 13.0703 24.8618 13.2114Z"
                  fill={canSend ? 'white' : '#ABABAB'}
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
