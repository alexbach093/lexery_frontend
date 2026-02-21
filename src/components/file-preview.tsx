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

const THUMBNAIL_SIZE = 28;
const THUMBNAIL_RADIUS = 4;
const CARD_RADIUS = 6;
/** Fixed max width so the pill doesn’t stretch; right side stays clear of AI space edge (Perplexity-style). */
const CARD_MAX_WIDTH = 240;

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

/** Generic image/file placeholder: landscape with mountain and sun (per design). */
function PlaceholderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Sun */}
      <circle cx="18" cy="6" r="3" fill="#9A9A9A" />
      {/* Mountain / hill silhouette */}
      <path d="M2 24L10 10h4l8-6v20H2z" fill="#B0B0B0" />
      {/* Folded corner */}
      <path d="M18 4v2h2l-2-2z" fill="#A0A0A0" />
    </svg>
  );
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
      {/* Left: square thumbnail — light grey bg, rounded; image or landscape placeholder */}
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
          <PlaceholderIcon />
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
          width="10"
          height="10"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M3 3l8 8M11 3l-8 8" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
