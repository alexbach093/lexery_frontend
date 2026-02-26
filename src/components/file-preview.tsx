'use client';

import { useEffect, useState } from 'react';

export interface FilePreviewProps {
  /** The file to display (name, size, type). */
  file: File;
  /** Object URL for thumbnail (image/*). Must be revoked by consumer or on unmount. */
  previewUrl: string | null;
  /** Called when the user clicks the remove (X) button. */
  onRemove: () => void;
  /** У розгорнутому файл-менеджері — однакова ширина картки, без пустих місць справа. */
  uniformWidth?: boolean;
}

/** Розмір квадратного контейнера (як у базових іконок). */
const THUMBNAIL_SIZE = 28;
const THUMBNAIL_RADIUS = 4;
/** Розмір іконки всередині контейнера — менший за фон. */
const ICON_SIZE = 16;
const CARD_RADIUS = 6;
/** Fixed max width so the pill doesn’t stretch; right side stays clear of AI space edge (Perplexity-style). */
const CARD_MAX_WIDTH = 240;

const ICONS_BASE = '/images/file-types';

/** Map extension (lowercase, with dot) → icon slug. Icons from Figma 238:989 (document+icon). */
const EXT_TO_ICON: Record<string, string> = {
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.webp': 'image',
  '.bmp': 'image',
  '.svg': 'image',
  '.avif': 'image',
  '.ico': 'image',
  '.mp4': 'video',
  '.mov': 'video',
  '.avi': 'video',
  '.webm': 'video',
  '.mkv': 'video',
  '.m4v': 'video',
  '.mp3': 'audio',
  '.wav': 'audio',
  '.ogg': 'audio',
  '.m4a': 'audio',
  '.aac': 'audio',
  '.flac': 'audio',
  '.pdf': 'document',
  '.doc': 'document',
  '.docx': 'document',
  '.txt': 'document',
  '.rtf': 'document',
  '.xls': 'document',
  '.xlsx': 'document',
  '.csv': 'document',
  '.md': 'document',
};

function getFileTypeIcon(extension: string): string {
  const ext = extension.toLowerCase();
  return EXT_TO_ICON[ext] ?? 'document';
}

/** Human-readable file size (e.g. 20.4 KB, 1.2 MB) with one decimal place. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb % 1 === 0 ? kb : kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`;
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/i;

function isImageOrSvg(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

/**
 * File preview card: thumbnail, file name, file size, remove button.
 * Matches design: #EBEBEB card, thumbnail with landscape placeholder, dark grey text, X without background.
 * Revokes previewUrl on unmount to avoid memory leaks.
 */
export function FilePreview({ file, previewUrl, onRemove, uniformWidth }: FilePreviewProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Скидаємо помилку, коли змінюється файл або previewUrl (асинхронно, щоб уникнути cascading render)
  useEffect(() => {
    const t = setTimeout(() => setImageError(false), 0);
    return () => clearTimeout(t);
  }, [file.name, file.size, previewUrl]);

  const showImageThumbnail = isImageOrSvg(file) && previewUrl && !imageError;

  const name = file.name;
  const lastDot = name.lastIndexOf('.');
  const hasExtension = lastDot > 0 && lastDot < name.length - 1;
  const baseName = hasExtension ? name.slice(0, lastDot) : name;
  const extension = hasExtension ? name.slice(lastDot) : ''; // e.g. ".pdf"

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        minHeight: '38px',
        backgroundColor: '#EBEBEB',
        borderRadius: CARD_RADIUS,
        width: uniformWidth ? '100%' : 'fit-content',
        maxWidth: uniformWidth ? '100%' : CARD_MAX_WIDTH,
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: square container — format-specific icon or image preview */}
      <div
        style={{
          width: THUMBNAIL_SIZE,
          height: THUMBNAIL_SIZE,
          borderRadius: THUMBNAIL_RADIUS,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#D3D3D3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showImageThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL for user-uploaded preview
          <img
            src={previewUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <img
            src={`${ICONS_BASE}/${getFileTypeIcon(extension)}.svg`}
            alt=""
            width={ICON_SIZE}
            height={ICON_SIZE}
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              objectFit: 'contain',
              display: 'block',
              filter: 'brightness(0) saturate(100%) invert(0.45)',
            }}
          />
        )}
      </div>

      {/* Middle: file name (base + extension) + size */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            minWidth: 0,
            gap: '2px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              letterSpacing: '0.12px',
              color: '#333333',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: hasExtension ? 1 : undefined,
            }}
          >
            {baseName}
          </span>
          {hasExtension && (
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: '0.12px',
                color: '#888888',
                flexShrink: 0,
              }}
            >
              {extension}
            </span>
          )}
        </div>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '10px',
            lineHeight: '14px',
            letterSpacing: '0.1px',
            color: '#888888',
          }}
        >
          {formatFileSize(file.size)}
        </span>
      </div>

      {/* Right: X icon only, no background, dark grey */}
      <button
        type="button"
        onClick={onRemove}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: '4px',
          padding: 0,
          flexShrink: 0,
        }}
        className="workspace-action-btn hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
        aria-label="Видалити файл"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="#575757"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
