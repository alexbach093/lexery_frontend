'use client';

import { CloseIcon, TrashIcon } from '@/components/icons';
import { FilePreview } from '@/components/ui/file-preview';
import { cn } from '@/lib/utils';

import { FileFilterButton } from './FileFilterButton';
import type { AttachedFile } from './types';

export interface AttachmentsPanelProps {
  attachedFiles: AttachedFile[];
  onRemove: (index: number) => void;
  onRemoveAll: () => void;
  selectedFormats: Set<string>;
  onSelectedFormatsChange: (set: Set<string>) => void;
  fileSearchQuery: string;
  onFileSearchQueryChange: (q: string) => void;
  filesExpanded: boolean;
  availableFormatOptions: { id: string; label: string }[];
  filteredAttachedFiles: { item: AttachedFile; originalIndex: number }[];
  fileListRef: React.RefObject<HTMLDivElement | null>;
  fileListScrollRef: React.RefObject<HTMLDivElement | null>;
}

/** Expanded file panel: search, filter, grid. */
export function AttachmentsPanelExpanded({
  fileSearchQuery,
  onFileSearchQueryChange,
  onRemoveAll,
  selectedFormats,
  onSelectedFormatsChange,
  availableFormatOptions,
  filteredAttachedFiles,
  onRemove,
  fileListScrollRef,
  variant,
}: Omit<AttachmentsPanelProps, 'fileListRef' | 'filesExpanded' | 'attachedFiles'> & {
  onRemove: (originalIndex: number) => void;
  variant?: 'home' | 'chat';
}) {
  return (
    <div
      className={cn(
        'mb-2.5 rounded-2xl bg-[#F5F6F6] pt-3 pb-4',
        variant === 'chat' ? 'px-3.25' : 'px-4'
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="relative inline-flex w-50 max-w-full items-center">
          <input
            type="search"
            className={cn(
              'workspace-files-panel-field workspace-search-input box-border w-full rounded-md border-none bg-[#F0F0F0] py-1.5 pl-2.5 text-[13px] text-[#2A2A2A] outline-none',
              fileSearchQuery.trim() ? 'pr-7' : 'pr-2.5'
            )}
            placeholder="Пошук за назвою..."
            value={fileSearchQuery}
            onChange={(e) => onFileSearchQueryChange(e.target.value)}
            aria-label="Пошук файлів"
          />
          {fileSearchQuery.trim() && (
            <button
              type="button"
              onClick={() => onFileSearchQueryChange('')}
              aria-label="Очистити пошук"
              className="workspace-action-btn absolute top-1/2 right-1.5 flex h-4.5 w-4.5 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            >
              <CloseIcon width={11} height={11} className="text-[#575757]" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRemoveAll}
            className="workspace-files-panel-field workspace-action-btn workspace-remove-all-btn workspace-icon-btn flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0"
            aria-label="Видалити всі файли"
          >
            <TrashIcon width={16} height={16} className="text-[#575757]" aria-hidden="true" />
          </button>
          <FileFilterButton
            formatOptions={availableFormatOptions}
            selectedFormats={selectedFormats}
            onChange={onSelectedFormatsChange}
            inPill
          />
        </div>
      </div>
      <div
        ref={fileListScrollRef}
        className="scrollbar-hidden grid max-h-52.5 grid-cols-3 gap-2 overflow-y-auto"
      >
        {filteredAttachedFiles.map(({ item, originalIndex }) => (
          <div key={`${item.file.name}-${item.file.size}-${originalIndex}`} className="min-w-0">
            <FilePreview
              file={item.file}
              previewUrl={item.previewUrl}
              onRemove={() => onRemove(originalIndex)}
              uniformWidth
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Collapsed inline file row. */
export function AttachmentsPanelCollapsed({
  attachedFiles,
  onRemove,
  fileListRef,
}: {
  attachedFiles: AttachedFile[];
  onRemove: (index: number) => void;
  fileListRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={fileListRef}
      className="scrollbar-hidden mb-3 flex flex-row flex-nowrap items-start gap-2 overflow-x-auto overflow-y-hidden"
    >
      {attachedFiles.map((item, index) => (
        <div key={`${item.file.name}-${item.file.size}-${index}`} className="shrink-0">
          <FilePreview
            file={item.file}
            previewUrl={item.previewUrl}
            onRemove={() => onRemove(index)}
          />
        </div>
      ))}
    </div>
  );
}
