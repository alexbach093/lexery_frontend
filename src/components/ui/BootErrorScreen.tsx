'use client';

import Lottie from 'lottie-react';
import { useEffect } from 'react';

import bootAnimationData from '@/assets/boot-animation.json';
import { cn } from '@/lib/utils';

interface BootErrorScreenProps {
  /**
   * Error message to display
   */
  errorMessage?: string;
  /**
   * Error code (optional)
   */
  errorCode?: string;
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Boot Error Screen Component - Displays error state
 *
 * Shows when the application fails to load or encounters a critical error
 * Matches the design style of boot screen but with error state
 */
export function BootErrorScreen({
  errorMessage = 'Не вдалося завантажити додаток',
  errorCode,
  className,
}: BootErrorScreenProps) {
  // Prevent body scroll when error screen is active
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

  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 m-0 flex h-screen w-screen flex-col items-center justify-center overflow-hidden p-0',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label="Application error"
    >
      <div
        className="absolute -top-[3%] -left-[3%] z-0 h-[106%] w-[106%] bg-[url('/images/boot-background-clean.png')] bg-cover bg-center bg-no-repeat max-[1680px]:blur-[2px]"
        aria-hidden
      />
      <div className="boot-screen-content absolute inset-0 flex flex-col items-center justify-center">
        {/* Loading Animation - Same as boot screen */}
        <div className="mb-4">
          <Lottie
            animationData={bootAnimationData}
            loop={true}
            autoplay={true}
            className="h-30 w-30 max-w-[90vw]"
          />
        </div>

        {/* Error Message */}
        <div className="max-w-125 px-6 text-center">
          <h1 className="mb-3 text-[24px] leading-[1.4] font-semibold text-black">
            {errorMessage}
          </h1>

          {errorCode && (
            <p className="font-mono text-sm text-[#6B7280]">Код помилки: {errorCode}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BootErrorScreen;
