'use client';

import Lottie from 'lottie-react';
import { useEffect } from 'react';

import bootAnimationData from '@/assets/boot-animation.json';

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
      className={className}
      role="alert"
      aria-live="assertive"
      aria-label="Application error"
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="boot-background-layer" aria-hidden />
      <div
        className="boot-screen-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Loading Animation - Same as boot screen */}
        <div
          style={{
            marginBottom: '16px',
          }}
        >
          <Lottie
            animationData={bootAnimationData}
            loop={true}
            autoplay={true}
            style={{
              width: '120px',
              height: '120px',
              maxWidth: '90vw',
            }}
          />
        </div>

        {/* Error Message */}
        <div
          style={{
            maxWidth: '500px',
            textAlign: 'center',
            padding: '0 24px',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '12px',
              lineHeight: '1.4',
            }}
          >
            {errorMessage}
          </h1>

          {errorCode && (
            <p
              style={{
                fontSize: '14px',
                color: '#6B7280',
                fontFamily: 'monospace',
              }}
            >
              Код помилки: {errorCode}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BootErrorScreen;
