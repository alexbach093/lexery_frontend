'use client';

import { useCallback, useEffect, useState } from 'react';

import { SettingsActionButton } from './SettingsPage';

const STORAGE_KEY = 'lexery-account-display-name';

type SettingsEditableRowProps = {
  label: string;
  defaultValue: string;
  storageKey?: string;
};

export function SettingsEditableRow({
  label,
  defaultValue,
  storageKey = STORAGE_KEY,
}: SettingsEditableRowProps) {
  const [value, setValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);

  const loadStored = useCallback(() => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(storageKey);
    return stored ?? defaultValue;
  }, [defaultValue, storageKey]);

  useEffect(() => {
    setValue(loadStored());
  }, [loadStored]);

  const startEdit = () => {
    setInputValue(value);
    setEditing(true);
  };

  const save = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      setValue(trimmed);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, trimmed);
      }
    }
    setEditing(false);
  };

  const cancel = () => {
    setInputValue(value);
    setEditing(false);
  };

  return (
    <div className="border-subtlest flex flex-col gap-1 border-b py-3 first:pt-0 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-foreground text-sm font-medium">{label}</span>
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="text-quiet hover:text-foreground cursor-pointer text-xs"
          >
            Редагувати
          </button>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-2">
        {editing ? (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') cancel();
              }}
              className="border-subtlest bg-base text-foreground min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 md:max-w-[240px]"
              autoFocus
              aria-label={label}
            />
            <SettingsActionButton type="button" onClick={save}>
              Зберегти
            </SettingsActionButton>
            <button
              type="button"
              onClick={cancel}
              className="text-quiet hover:text-foreground cursor-pointer text-sm font-medium"
            >
              Скасувати
            </button>
          </>
        ) : (
          <span className="text-quiet text-sm">{value}</span>
        )}
      </div>
    </div>
  );
}
