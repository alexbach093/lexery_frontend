'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

import { SearchOverlay } from '@/components/ui/SearchOverlay';
import {
  WORKSPACE_SIDEBAR_COLLAPSED_WIDTH,
  WORKSPACE_SIDEBAR_EXPANDED_WIDTH,
  WORKSPACE_SIDEBAR_TRANSITION,
  WorkspaceSidebar,
} from '@/components/ui/WorkspaceSidebar';
import { SearchOpenContext } from '@/contexts/search-open';

const MOBILE_SIDEBAR_BREAKPOINT = 640;
const SEARCH_OVERLAY_HISTORY_STATE = 'search';

function isSearchOverlayHistoryState(state: unknown): boolean {
  if (!state || typeof state !== 'object') {
    return false;
  }

  return (state as { __lexeryOverlay?: string }).__lexeryOverlay === SEARCH_OVERLAY_HISTORY_STATE;
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchOverlaySessionKey, setSearchOverlaySessionKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const searchOpenRef = useRef(searchOpen);

  useEffect(() => {
    searchOpenRef.current = searchOpen;
  }, [searchOpen]);

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

  const closeSearchImmediate = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    if (searchOpenRef.current) {
      return;
    }

    setMobileSidebarOpen(false);
    setSearchOverlaySessionKey((prev) => prev + 1);
    setSearchOpen(true);

    if (typeof window === 'undefined') {
      return;
    }

    const currentState =
      window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
    window.history.pushState(
      {
        ...currentState,
        __lexeryOverlay: SEARCH_OVERLAY_HISTORY_STATE,
      },
      '',
      window.location.href
    );
  }, []);

  const closeSearch = useCallback(() => {
    if (typeof window !== 'undefined' && isSearchOverlayHistoryState(window.history.state)) {
      window.history.back();
      return;
    }

    setSearchOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    if (searchOpenRef.current) {
      closeSearch();
      return;
    }

    openSearch();
  }, [closeSearch, openSearch]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const nextSearchOpen = isSearchOverlayHistoryState(event.state);
      setSearchOpen(nextSearchOpen);

      if (nextSearchOpen) {
        setMobileSidebarOpen(false);
        setSearchOverlaySessionKey((prev) => prev + 1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const searchContextValue = {
    isOpen: searchOpen,
    open: openSearch,
    close: closeSearch,
    closeImmediate: closeSearchImmediate,
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
    <SearchOpenContext.Provider value={searchContextValue}>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
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

        {isCompactViewport && mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Закрити sidebar"
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 70,
              border: 'none',
              background: 'rgba(23, 23, 23, 0.24)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              cursor: 'pointer',
            }}
          />
        )}

        <div style={mainAreaStyle}>
          <Suspense fallback={null}>{children}</Suspense>
          <SearchOverlay key={searchOverlaySessionKey} />
        </div>
      </div>
    </SearchOpenContext.Provider>
  );
}
