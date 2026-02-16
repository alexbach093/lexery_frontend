'use client';

import Image from 'next/image';
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
  /**
   * Show loading progress indicator
   * @default true
   */
  showProgress?: boolean;
  /**
   * Custom loading message
   */
  message?: string;
}

export function BootScreen({
  duration = 3000,
  onComplete,
  className,
  showProgress = true,
  message = 'Initializing Legal AI...',
}: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate boot sequence with progress
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsLoaded(true);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      className={cn(
        'bg-background fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500',
        isLoaded && 'pointer-events-none opacity-0',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Application loading"
    >
      {/* Background gradient effect */}
      <div className="from-background via-background to-muted/20 absolute inset-0 bg-gradient-to-br" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 sm:gap-12">
        {/* Logo with pulse animation */}
        <div className="relative">
          <div
            className={cn(
              'bg-primary/20 absolute inset-0 -z-10 animate-pulse rounded-full blur-2xl transition-all',
              isLoaded && 'opacity-0'
            )}
          />
          <div className="animate-fade-in-up">
            <Image
              src="/lexery-logo.svg"
              alt="LEXERY Legal AI"
              width={240}
              height={57}
              priority
              className="text-foreground h-12 w-auto sm:h-14"
            />
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-sm">
          {/* Spinner */}
          <div className="relative h-16 w-16">
            {/* Outer ring */}
            <div className="animate-spin-slow border-primary/20 border-t-primary absolute inset-0 rounded-full border-2" />
            {/* Inner ring */}
            <div className="animate-spin-reverse border-primary/10 border-b-primary/50 absolute inset-2 rounded-full border-2" />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            </div>
          </div>

          {/* Loading message */}
          <div className="animate-fade-in-up animation-delay-300 text-center">
            <p className="text-foreground/80 text-sm font-medium sm:text-base">{message}</p>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div
              className="animate-fade-in-up animation-delay-500 w-full"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                <div
                  className="from-primary/50 via-primary to-primary/50 h-full bg-gradient-to-r transition-all duration-300 ease-out"
                  style={{
                    width: `${progress}%`,
                    transform: `scaleX(${progress / 100})`,
                    transformOrigin: 'left',
                  }}
                />
              </div>
              <p className="text-muted-foreground mt-2 text-center text-xs">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>

        {/* Tagline */}
        <div className="animate-fade-in-up animation-delay-700 text-center">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase sm:text-sm">
            Intelligent Legal Solutions
          </p>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="animate-fade-in-up animation-delay-1000 absolute bottom-8">
        <p className="text-muted-foreground text-xs">Powered by Advanced AI Technology</p>
      </div>

      {/* Accessibility announcement */}
      <div className="sr-only" aria-atomic="true">
        Loading progress: {Math.round(progress)}%{isLoaded && ' Complete'}
      </div>
    </div>
  );
}

// Export display name for debugging
BootScreen.displayName = 'BootScreen';
