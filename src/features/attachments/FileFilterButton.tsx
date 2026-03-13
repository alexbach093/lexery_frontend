'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { FileFormatFilterChips } from './FileFormatFilterChips';

const FILTER_POPOVER_DURATION_MS = 200;

export function FileFilterButton({
  formatOptions,
  selectedFormats,
  onChange,
  inPill,
}: {
  formatOptions: { id: string; label: string }[];
  selectedFormats: Set<string>;
  onChange: (set: Set<string>) => void;
  inPill?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle click outside to close the popover
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setClosing(true);
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = setTimeout(() => {
          setClosing(false);
          setVisible(false);
          closeTimeoutRef.current = null;
        }, FILTER_POPOVER_DURATION_MS);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [open, closing]);

  // Handle visibility states for smooth transitions
  useEffect(() => {
    if (open && !closing) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    if (!open) {
      const id = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(id);
    }
  }, [open, closing]);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      setClosing(true);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => {
        setClosing(false);
        setVisible(false);
        closeTimeoutRef.current = null;
      }, FILTER_POPOVER_DURATION_MS);
    } else {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setClosing(false);
      setOpen(true);
    }
  };

  const popoverShown = open || closing;
  const popoverVisible = open && visible && !closing;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        className={cn(
          'workspace-files-panel-field workspace-icon-btn box-border flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-md border-none p-0',
          inPill ? 'bg-transparent' : 'bg-[#F0F0F0]'
        )}
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          selectedFormats.size > 0
            ? `Фільтр (${selectedFormats.size})`
            : 'Відкрити фільтр за форматом файлу'
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 17.5 13.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          className="block"
        >
          <path
            d="M0.75 0.75H16.75M3.75 6.75H13.75M7.75 12.75H9.75"
            stroke="#575757"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {popoverShown && (
        <div
          role="dialog"
          aria-label="Фільтр за форматом файлу"
          className={cn(
            'absolute right-0 bottom-full z-50 mb-1.5 w-fit rounded-xl border border-[#E8E8E8] bg-white p-3 transition-all duration-200 ease-in-out',
            popoverVisible
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-1.5 opacity-0'
          )}
        >
          <FileFormatFilterChips
            options={formatOptions}
            selectedFormats={selectedFormats}
            onChange={onChange}
            compact
          />
        </div>
      )}
    </div>
  );
}
