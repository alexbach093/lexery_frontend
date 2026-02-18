'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

import { FilePreview } from './file-preview';

interface WorkspaceMainProps {
  className?: string;
}

const TEXTAREA_MIN_HEIGHT = 82;
const TEXTAREA_MAX_HEIGHT = 240;

/** One attached file and its object URL for preview (revoked on remove). */
interface AttachedFile {
  file: File;
  previewUrl: string | null;
}

/**
 * Workspace Main Content - AI Chat Interface
 *
 * Figma: node 0:1339 (AI box)
 * Contains: Greeting, Chat input, Action buttons
 */
export function WorkspaceMain({ className }: WorkspaceMainProps) {
  const [value, setValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEmpty = value.trim().length === 0;

  const resizeTextarea = useCallback((el: HTMLTextAreaElement) => {
    // Reset to auto first so it can shrink when lines are deleted
    el.style.height = 'auto';
    const clamped = Math.min(Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT), TEXTAREA_MAX_HEIGHT);
    el.style.height = `${clamped}px`;
    el.style.overflowY = el.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      resizeTextarea(e.target);
    },
    [resizeTextarea]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends; Shift+Enter inserts a new line
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim()) {
          // TODO: wire up to actual send handler
          console.log('Send:', value);
          setValue('');
          if (textareaRef.current) {
            textareaRef.current.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
            textareaRef.current.style.overflowY = 'hidden';
          }
        }
      }
    },
    [value]
  );

  return (
    <main
      className={className}
      style={{
        marginLeft: '260px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top Bar - Поради Button */}
      <div
        style={{
          position: 'absolute',
          top: '29px',
          right: '28px',
        }}
      >
        <button
          style={{
            display: 'flex',
            gap: '9px',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            padding: '7px 14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E7E8',
            borderRadius: '5px',
            cursor: 'pointer',
            minWidth: '90px',
          }}
        >
          <Image src="/images/workspace/tips.svg" alt="" width={10} height={15} />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '11.941px',
              lineHeight: '16.718px',
              letterSpacing: '0.1194px',
              color: '#040404',
            }}
          >
            Поради
          </p>
        </button>
      </div>

      {/* Center Content */}
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
        {/* Greeting */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '22.587px',
            fontWeight: 700,
            lineHeight: 'normal',
            color: '#000000',
            textAlign: 'center',
            marginBottom: '38px',
          }}
        >
          Доброго ранку, Олександре!
        </p>

        {/* Chat Input Container */}
        <div
          style={{
            width: '693px',
            maxWidth: '100%',
            position: 'relative',
          }}
        >
          {/* Input Box — flex column. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#F7F7F7',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            {/* Attached file preview(s) — thumbnail, name, size, remove. TODO: back-end upload will use attachedFiles when send is implemented. */}
            {attachedFiles.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                {attachedFiles.map((item, index) => (
                  <FilePreview
                    key={`${item.file.name}-${item.file.size}-${index}`}
                    file={item.file}
                    previewUrl={item.previewUrl}
                    onRemove={() => {
                      if (item.previewUrl) {
                        URL.revokeObjectURL(item.previewUrl);
                      }
                      setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                  />
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Запитайте будь-що"
              className="placeholder:text-[#8C8C8C]"
              rows={1}
              style={{
                width: '100%',
                height: `${TEXTAREA_MIN_HEIGHT}px`,
                minHeight: `${TEXTAREA_MIN_HEIGHT}px`,
                maxHeight: `${TEXTAREA_MAX_HEIGHT}px`,
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
                overflowY: 'hidden',
              }}
            />

            {/* Bottom Actions */}
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Left Actions - 4 individual icons inside pill; equal spacing between icons */}
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
                {/* Hidden file input — triggered by paperclip; upload/API handled elsewhere */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="*/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files?.length) {
                      const newItems: AttachedFile[] = Array.from(files).map((file) => {
                        const isImage =
                          file.type.startsWith('image/') ||
                          file.name.toLowerCase().endsWith('.svg');
                        return {
                          file,
                          previewUrl: isImage ? URL.createObjectURL(file) : null,
                        };
                      });
                      setAttachedFiles((prev) => [...prev, ...newItems]);
                      // TODO: back-end upload / send will use attachedFiles when implemented
                    }
                    e.target.value = '';
                  }}
                  aria-hidden="true"
                  tabIndex={-1}
                />
                {/* Paperclip — opens file picker */}
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
                    aria-hidden="true"
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

                {/* Pencil — clickable */}
                <button
                  className="workspace-action-btn workspace-icon-btn"
                  aria-label="Редагувати"
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
                    viewBox="28.3 0 13.5 13.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M35.0366 4.26644L37.4843 6.7141M28.9175 12.8333V9.77368L38.0962 0.594947L41.1558 3.65452L31.9771 12.8333H28.9175Z"
                      stroke="#575757"
                      strokeWidth="1.16071"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Camera/settings — decorative, non-interactive */}
                <span
                  aria-hidden="true"
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

                {/* Hexagon — decorative, non-interactive */}
                <span
                  aria-hidden="true"
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

              {/* Right Action - Send Button */}
              <button
                disabled={isEmpty}
                onClick={() => {
                  // TODO: wire up to actual send handler
                  console.log('Send:', value);
                  setValue('');
                  if (textareaRef.current) {
                    textareaRef.current.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
                    textareaRef.current.style.overflowY = 'hidden';
                  }
                }}
                className="workspace-action-btn workspace-send-btn"
                style={{
                  width: '44px',
                  height: '44px',
                  padding: '3px',
                  border: 'none',
                  cursor: isEmpty ? 'not-allowed' : 'pointer',
                  backgroundColor: 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'opacity 0.15s ease',
                }}
                aria-label="Надіслати повідомлення"
              >
                {/* Inline SVG so we can change fill colour based on isEmpty */}
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 37 37"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="0.37"
                    y="0.37"
                    width="36.26"
                    height="36.26"
                    rx="8.63"
                    fill={isEmpty ? '#EDEDED' : '#2A2A2A'}
                    style={{ transition: 'fill 0.15s ease' }}
                  />
                  {!isEmpty && (
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
                    fill={isEmpty ? '#ABABAB' : 'white'}
                    style={{ transition: 'fill 0.15s ease' }}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default WorkspaceMain;
