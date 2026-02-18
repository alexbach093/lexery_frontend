'use client';

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

import bootAnimationData from '@/assets/boot-animation.json';

interface BootScreenProps {
  /**
   * Duration of the boot sequence in milliseconds
   * @default 3000
   */
  duration?: number;
  /**
   * Callback when boot sequence completes
   */
  onComplete?: () => void;
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Boot Screen Component - Exact replica from Figma design
 *
 * Figma: IO0sKndZpfYlW5OVXoIpuC, node 0:1283 ("boot white")
 * Canvas: 1440x1024px
 * Background: Image from Figma (blue gradient to white)
 * Icon: 3D isometric cube (77x89px)
 */
export function BootScreen({ duration = 3000, onComplete, className }: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Prevent body scroll when boot screen is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsExiting(true);

        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-label="Loading application"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 500ms ease-out',
        opacity: isExiting ? 0 : 1,
      }}
    >
      <div className="boot-background-layer" aria-hidden />
      <div
        className="boot-screen-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Loading Animation - Lottie (Frame 36799 (2).json) */}
        <Lottie
          animationData={bootAnimationData}
          loop
          autoplay
          style={{
            width: '120px',
            height: '120px',
            maxWidth: '90vw',
          }}
        />
      </div>
      {/* Screen reader progress */}
      <span
        className="boot-screen-content"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        Loading: {Math.round(progress)}% complete
      </span>
    </div>
  );
}

export default BootScreen;
