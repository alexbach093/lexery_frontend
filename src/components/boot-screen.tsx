'use client';

import { useEffect, useState } from 'react';

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
 * Boot Screen Component - Exact replica of Figma design
 * 
 * Design specs from Figma:
 * - Canvas: 1440x1024px
 * - Background: Blue to white gradient (top to bottom)
 * - Icon: 3D cube ~110x106px centered
 * - Style: Minimal, clean, professional
 */
export function BootScreen({
  duration = 3000,
  onComplete,
  className,
}: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate boot sequence with progress
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsExiting(true);
        
        // Wait for exit animation before calling onComplete
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-gradient-to-b from-[#4A90E2] via-[#7BB3E8] to-white',
        'flex items-center justify-center',
        'transition-opacity duration-500',
        isExiting && 'opacity-0',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      {/* 3D Cube Icon - Exact from Figma */}
      <div className="relative flex items-center justify-center">
        <div className="relative animate-float">
          <svg
            width="77"
            height="89"
            viewBox="0 0 77 89"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse-subtle"
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

        {/* Screen reader progress announcement */}
        <span className="sr-only">Loading: {Math.round(progress)}% complete</span>
      </div>
    </div>
  );
}
