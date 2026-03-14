'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export interface FilePreviewProps {
  /** The file to display (name, size, type). */
  file: File;
  /** Object URL for thumbnail (image/*). Must be revoked by consumer or on unmount. */
  previewUrl: string | null;
  /** Called when the user clicks the remove (X) button. */
  onRemove: () => void;
  /** In expanded file manager - uniform card width, no empty space on the right. */
  uniformWidth?: boolean;
}

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

type FileTypeIconKind = 'image' | 'video' | 'audio' | 'document' | 'file';

function FileTypeIcon({ kind, size = 16 }: { kind: string; size?: number }) {
  const k = (
    kind === 'image' ||
    kind === 'video' ||
    kind === 'audio' ||
    kind === 'document' ||
    kind === 'file'
      ? kind
      : 'document'
  ) as FileTypeIconKind;

  const svgClassName = 'block shrink-0 text-[#737373]';
  const stroke = 'currentColor';
  const strokeW = '1.5';
  const commonPath = 'M7 21C5.89543 21 5 20.1046 5 19V3H14L19 8V19C19 20.1046 18.1046 21 17 21H7Z';
  const foldPath = 'M13 3V9H19';

  if (k === 'image') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClassName}
        aria-hidden
      >
        <path
          d={commonPath}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 20L12 14L18 20"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13 3V9H19" stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
      </svg>
    );
  }
  if (k === 'video') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClassName}
        aria-hidden
      >
        <path
          d={commonPath}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d={foldPath} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
        <path
          d="M14 14.5L11 16.2321L11 12.7679L14 14.5Z"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />
        <rect x="11" y="14" width="2" height="1" fill={stroke} />
      </svg>
    );
  }
  if (k === 'audio') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClassName}
        aria-hidden
      >
        <path
          d={commonPath}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d={foldPath} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
        <circle cx="11" cy="17" r="1" stroke={stroke} strokeWidth={strokeW} />
        <path
          d="M12 12V17"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 14L12 12"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (k === 'document') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClassName}
        aria-hidden
      >
        <path
          d={commonPath}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d={foldPath} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
        <path
          d="M9 13H15"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 17H15"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // file (generic)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClassName}
      aria-hidden
    >
      <path
        d="M19 6L20.1523 5.03972C19.8673 4.69773 19.4452 4.5 19 4.5V6ZM24 12L22.8477 12.9603C23.1327 13.3023 23.5548 13.5 24 13.5V12ZM6.5 16C6.5 15.1716 5.82843 14.5 5 14.5C4.17157 14.5 3.5 15.1716 3.5 16H5H6.5ZM3.5 28C3.5 28.8284 4.17157 29.5 5 29.5C5.82843 29.5 6.5 28.8284 6.5 28H5H3.5ZM44.5 16C44.5 15.1716 43.8284 14.5 43 14.5C42.1716 14.5 41.5 15.1716 41.5 16H43H44.5ZM41.5 28C41.5 28.8284 42.1716 29.5 43 29.5C43.8284 29.5 44.5 28.8284 44.5 28H43H41.5ZM5 8H6.5C6.5 7.72386 6.72386 7.5 7 7.5V6V4.5C5.067 4.5 3.5 6.067 3.5 8H5ZM7 6V7.5H19V6V4.5H7V6ZM19 6L17.8477 6.96028L22.8477 12.9603L24 12L25.1523 11.0397L20.1523 5.03972L19 6ZM24 12V13.5H41V12V10.5H24V12ZM41 12V13.5C41.2762 13.5 41.5 13.7238 41.5 14H43H44.5C44.5 12.067 42.933 10.5 41 10.5V12ZM43 14H41.5V40H43H44.5V14H43ZM43 40H41.5C41.5 40.2762 41.2762 40.5 41 40.5V42V43.5C42.933 43.5 44.5 41.933 44.5 40H43ZM41 42V40.5H7V42V43.5H41V42ZM7 42V40.5C6.72384 40.5 6.5 40.2762 6.5 40H5H3.5C3.5 41.933 5.06702 43.5 7 43.5V42ZM5 40H6.5V8H5H3.5V40H5ZM43 22V20.5H5V22V23.5H43V22ZM5 16H3.5V28H5H6.5V16H5ZM43 16H41.5V28H43H44.5V16H43Z"
        fill={stroke}
      />
    </svg>
  );
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

  // Reset error when file or previewUrl changes (asynchronously to avoid cascading render)
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
      className={cn(
        'box-border flex min-h-9.5 min-w-0 items-center gap-2 rounded-[6px] bg-[#EBEBEB] px-2.5 py-1.5',
        uniformWidth ? 'w-full max-w-full' : 'w-fit max-w-60'
      )}
    >
      {/* Left: square container — format-specific icon or image preview */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-[#D3D3D3]">
        {showImageThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL for user-uploaded preview
          <img
            src={previewUrl}
            alt=""
            className="block h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <FileTypeIcon kind={getFileTypeIcon(extension)} size={16} />
        )}
      </div>

      {/* Middle: file name (base + extension) + size */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <div className="flex min-w-0 items-baseline gap-0.5">
          <span
            className={cn(
              'min-w-0 overflow-hidden font-sans text-xs leading-4 font-semibold tracking-[0.12px] text-ellipsis whitespace-nowrap text-[#333333]',
              hasExtension && 'flex-1'
            )}
          >
            {baseName}
          </span>
          {hasExtension && (
            <span className="shrink-0 font-sans text-xs leading-4 font-semibold tracking-[0.12px] text-[#888888]">
              {extension}
            </span>
          )}
        </div>
        <span className="font-sans text-[10px] leading-3.5 font-normal tracking-[0.1px] text-[#888888]">
          {formatFileSize(file.size)}
        </span>
      </div>

      {/* Right: X icon only, no background, dark grey */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove file"
        className="workspace-action-btn flex h-4.5 w-4.5 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
      >
        <Image src="/icons/search-clear.svg" alt="" width={11} height={11} aria-hidden />
      </button>
    </div>
  );
}
