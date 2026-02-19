'use client';

import { useEffect, useRef, useState } from 'react';

import { BootScreen } from '@/components/boot-screen';
import { AppLayout } from '@/components/layout';
import { WorkspaceMain } from '@/components/workspace-main';

/** Boot overlay fade-out duration (ms). */
const BOOT_FADE_MS = 500;
/** Workspace fade-in duration (ms) — плавна поява після boot. */
const WORKSPACE_FADE_MS = 600;
/** Мінімальний час показу boot (ms) до моменту onReady. */
const MIN_BOOT_MS = 50;

/**
 * Головна сторінка: boot показується до готовності main space,
 * але не менше MIN_BOOT_MS. Після цього — плавний перехід у workspace.
 */
export default function HomePage() {
  const [showBoot, setShowBoot] = useState(true);
  const [bootFading, setBootFading] = useState(false);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootStartRef = useRef<number>(0);
  const completedRef = useRef(false);

  useEffect(() => {
    bootStartRef.current = Date.now();
  }, []);

  const handleBootComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
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
      {/* Workspace: завжди в DOM, плавна поява через opacity */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          opacity: workspaceVisible ? 1 : 0,
          pointerEvents: workspaceVisible ? 'auto' : 'none',
          transition: `opacity ${WORKSPACE_FADE_MS}ms ease-out`,
        }}
        aria-hidden={!workspaceVisible}
      >
        <WorkspaceMain onReady={handleWorkspaceReady} />
      </div>

      {/* Boot overlay: зникає після готовності workspace (з мінімумом MIN_BOOT_MS) */}
      {showBoot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: bootFading ? 'none' : 'auto',
            transition: `opacity ${BOOT_FADE_MS}ms ease-out`,
            opacity: bootFading ? 0 : 1,
          }}
          aria-hidden={bootFading}
        >
          <BootScreen duration={60000} onComplete={() => {}} />
        </div>
      )}
    </AppLayout>
  );
}
