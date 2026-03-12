'use client';

import { useState } from 'react';

import { formatFileSize } from '@/components/ui/file-preview';
import type { MessageAttachment } from '@/types/chat';

/** Іконка скріпки для блоку "N вкладень". */
function PaperclipIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="#666666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** User file bubble in chat: світлий блок, thumbnail + filename; розміщений над текстовою бульбашкою. */
function UserFileBubble({ attachment }: { attachment: MessageAttachment }) {
  const { name, size, previewUrl } = attachment;
  const thumbSize = 20;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 7px',
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '7px',
        borderBottomRightRadius: '7px',
        borderBottomLeftRadius: '10px',
        width: 'max-content',
        maxWidth: '180px',
        boxSizing: 'border-box',
        border: '1px solid #E8E8E8',
      }}
    >
      <div
        style={{
          width: thumbSize,
          height: thumbSize,
          borderRadius: '4px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#E0E0E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL from user upload
          <img
            src={previewUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span style={{ color: '#888', fontSize: 9 }}>?</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '14px',
            color: '#333333',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '10px',
            color: '#888888',
          }}
        >
          {formatFileSize(size)}
        </span>
      </div>
    </div>
  );
}

/** Кілька вкладень: рядок "N вкладень" + випадаючий список файлів (не зміщує сторінку). */
function AttachmentsExpandable({ attachments }: { attachments: MessageAttachment[] }) {
  const [expanded, setExpanded] = useState(false);
  const n = attachments.length;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
          zIndex: 20,
          opacity: expanded ? 1 : 0,
          visibility: expanded ? 'visible' : 'hidden',
          transform: expanded ? 'translateY(0)' : 'translateY(-8px)',
          transition:
            'opacity 0.2s cubic-bezier(0.33, 0.8, 0.5, 1), transform 0.2s cubic-bezier(0.33, 0.8, 0.5, 1), visibility 0.2s',
          pointerEvents: expanded ? 'auto' : 'none',
          ...(n > 4 ? { maxHeight: '170px', overflowY: 'auto' as const } : {}),
        }}
      >
        {attachments.map((att, i) => (
          <div
            key={`${att.name}-${att.size}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              backgroundColor: '#F5F5F5',
              border: '1px solid #E8E8E8',
              borderRadius: '10px',
              width: 'max-content',
              maxWidth: '220px',
              boxSizing: 'border-box',
            }}
          >
            {att.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob URL from user upload
              <img
                src={att.previewUrl}
                alt=""
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  objectFit: 'cover',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  backgroundColor: '#E0E0E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="18" cy="6" r="3" fill="#9A9A9A" />
                  <path d="M2 24L10 10h4l8-6v20H2z" fill="#B0B0B0" />
                </svg>
              </div>
            )}
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#333333',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {att.name}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#F5F5F5',
          border: '1px solid #E8E8E8',
          borderRadius: '14px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          color: '#333333',
          boxSizing: 'border-box',
        }}
        className="rounded-xl hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none"
        aria-expanded={expanded}
        aria-label={expanded ? 'Згорнути вкладення' : 'Розгорнути вкладення'}
      >
        <PaperclipIcon />
        <span>
          {n} {n >= 5 ? 'вкладень' : 'вкладення'}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
}

/** Multiple attachments toggle (below text). */
export function MessageAttachmentsMultiple({ attachments }: { attachments: MessageAttachment[] }) {
  return <AttachmentsExpandable attachments={attachments} />;
}

/** Per-message file attachment display (user messages). Convenience when only one or the other. */
export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (attachments.length === 0) return null;
  if (attachments.length === 1) return <UserFileBubble attachment={attachments[0]} />;
  return <AttachmentsExpandable attachments={attachments} />;
}
