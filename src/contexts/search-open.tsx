'use client';

import { createContext, useContext } from 'react';

export type SearchOpenContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  closeImmediate: () => void;
  toggle: () => void;
};

const SearchOpenContext = createContext<SearchOpenContextValue | null>(null);

export { SearchOpenContext };

export function useSearchOpen(): SearchOpenContextValue {
  const ctx = useContext(SearchOpenContext);
  if (!ctx) throw new Error('useSearchOpen must be used within SearchOpenProvider');
  return ctx;
}

export function useSearchOpenOptional(): SearchOpenContextValue | null {
  return useContext(SearchOpenContext);
}
