'use client';

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

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
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/images/boot-animation.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Failed to load animation:', err));
  }, []);

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
        backgroundImage: 'url(/images/boot-background-clean.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'opacity 500ms ease-out',
        opacity: isExiting ? 0 : 1,
      }}
    >
      {/* Loading Animation - Lottie */}
      {animationData && (
        <div
          style={{
            width: '165px',
            height: '165px',
            maxWidth: '90vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid meet',
              progressiveLoad: false,
              hideOnTransparent: true,
              className: 'lottie-animation',
            }}
            style={{
              width: '330px',
              height: '330px',
              transform: 'scale(0.5)',
              transformOrigin: 'center center',
              imageRendering: '-webkit-optimize-contrast',
              WebkitFontSmoothing: 'antialiased',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
            }}
          />
        </div>
      )}

      {/* Screen reader progress */}
      <span
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
