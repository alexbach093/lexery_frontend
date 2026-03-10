'use client';

import { FilePreview } from '@/components/ui/file-preview';

import { FileFilterButton } from './FileFilterButton';
import type { AttachedFile } from './types';

const EXPANDED_ATTACHMENTS_MAX_HEIGHT = '210px';

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
  const panelStyle =
    variant === 'chat'
      ? {
          backgroundColor: '#F5F6F6',
          borderRadius: '16px',
          padding: '12px 13px 16px',
          marginBottom: '10px',
        }
      : {
          backgroundColor: '#F5F6F6',
          borderRadius: '16px',
          padding: '12px 16px 16px',
          marginBottom: '10px',
        };

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            width: '200px',
            maxWidth: '100%',
          }}
        >
          <input
            type="search"
            className="workspace-files-panel-field workspace-search-input"
            placeholder="Пошук за назвою..."
            value={fileSearchQuery}
            onChange={(e) => onFileSearchQueryChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              paddingRight: fileSearchQuery.trim() ? '28px' : '10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#F0F0F0',
              fontSize: '13px',
              color: '#2A2A2A',
              boxSizing: 'border-box',
            }}
            aria-label="Пошук файлів"
          />
          {fileSearchQuery.trim() && (
            <button
              type="button"
              onClick={() => onFileSearchQueryChange('')}
              aria-label="Очистити пошук"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                borderRadius: '4px',
              }}
              className="workspace-action-btn hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
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
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={onRemoveAll}
            className="workspace-files-panel-field workspace-action-btn workspace-remove-all-btn workspace-icon-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
            aria-label="Видалити всі файли"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 18 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M2.82051 4.87179V17.1795C2.82051 18.3124 3.7389 19.2308 4.8718 19.2308H13.0769C14.2098 19.2308 15.1282 18.3124 15.1282 17.1795V4.87179"
                stroke="#575757"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0.769231 4.87179H17.1795"
                stroke="#575757"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.84615 4.87179L5.89744 0.769231H12.0513L14.1026 4.87179"
                stroke="#575757"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
        className="scrollbar-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          overflowY: 'auto',
          maxHeight: EXPANDED_ATTACHMENTS_MAX_HEIGHT,
        }}
      >
        {filteredAttachedFiles.map(({ item, originalIndex }) => (
          <div key={`${item.file.name}-${item.file.size}-${originalIndex}`} style={{ minWidth: 0 }}>
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
      className="scrollbar-hidden"
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '12px',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {attachedFiles.map((item, index) => (
        <div key={`${item.file.name}-${item.file.size}-${index}`} style={{ flexShrink: 0 }}>
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
