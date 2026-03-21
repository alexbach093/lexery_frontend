'use client';

import { Suspense, useEffect, useState, type CSSProperties } from 'react';

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
const MOBILE_SIDEBAR_BREAKPOINT = 640;

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
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const syncViewportMode = () => {
      const nextIsCompactViewport = window.innerWidth < MOBILE_SIDEBAR_BREAKPOINT;
      setIsCompactViewport(nextIsCompactViewport);

      if (!nextIsCompactViewport) {
        setMobileSidebarOpen(false);
      }
    };

    syncViewportMode();
    window.addEventListener('resize', syncViewportMode);
    return () => window.removeEventListener('resize', syncViewportMode);
  }, []);

  const openSearch = () => {
    if (searchOpen) return;
    setMobileSidebarOpen(false);
    setSearchOverlaySessionKey((prev) => prev + 1);
    setSearchOpen(true);
  };
  const closeSearch = () => setSearchOpen(false);
  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }

    setMobileSidebarOpen(false);
    setSearchOverlaySessionKey((prev) => prev + 1);
    setSearchOpen(true);
  };
  const settingsContextValue = {
    isOpen: settingsOpen,
    open: () => {
      setMobileSidebarOpen(false);
      setSettingsOpen(true);
    },
    close: () => setSettingsOpen(false),
  };
  const searchContextValue = {
    isOpen: searchOpen,
    open: openSearch,
    close: closeSearch,
    toggle: toggleSearch,
  };
  const renderedSidebarCollapsed = isCompactViewport ? !mobileSidebarOpen : sidebarCollapsed;
  const layoutSidebarWidth = isCompactViewport
    ? WORKSPACE_SIDEBAR_COLLAPSED_WIDTH
    : sidebarCollapsed
      ? WORKSPACE_SIDEBAR_COLLAPSED_WIDTH
      : WORKSPACE_SIDEBAR_EXPANDED_WIDTH;
  const mainAreaStyle: CSSProperties & { '--app-sidebar-width': string } = {
    '--app-sidebar-width': `${layoutSidebarWidth}px`,
    marginLeft: `${layoutSidebarWidth}px`,
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
                collapsed={renderedSidebarCollapsed}
                overlayActive={isCompactViewport && mobileSidebarOpen}
                onToggleCollapse={() => {
                  if (isCompactViewport) {
                    setMobileSidebarOpen((prev) => !prev);
                    return;
                  }

                  setSidebarCollapsed((prev) => !prev);
                }}
              />
            </Suspense>
          </div>
          {isCompactViewport && mobileSidebarOpen ? (
            <button
              type="button"
              aria-label="Закрити sidebar"
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 70,
                border: 'none',
                background: 'rgba(15, 23, 42, 0.24)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                cursor: 'pointer',
              }}
            />
          ) : null}
          <div style={mainAreaStyle}>
            <Suspense fallback={null}>{children}</Suspense>
            <SearchOverlay key={searchOverlaySessionKey} />
          </div>
        </div>
      </SearchOpenContext.Provider>
      {settingsOpen ? <SettingsScreen onClose={settingsContextValue.close} /> : null}
    </SettingsOpenContext.Provider>
  );
}
