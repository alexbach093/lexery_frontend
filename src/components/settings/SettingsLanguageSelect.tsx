'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SettingsActionButton } from './SettingsPage';

type LanguageOption = {
  id: string;
  label: string;
};

type SettingsLanguageSelectProps = {
  options: LanguageOption[];
  defaultValue: string;
  storageKey: string;
};

export function SettingsLanguageSelect({
  options,
  defaultValue,
  storageKey,
}: SettingsLanguageSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const loadStored = useCallback(() => {
    if (typeof window === 'undefined') return defaultValue;
    return localStorage.getItem(storageKey) ?? defaultValue;
  }, [defaultValue, storageKey]);

  useEffect(() => {
    setValue(loadStored());
  }, [loadStored]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSelect = (nextValue: string) => {
    setValue(nextValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, nextValue);
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <SettingsActionButton
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="min-w-[124px] justify-between gap-2"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          aria-hidden="true"
          className={[
            'text-quiet h-4 w-4 shrink-0 transition-transform duration-200',
            open ? 'rotate-180' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </SettingsActionButton>

      {open ? (
        <div
          role="listbox"
          aria-label="Вибір мови"
          className="border-subtlest bg-base absolute top-full right-0 z-20 mt-2 max-h-64 min-w-[220px] overflow-auto rounded-xl border p-1.5 shadow-xl"
        >
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = value === option.label;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.label)}
                  className={[
                    'text-foreground flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isSelected ? 'bg-quiet' : 'hover:bg-subtle',
                  ].join(' ')}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? <Check aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
