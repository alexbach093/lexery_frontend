'use client';

import { Suspense, useState, type CSSProperties } from 'react';

import { SearchOverlay } from '@/components/ui/search-overlay';
import { SettingsScreen } from '@/components/ui/settings-screen';
import {
  WORKSPACE_SIDEBAR_COLLAPSED_WIDTH,
  WORKSPACE_SIDEBAR_EXPANDED_WIDTH,
  WORKSPACE_SIDEBAR_TRANSITION,
  WorkspaceSidebar,
} from '@/components/ui/workspace-sidebar';
import { SearchOpenContext } from '@/contexts/search-open';
import { SettingsOpenContext } from '@/contexts/settings-open';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchOverlaySessionKey, setSearchOverlaySessionKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const openSearch = () => {
    if (searchOpen) return;
    setSearchOverlaySessionKey((prev) => prev + 1);
    setSearchOpen(true);
  };
  const closeSearch = () => setSearchOpen(false);
  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }

    setSearchOverlaySessionKey((prev) => prev + 1);
    setSearchOpen(true);
  };
  const settingsContextValue = {
    isOpen: settingsOpen,
    open: () => setSettingsOpen(true),
    close: () => setSettingsOpen(false),
  };
  const searchContextValue = {
    isOpen: searchOpen,
    open: openSearch,
    close: closeSearch,
    toggle: toggleSearch,
  };
  const sidebarWidth = sidebarCollapsed
    ? WORKSPACE_SIDEBAR_COLLAPSED_WIDTH
    : WORKSPACE_SIDEBAR_EXPANDED_WIDTH;
  const mainAreaStyle: CSSProperties & { '--app-sidebar-width': string } = {
    '--app-sidebar-width': `${sidebarWidth}px`,
    marginLeft: `${sidebarWidth}px`,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    overflow: 'visible',
    transition: `margin-left ${WORKSPACE_SIDEBAR_TRANSITION}`,
  };

  return (
    <SettingsOpenContext.Provider value={settingsContextValue}>
      <SearchOpenContext.Provider value={searchContextValue}>
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
            <Suspense fallback={null}>
              <WorkspaceSidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              />
            </Suspense>
          </div>
          <div style={mainAreaStyle}>
            <Suspense fallback={null}>{children}</Suspense>
            <SearchOverlay key={searchOverlaySessionKey} />
          </div>
        </div>
      </SearchOpenContext.Provider>
      {settingsOpen && <SettingsScreen onClose={settingsContextValue.close} />}
    </SettingsOpenContext.Provider>
  );
}
