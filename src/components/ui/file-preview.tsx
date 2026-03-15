'use client';

import { useEffect, useState } from 'react';

import {
  FileImageIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileDocumentIcon,
  FileGenericIcon,
  CloseIcon,
} from '@/components/icons';
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

  const commonProps = {
    width: size,
    height: size,
    className: 'block shrink-0 text-[#737373]',
    'aria-hidden': true,
  };

  switch (k) {
    case 'image':
      return <FileImageIcon {...commonProps} />;
    case 'video':
      return <FileVideoIcon {...commonProps} />;
    case 'audio':
      return <FileAudioIcon {...commonProps} />;
    case 'document':
      return <FileDocumentIcon {...commonProps} />;
    default:
      return <FileGenericIcon {...commonProps} />;
  }
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
        <CloseIcon width={11} height={11} className="text-[#575757]" aria-hidden="true" />
      </button>
    </div>
  );
}
