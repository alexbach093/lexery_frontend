'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AppLayout } from '@/components/layout';
import { BootScreen } from '@/components/ui/boot-screen';
import { WorkspaceMain } from '@/components/ui/workspace-main';
import { cn } from '@/lib/utils';

/** sessionStorage key: boot has already been completed in this session. */
const BOOT_DONE_KEY = 'lexery-boot-done';

/** Boot overlay fade-out duration (ms). */
const BOOT_FADE_MS = 500;
/** Minimum boot display time (ms) until onReady is triggered. */
const MIN_BOOT_MS = 50;

/**
 * Main page: boot is shown until the main space is ready,
 * but not less than MIN_BOOT_MS. After that — smooth transition to the workspace.
 * When returning from other pages (e.g., settings), boot is not shown.
 */
export default function HomePage() {
  const [showBoot, setShowBoot] = useState(true);
  const [bootFading, setBootFading] = useState(false);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootStartRef = useRef<number>(0);
  const completedRef = useRef(false);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(BOOT_DONE_KEY) === '1') {
      completedRef.current = true;
      queueMicrotask(() => {
        setShowBoot(false);
        setBootFading(false);
        setWorkspaceVisible(true);
      });
    }
  }, []);

  useEffect(() => {
    bootStartRef.current = Date.now();
  }, []);

  const handleBootComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (typeof window !== 'undefined') sessionStorage.setItem(BOOT_DONE_KEY, '1');
    setBootFading(true);
    fadeTimeoutRef.current = setTimeout(() => {
      setShowBoot(false);
      setBootFading(false);
      setWorkspaceVisible(true);
      fadeTimeoutRef.current = null;
    }, BOOT_FADE_MS);
  };

  const handleWorkspaceReady = () => {
    const started = bootStartRef.current || Date.now();
    const elapsed = Date.now() - started;
    const remaining = Math.max(0, MIN_BOOT_MS - elapsed);
    if (remaining === 0) {
      handleBootComplete();
    } else {
      fadeTimeoutRef.current = setTimeout(handleBootComplete, remaining);
    }
  };

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  const bootOverlayVisible = showBoot || bootFading;

  return (
    <AppLayout bootOverlayVisible={bootOverlayVisible}>
      {/* Workspace: always in DOM, smooth appearance via opacity */}
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col transition-opacity duration-[600ms] ease-out',
          workspaceVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!workspaceVisible}
      >
        <WorkspaceMain onReady={handleWorkspaceReady} />
      </div>

      {/* Boot overlay: disappears after workspace is ready (with a minimum of MIN_BOOT_MS) */}
      {showBoot && (
        <div
          className={cn(
            'fixed inset-0 z-[9999] transition-opacity duration-500 ease-out',
            bootFading ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
          )}
          aria-hidden={bootFading}
        >
          <BootScreen duration={60000} onComplete={() => {}} />
        </div>
      )}
    </AppLayout>
  );
}
