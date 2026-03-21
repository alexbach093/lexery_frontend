'use client';

import { useState } from 'react';

import { AttachmentIcon, ImagePlaceholderIcon, ChevronDownSmallIcon } from '@/components/icons';
import { formatFileSize } from '@/components/ui/FilePreview';
import { cn } from '@/lib/utils';
import type { MessageAttachment } from '@/types';

/** User file bubble in chat: light block, thumbnail + filename; placed above the text bubble. */
function UserFileBubble({ attachment }: { attachment: MessageAttachment }) {
  const { name, size, previewUrl } = attachment;

  return (
    <div className="box-border flex w-max max-w-45 items-center gap-1.5 rounded-tl-[10px] rounded-tr-[7px] rounded-br-[7px] rounded-bl-[10px] border border-[#E8E8E8] bg-[#F5F5F5] px-1.75 py-1">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-[#E0E0E0]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL from user upload
          <img src={previewUrl} alt="" className="block h-full w-full object-cover" />
        ) : (
          <span className="text-[9px] text-[#888888]">?</span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-px">
        <span className="truncate font-sans text-xs leading-3.5 font-medium text-[#333333]">
          {name}
        </span>
        <span className="font-sans text-[10px] font-normal text-[#888888]">
          {formatFileSize(size)}
        </span>
      </div>
    </div>
  );
}

/** Multiple attachments: "N attachments" row + dropdown list of files (does not shift the page). */
function AttachmentsExpandable({ attachments }: { attachments: MessageAttachment[] }) {
  const [expanded, setExpanded] = useState(false);
  const n = attachments.length;

  return (
    <div className="relative flex flex-col items-end">
      <div
        className={cn(
          'absolute top-full right-0 z-20 mt-1.5 flex flex-col items-end gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.33,0.8,0.5,1)]',
          expanded
            ? 'pointer-events-auto visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-2 opacity-0',
          n > 4 && 'max-h-42.5 overflow-y-auto'
        )}
      >
        {attachments.map((att, i) => (
          <div
            key={`${att.name}-${att.size}-${i}`}
            className="box-border flex w-max max-w-55 items-center gap-2 rounded-[10px] border border-[#E8E8E8] bg-[#F5F5F5] px-2.5 py-1.5"
          >
            {att.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob URL from user upload
              <img
                src={att.previewUrl}
                alt=""
                className="block h-6 w-6 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#E0E0E0]">
                <ImagePlaceholderIcon width={14} height={14} aria-hidden="true" />
              </div>
            )}
            <span className="truncate font-sans text-sm font-medium text-[#333333]">
              {att.name}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="box-border flex cursor-pointer items-center gap-2 rounded-[14px] border border-[#E8E8E8] bg-[#F5F5F5] px-3 py-1.5 font-sans text-sm font-medium text-[#333333] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none"
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse attachments' : 'Expand attachments'}
      >
        <AttachmentIcon width={14} height={14} className="text-[#666666]" aria-hidden="true" />
        <span>
          {n} {n === 1 ? 'attachment' : 'attachments'}
        </span>
        <ChevronDownSmallIcon
          width={12}
          height={12}
          className={cn('transition-transform duration-200', expanded ? 'rotate-180' : 'rotate-0')}
          aria-hidden="true"
        />
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
