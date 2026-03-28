'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { SearchOverlay } from '@/components/ui/SearchOverlay';
import {
  WORKSPACE_SIDEBAR_COLLAPSED_WIDTH,
  WORKSPACE_SIDEBAR_EXPANDED_WIDTH,
  WORKSPACE_SIDEBAR_TRANSITION,
  WorkspaceSidebar,
} from '@/components/ui/WorkspaceSidebar';
import { SearchOpenContext } from '@/contexts/search-open';
import { SettingsOpenContext } from '@/contexts/settings-open';
import { getSettingsPath, getWorkspaceHomePath } from '@/lib/app-routes';
import type { SectionId } from '@/types';

const MOBILE_SIDEBAR_BREAKPOINT = 640;
const SEARCH_OVERLAY_HISTORY_STATE = 'search';
const WORKSPACE_HOME_PATH = getWorkspaceHomePath();

function isSearchOverlayHistoryState(state: unknown): boolean {
  if (!state || typeof state !== 'object') {
    return false;
  }

  return (state as { __lexeryOverlay?: string }).__lexeryOverlay === SEARCH_OVERLAY_HISTORY_STATE;
}

function isWorkspacePathname(pathname?: string | null): boolean {
  return (
    pathname === WORKSPACE_HOME_PATH || pathname?.startsWith(`${WORKSPACE_HOME_PATH}/`) === true
  );
}

function WorkspaceLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchOverlaySessionKey, setSearchOverlaySessionKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const searchOpenRef = useRef(searchOpen);
  const lastWorkspaceHrefRef = useRef(WORKSPACE_HOME_PATH);

  useEffect(() => {
    searchOpenRef.current = searchOpen;
  }, [searchOpen]);

  useEffect(() => {
    if (!isWorkspacePathname(pathname)) {
      return;
    }

    const currentSearch = searchParams.toString();
    lastWorkspaceHrefRef.current = `${pathname}${currentSearch ? `?${currentSearch}` : ''}`;
  }, [pathname, searchParams]);

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

  const openSettings = useCallback(
    (section: SectionId = 'general', options?: { replace?: boolean }) => {
      if (isWorkspacePathname(pathname)) {
        const currentSearch = searchParams.toString();
        lastWorkspaceHrefRef.current = `${pathname}${currentSearch ? `?${currentSearch}` : ''}`;
      }

      const nextPath = getSettingsPath(section);
      if (options?.replace) {
        router.replace(nextPath);
        return;
      }

      router.push(nextPath);
    },
    [pathname, router, searchParams]
  );

  const closeSettings = useCallback(() => {
    router.replace(lastWorkspaceHrefRef.current);
  }, [router]);

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

  const settingsContextValue = {
    open: openSettings,
    close: closeSettings,
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
      <SettingsOpenContext.Provider value={settingsContextValue}>
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
      </SettingsOpenContext.Provider>
    </SearchOpenContext.Provider>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <WorkspaceLayoutContent>{children}</WorkspaceLayoutContent>
    </Suspense>
  );
}
