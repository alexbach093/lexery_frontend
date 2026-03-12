'use client';

import { useEffect, useRef, useState } from 'react';

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
    <div ref={containerRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        className="workspace-files-panel-field workspace-icon-btn"
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          selectedFormats.size > 0
            ? `Фільтр (${selectedFormats.size})`
            : 'Відкрити фільтр за форматом файлу'
        }
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
          padding: 0,
          borderRadius: '6px',
          border: 'none',
          backgroundColor: inPill ? 'transparent' : '#F0F0F0',
          cursor: 'pointer',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 17.5 13.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          style={{ display: 'block' }}
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
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            left: 'auto',
            marginBottom: '6px',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#fff',
            border: '1px solid #E8E8E8',
            zIndex: 50,
            opacity: popoverVisible ? 1 : 0,
            transform: popoverVisible ? 'translateY(0)' : 'translateY(6px)',
            transition: `opacity ${FILTER_POPOVER_DURATION_MS}ms ease, transform ${FILTER_POPOVER_DURATION_MS}ms ease`,
            pointerEvents: popoverVisible ? 'auto' : 'none',
            width: 'fit-content',
          }}
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
