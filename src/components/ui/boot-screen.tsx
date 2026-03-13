'use client';

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

import bootAnimationData from '@/assets/boot-animation.json';
import { cn } from '@/lib/utils';

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
      className={cn(
        'fixed inset-0 z-9999 m-0 flex h-screen w-screen items-center justify-center overflow-hidden p-0 transition-opacity duration-500 ease-out',
        isExiting ? 'opacity-0' : 'opacity-100',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      {/* Boot screen background layer – extends past edges so blur never shows white line */}
      <div
        className="absolute -top-[3%] -left-[3%] z-0 h-[106%] w-[106%] bg-[url('/images/boot-background-clean.png')] bg-cover bg-center bg-no-repeat max-[1680px]:blur-[2px]"
        aria-hidden
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {/* Loading Animation - Lottie (Frame 36799 (2).json) */}
        <Lottie
          animationData={bootAnimationData}
          loop
          autoplay
          className="h-30 w-30 max-w-[90vw]"
        />
      </div>
      {/* Screen reader progress */}
      <span className="sr-only">Loading: {Math.round(progress)}% complete</span>
    </div>
  );
}

export default BootScreen;
