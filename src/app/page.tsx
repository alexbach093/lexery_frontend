'use client';

import { useEffect, useRef, useState } from 'react';

import { BootScreen } from '@/components/boot-screen';
import { AppLayout } from '@/components/layout';
import { WorkspaceMain } from '@/components/workspace-main';

/** Fade-out duration (ms). */
const FADE_OUT_MS = 500;

/**
 * Root page: boot runs on top while workspace loads; when ready, boot fades out.
 * No minimum boot time — if site loads at once, boot finishes at once.
 */
export default function HomePage() {
  const [showBoot, setShowBoot] = useState(true);
  const [bootFading, setBootFading] = useState(false);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeStartedRef = useRef(false);

  useEffect(() => {
    if (!fadeStartedRef.current && workspaceReady) {
      fadeStartedRef.current = true;
      const startFade = () => {
        setBootFading(true);
        fadeTimeoutRef.current = setTimeout(() => {
          setShowBoot(false);
          setBootFading(false);
          fadeTimeoutRef.current = null;
        }, FADE_OUT_MS);
      };
      const id = requestAnimationFrame(() => startFade());
      return () => {
        cancelAnimationFrame(id);
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      };
    }
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [workspaceReady]);

  const showBootOverlay = showBoot || bootFading;

  return (
    <AppLayout bootOverlayVisible={showBootOverlay}>
      {/* Workspace: same fade-in as sidebar when boot overlay is gone */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          opacity: showBootOverlay ? 0 : 1,
          pointerEvents: showBootOverlay ? 'none' : 'auto',
          transition: showBootOverlay ? 'none' : `opacity ${FADE_OUT_MS}ms ease-out`,
        }}
        aria-hidden={showBootOverlay}
      >
        <WorkspaceMain onReady={() => setWorkspaceReady(true)} />
      </div>

      {/* Boot overlay: fades out, then unmounts after FADE_OUT_MS */}
      {showBootOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: bootFading ? 'none' : 'auto',
            transition: `opacity ${FADE_OUT_MS}ms ease-out`,
            opacity: bootFading ? 0 : 1,
          }}
          aria-hidden={bootFading}
        >
          <BootScreen duration={3000} onComplete={() => setShowBoot(false)} />
        </div>
      )}
    </AppLayout>
  );
}
