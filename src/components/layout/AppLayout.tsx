'use client';

import { WorkspaceSidebar } from '@/components/workspace-sidebar';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_FADE_MS = 600;

interface AppLayoutProps {
  children: React.ReactNode;
  /** When true, sidebar and main are hidden under boot overlay; when false, they fade in. */
  bootOverlayVisible?: boolean;
}

/**
 * Shared app layout: sidebar + main content area.
 * Boot — частина головної сторінки (/), не окремий маршрут.
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
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
