'use client';

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
export function BootScreen({
  duration = 3000,
  onComplete,
  className,
}: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

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
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/images/boot-screen.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'opacity 500ms ease-out',
        opacity: isExiting ? 0 : 1,
      }}
    >
      {/* 3D Cube Icon - Exact SVG from Figma (node 0:1296) */}
      <div
        style={{
          position: 'relative',
          animation: 'boot-float 3s ease-in-out infinite',
        }}
      >
        <svg
          width="77"
          height="89"
          viewBox="0 0 77 89"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            display: 'block',
            animation: 'boot-pulse 2s ease-in-out infinite',
          }}
        >
          <path
            d="M38.2805 86.6718L38.5019 44.3262"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.76181 65.4621L16.6775 56.4634L1.78529 23.0022"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.7523 65.4612L38.4884 86.6707L75.2479 65.4205"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M75.2186 22.9615L60.4096 56.4634L75.1951 65.4213"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.75225 23.0022L38.5118 1.75197L75.2479 22.9616"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.75225 23.0022L38.6862 44.3261L75.2479 22.9616"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M38.5278 69.5338L16.589 56.8674L16.589 31.5346"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M38.4687 69.5339L60.4075 56.8675L60.4075 31.5347"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.5572 31.535L38.496 18.8686L60.4349 31.535"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.5572 31.535L38.6142 44.2696L60.4349 31.535"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M38.3641 69.5338L38.4823 44.2692"
            stroke="black"
            strokeWidth="3.49928"
            strokeMiterlimit="5.01585"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

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

      {/* Keyframe Animations */}
      <style jsx global>{`
        @keyframes boot-float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes boot-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

export default BootScreen;
