'use client';

import { useState } from 'react';

import { SettingsScreen } from '@/components/ui/settings-screen';
import {
  WORKSPACE_SIDEBAR_COLLAPSED_WIDTH,
  WORKSPACE_SIDEBAR_EXPANDED_WIDTH,
  WORKSPACE_SIDEBAR_TRANSITION,
  WorkspaceSidebar,
} from '@/components/ui/workspace-sidebar';
import { SettingsOpenContext } from '@/contexts/settings-open';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  /** When true, sidebar and main are hidden under boot overlay; when false, they fade in. */
  bootOverlayVisible?: boolean;
}

/**
 * Shared app layout: sidebar + main content area.
 * Boot is a part of the main page (/), not a separate route.
 * Settings is an overlay on top of the main screen, without navigating to a separate page.
 */
export function AppLayout({ children, bootOverlayVisible = false }: AppLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const settingsContextValue = {
    isOpen: settingsOpen,
    open: () => setSettingsOpen(true),
    close: () => setSettingsOpen(false),
  };

  const sidebarWidth = sidebarCollapsed
    ? WORKSPACE_SIDEBAR_COLLAPSED_WIDTH
    : WORKSPACE_SIDEBAR_EXPANDED_WIDTH;

  return (
    <SettingsOpenContext.Provider value={settingsContextValue}>
      <div className="h-screen w-screen overflow-hidden bg-white">
        <div
          className={cn(
            'transition-opacity duration-600 ease-out',
            bootOverlayVisible ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
          )}
        >
          <WorkspaceSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          />
        </div>
        <div
          className="relative flex h-screen flex-col overflow-visible bg-white"
          style={{
            marginLeft: `${sidebarWidth}px`,
            transition: `margin-left ${WORKSPACE_SIDEBAR_TRANSITION}`,
          }}
        >
          {children}
        </div>
      </div>
      {settingsOpen && <SettingsScreen onClose={settingsContextValue.close} />}
    </SettingsOpenContext.Provider>
  );
}
