'use client';

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

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
   * Callback when retry button is clicked
   */
  onRetry?: () => void;
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
  onRetry,
  className,
}: BootErrorScreenProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/images/boot-animation.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Failed to load animation:', err));
  }, []);

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
        backgroundImage: 'url(/images/boot-background-clean.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Loading Animation - Same as boot screen */}
      <div
        style={{
          marginBottom: '16px',
        }}
      >
        {animationData && (
          <div
            style={{
              width: '165px',
              height: '165px',
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
              marginBottom: '32px',
              fontFamily: 'monospace',
            }}
          >
            Код помилки: {errorCode}
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#FFFFFF',
            backgroundColor: '#000000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '200px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
          }}
        >
          Оновити сторінку
        </button>
      </div>
    </div>
  );
}

export default BootErrorScreen;
