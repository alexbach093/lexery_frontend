'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { MessageVersion } from '@/types/chat';

const HISTORY_ICON_SRC = '/images/chat/history.svg';

/** Label for version dropdown: Оригінал / Додано деталі / Коротше / Повторно згенеровано / "уточнення". */
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
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
    });
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

  if (versions.length <= 1) return null;

  return (
    <div ref={anchorRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          padding: 0,
          border: 'none',
          borderRadius: 9999,
          background: 'transparent',
          color: '#000000',
          cursor: 'pointer',
        }}
        className="chat-action-btn chat-action-btn--circle chat-action-btn--no-highlight hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Історія версій, ${versions.length} версій`}
      >
        <Image
          src={HISTORY_ICON_SRC}
          alt=""
          width={15}
          height={15}
          aria-hidden
          style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }}
        />
      </button>
      {open &&
        dropdownPos &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            aria-label="Версії відповіді"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: '200px',
              padding: '6px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0E0E0',
              boxShadow: 'none',
              zIndex: 1000,
              maxHeight: '280px',
              overflowY: 'auto',
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
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: i === activeVersionIndex ? '#F0F0F0' : 'transparent',
                  color: '#2A2A2A',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  minWidth: 0,
                }}
                className="chat-regenerate-option-btn"
              >
                <span
                  style={{
                    fontWeight: i === activeVersionIndex ? 600 : 400,
                    display: 'block',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={getVersionLabel(v, i)}
                >
                  {getVersionLabel(v, i)}
                </span>
                {v.createdAt && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#575757',
                      marginTop: '2px',
                    }}
                  >
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
