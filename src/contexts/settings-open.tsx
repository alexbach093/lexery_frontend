'use client';

import { createContext, useContext } from 'react';

import type { SectionId } from '@/types';

export type SettingsOpenContextValue = {
  open: (section?: SectionId, options?: { replace?: boolean }) => void;
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
