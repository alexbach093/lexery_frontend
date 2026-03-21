'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface BootContextType {
  isBootComplete: boolean;
  setIsBootComplete: (val: boolean) => void;
}

const BootContext = createContext<BootContextType | undefined>(undefined);

export function BootProvider({ children }: { children: ReactNode }) {
  const [isBootComplete, setIsBootComplete] = useState(false);

  return (
    <BootContext.Provider value={{ isBootComplete, setIsBootComplete }}>
      {children}
    </BootContext.Provider>
  );
}

export function useBoot() {
  const context = useContext(BootContext);
  if (!context) {
    throw new Error('useBoot must be used within a BootProvider');
  }
  return context;
}
