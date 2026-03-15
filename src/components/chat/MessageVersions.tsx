'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { HistoryIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { MessageVersion } from '@/types/chat';

const DROPDOWN_WIDTH = 200;
const SAFE_MARGIN = 12;

/** Viewport-aware dropdown position so it does not overflow right edge on narrow screens. */
function calculateDropdownPosition(
  anchorRect: DOMRect,
  dropdownWidth: number,
  safeMargin: number = SAFE_MARGIN
): { top: number; left: number } {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  let left = anchorRect.left;
  const wouldOverflow = left + dropdownWidth + safeMargin > viewportWidth;
  if (wouldOverflow) {
    left = Math.max(safeMargin, viewportWidth - dropdownWidth - safeMargin);
  }
  left = Math.max(safeMargin, left);
  return {
    top: anchorRect.bottom + 4,
    left,
  };
}

/** Label for version dropdown: Original / Added details / Shorter / Regenerated / "clarification". */
function getVersionLabel(v: MessageVersion, index: number): string {
  if (index === 0) return 'Оригінал';
  const mod = v.modifier?.trim() ?? '';
  if (!mod) return 'Повторно згенеровано';
  if (mod === 'Додай більше деталей') return 'Додано деталі';
  if (mod === 'Зроби відповідь коротшою') return 'Коротше';
  return `"${mod}"`;
}

export interface MessageVersionsProps {
  versions: MessageVersion[];
  activeVersionIndex: number;
  onVersionChange: (index: number) => void;
}

export function MessageVersions({
  versions,
  activeVersionIndex,
  onVersionChange,
}: MessageVersionsProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setDropdownPos(calculateDropdownPosition(rect, DROPDOWN_WIDTH, SAFE_MARGIN));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Reposition dropdown on resize/scroll so it stays in viewport and does not "jump"
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    let rafId: number | undefined;
    const handleReposition = () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        setDropdownPos(calculateDropdownPosition(rect, DROPDOWN_WIDTH, SAFE_MARGIN));
      });
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [open]);

  if (versions.length <= 1) return null;

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className={cn(
          'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-black',
          'transition-all duration-150 hover:bg-transparent hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset active:scale-[0.92] active:bg-transparent'
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Історія версій, ${versions.length} версій`}
      >
        <HistoryIcon width={15} height={15} className="block shrink-0" aria-hidden="true" />
      </button>
      {open &&
        dropdownPos &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            aria-label="Версії відповіді"
            className="fixed z-1000 max-h-70 w-50 overflow-y-auto rounded-[10px] border border-[#E0E0E0] bg-white p-1.5 shadow-none"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
            }}
          >
            {versions.map((v, i) => (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={i === activeVersionIndex}
                onClick={() => {
                  onVersionChange(i);
                  setOpen(false);
                }}
                className={cn(
                  'block w-full min-w-0 cursor-pointer rounded-md border-none px-2.5 py-2 text-left text-sm text-[#2A2A2A] transition-colors duration-150 hover:bg-[#f7f7f7]',
                  i === activeVersionIndex ? 'bg-[#F0F0F0]' : 'bg-transparent'
                )}
              >
                <span
                  className={cn(
                    'block min-w-0 truncate',
                    i === activeVersionIndex ? 'font-semibold' : 'font-normal'
                  )}
                  title={getVersionLabel(v, i)}
                >
                  {getVersionLabel(v, i)}
                </span>
                {v.createdAt && (
                  <span className="mt-0.5 block text-xs text-[#575757]">
                    {new Date(v.createdAt).toLocaleString('uk-UA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
