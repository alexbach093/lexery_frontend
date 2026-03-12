'use client';

import React from 'react';

import { EditSquareIcon } from '@/components/ui/edit-square-icon';

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
  const minH = hasMessages ? CHAT_TEXTAREA_MIN_HEIGHT : HOME_TEXTAREA_MIN_HEIGHT;
  const maxH = hasMessages ? CHAT_TEXTAREA_MAX_HEIGHT : HOME_TEXTAREA_MAX_HEIGHT;

  return (
    <>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="placeholder:text-[#8C8C8C]"
        rows={1}
        style={{
          width: '100%',
          height: `${minH}px`,
          minHeight: `${minH}px`,
          maxHeight: `${maxH}px`,
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '24px',
          letterSpacing: '0.14px',
          color: '#000000',
          caretColor: '#000000',
          resize: 'none',
          overflowY: hasMessages ? 'auto' : 'hidden',
        }}
      />
      <div
        style={{
          marginTop: hasMessages ? '6px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: '#EDEDED',
            borderRadius: '9px',
            height: '40px',
            padding: '0 10px',
            flexShrink: 0,
          }}
        >
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
          <button
            type="button"
            className="workspace-action-btn workspace-icon-btn"
            aria-label="Завантажити файл"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '6px',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 9.5 13.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M0.585589 8.75382L0.585589 4.67438C0.58559 2.42137 2.41202 0.594947 4.66503 0.594947C6.91804 0.594947 8.74446 2.42137 8.74446 4.67438V10.1136C8.74446 11.6156 7.52685 12.8333 6.02484 12.8333C4.52283 12.8333 3.30521 11.6156 3.30521 10.1136V4.67438C3.30521 3.92338 3.91402 3.31457 4.66503 3.31457C5.41603 3.31457 6.02484 3.92338 6.02484 4.67438L6.02484 10.1136"
                stroke="#575757"
                strokeWidth="1.16071"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="workspace-action-btn workspace-icon-btn"
            aria-label="Редактор промпту"
            aria-pressed={systemPromptEditorOpen}
            onClick={onSystemPromptEditorToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              border: systemPromptEditorOpen ? '1px solid #0070f3' : 'none',
              background: systemPromptEditorOpen ? AI_SPACE_EDITOR_ACTIVE_BG : 'transparent',
              cursor: 'pointer',
              borderRadius: '6px',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <EditSquareIcon
              size={15}
              color={systemPromptEditorOpen ? '#0070f3' : '#575757'}
              strokeWidth={11.4}
            />
          </button>
          <span
            aria-hidden
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              flexShrink: 0,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="60.7 0 12.6 13.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M68.0212 12.4455L71.5826 10.4548C71.9627 10.2423 72.1525 10.136 72.2907 9.98734C72.413 9.85581 72.5055 9.70089 72.562 9.53256C72.6257 9.34277 72.6257 9.13067 72.6257 8.70765V4.72043C72.6257 4.2974 72.6257 4.08533 72.562 3.89554C72.5055 3.72721 72.413 3.57216 72.2907 3.44063C72.1531 3.29262 71.9638 3.18681 71.5869 2.97614L68.0206 0.982682C67.6404 0.770173 67.4507 0.664134 67.2486 0.622545C67.0698 0.585748 66.8849 0.585748 66.7061 0.622545C66.504 0.664134 66.3137 0.770173 65.9335 0.982682L62.3715 2.97376C61.9917 3.18602 61.802 3.29207 61.6638 3.44063C61.5415 3.57216 61.4491 3.72721 61.3926 3.89554C61.3288 4.08578 61.3288 4.2984 61.3288 4.72342V8.70483C61.3288 9.12985 61.3288 9.34232 61.3926 9.53256C61.4491 9.70089 61.5415 9.85581 61.6638 9.98734C61.8021 10.136 61.9919 10.2423 62.3721 10.4548L65.9335 12.4455C66.3137 12.658 66.504 12.7641 66.7061 12.8057C66.8849 12.8425 67.0698 12.8425 67.2486 12.8057C67.4507 12.7641 67.641 12.658 68.0212 12.4455Z"
                stroke="#D0D0D0"
                strokeWidth="1.16071"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M65.0205 6.71404C65.0205 7.7603 65.8966 8.60846 66.9773 8.60846C68.0579 8.60846 68.934 7.7603 68.934 6.71404C68.934 5.66778 68.0579 4.81962 66.9773 4.81962C65.8966 4.81962 65.0205 5.66778 65.0205 6.71404Z"
                stroke="#D0D0D0"
                strokeWidth="1.16071"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            aria-hidden
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              flexShrink: 0,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="92.2 0 11.9 13.3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M98.1067 0.585343L103.414 3.64978V8.69714C103.414 9.36638 103.057 9.98478 102.478 10.3194L99.0433 12.3023C98.4637 12.6369 97.7497 12.6369 97.1701 12.3023L93.7355 10.3194C93.156 9.98478 92.7989 9.36638 92.7989 8.69714V3.64978L98.1067 0.585343Z"
                stroke="#D0D0D0"
                strokeWidth="1.16071"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M98.1068 3.30915V6.71407L95.158 8.41654"
                stroke="#D0D0D0"
                strokeWidth="1.16071"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M98.107 6.71433L101.056 8.4168"
                stroke="#D0D0D0"
                strokeWidth="1.16071"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {showExpandButton && (
            <button
              type="button"
              onClick={onExpandToggle}
              className="workspace-action-btn workspace-icon-btn workspace-icon-btn--no-hover-scale"
              style={{
                width: '37px',
                height: '37px',
                padding: 0,
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#EDEDED',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={filesExpanded ? 'Згорнути файли' : 'Розгорнути файли'}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: filesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B6B6B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </span>
            </button>
          )}
          {isGenerationInProgress ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="workspace-action-btn animate-pulse-subtle"
              style={{
                width: '44px',
                height: '44px',
                padding: '3px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#F0F0F0',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
              aria-label="Stop generation"
            >
              <svg
                width="38"
                height="38"
                viewBox="0 0 37 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect x="11.5" y="11.5" width="14" height="14" rx="2" fill="#2A2A2A" />
              </svg>
            </button>
          ) : (
            <button
              disabled={!canSend}
              onClick={onSend}
              className="workspace-action-btn workspace-send-btn"
              style={{
                width: '44px',
                height: '44px',
                padding: '3px',
                border: 'none',
                cursor: canSend ? 'pointer' : 'not-allowed',
                backgroundColor: 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
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
