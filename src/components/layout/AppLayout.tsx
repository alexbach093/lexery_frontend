'use client';

import { WorkspaceSidebar } from '@/components/workspace-sidebar';

const SIDEBAR_WIDTH = 260;
const FADE_IN_MS = 500;

interface AppLayoutProps {
  children: React.ReactNode;
  /** When true, sidebar (and optionally UI under boot) is hidden; when false, fades in with workspace. */
  bootOverlayVisible?: boolean;
}

/**
 * Shared app layout: sidebar + main content area.
 * Used by /boot (onboarding) and /workspace (main AI interface).
 * Sidebar and shell live in one place; each route supplies its content via children.
 */
export function AppLayout({ children, bootOverlayVisible = false }: AppLayoutProps) {
  return (
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
          transition: bootOverlayVisible ? 'none' : `opacity ${FADE_IN_MS}ms ease-out`,
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
        }}
      >
        {children}
      </div>
    </div>
  );
}
