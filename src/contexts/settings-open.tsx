'use client';

import { createContext, useContext } from 'react';

export type SettingsOpenContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const SettingsOpenContext = createContext<SettingsOpenContextValue | null>(null);

export { SettingsOpenContext };

export function useSettingsOpen(): SettingsOpenContextValue {
  const ctx = useContext(SettingsOpenContext);
  if (!ctx) throw new Error('useSettingsOpen must be used within SettingsOpenProvider');
  return ctx;
}

export function useSettingsOpenOptional(): SettingsOpenContextValue | null {
  return useContext(SettingsOpenContext);
}
