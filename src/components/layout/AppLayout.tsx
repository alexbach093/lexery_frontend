'use client';

import { useState } from 'react';

import { SettingsScreen } from '@/components/ui/settings-screen';
import { WorkspaceSidebar } from '@/components/ui/workspace-sidebar';
import { SettingsOpenContext } from '@/contexts/settings-open';

const SIDEBAR_WIDTH = 288; // 18rem, Claude-style
const SIDEBAR_FADE_MS = 600;

interface AppLayoutProps {
  children: React.ReactNode;
  /** When true, sidebar and main are hidden under boot overlay; when false, they fade in. */
  bootOverlayVisible?: boolean;
}

/**
 * Shared app layout: sidebar + main content area.
 * Boot — частина головної сторінки (/), не окремий маршрут.
 * Налаштування — оверлей поверх основного екрану, без переходу на окрему сторінку.
 */
export function AppLayout({ children, bootOverlayVisible = false }: AppLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsContextValue = {
    isOpen: settingsOpen,
    open: () => setSettingsOpen(true),
    close: () => setSettingsOpen(false),
  };

  return (
    <SettingsOpenContext.Provider value={settingsContextValue}>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          style={{
            opacity: bootOverlayVisible ? 0 : 1,
            pointerEvents: bootOverlayVisible ? 'none' : 'auto',
            transition: `opacity ${SIDEBAR_FADE_MS}ms ease-out`,
          }}
        >
          <WorkspaceSidebar />
        </div>
        <div
          style={{
            marginLeft: `${SIDEBAR_WIDTH}px`,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: '#FFFFFF',
            overflow: 'visible',
          }}
        >
          {children}
        </div>
      </div>
      {settingsOpen && <SettingsScreen onClose={settingsContextValue.close} />}
    </SettingsOpenContext.Provider>
  );
}
