'use client';

import { useState } from 'react';

import { BootErrorScreen } from '@/components/boot-error-screen';

export default function BootErrorDemoPage() {
  const [showError, setShowError] = useState(true);
  const [errorMessage, setErrorMessage] = useState('Не вдалося завантажити додаток');
  const [errorCode, setErrorCode] = useState('ERR_CONNECTION_REFUSED');

  const handleRetry = () => {
    console.log('Retry clicked');
    // Simulate retry logic
    alert('Спроба підключення...');
  };

  const handleReset = () => {
    setShowError(true);
  };

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      {/* Error screen overlay */}
      {showError && (
        <BootErrorScreen errorMessage={errorMessage} errorCode={errorCode} onRetry={handleRetry} />
      )}

      {/* Main content (won't be visible when error screen is shown) */}
      {!showError && (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
          <div className="w-full max-w-2xl space-y-8 text-center">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                LEXERY Boot Error Screen
              </h1>
              <p className="text-muted-foreground text-lg">
                Error state for critical application failures
              </p>
            </div>

            {/* Demo controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleReset}
                className="border-border bg-background hover:bg-muted flex h-12 items-center justify-center rounded-lg border px-6 font-medium transition-colors"
              >
                Show Error Screen
              </button>
            </div>

            {/* Customization */}
            <div className="border-border bg-card mt-12 rounded-lg border p-6 text-left">
              <h3 className="text-foreground mb-4 font-semibold">Customize Error</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Error Message
                  </label>
                  <input
                    type="text"
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    className="border-border bg-background text-foreground w-full rounded-lg border px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Error Code (optional)
                  </label>
                  <input
                    type="text"
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    className="border-border bg-background text-foreground w-full rounded-lg border px-4 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="border-border bg-card rounded-lg border p-6 text-left">
                <h3 className="text-foreground mb-2 font-semibold">Error States</h3>
                <p className="text-muted-foreground text-sm">
                  Display critical errors with clear messaging and recovery options
                </p>
              </div>

              <div className="border-border bg-card rounded-lg border p-6 text-left">
                <h3 className="text-foreground mb-2 font-semibold">User Actions</h3>
                <p className="text-muted-foreground text-sm">
                  Retry and reload buttons for user-initiated error recovery
                </p>
              </div>

              <div className="border-border bg-card rounded-lg border p-6 text-left">
                <h3 className="text-foreground mb-2 font-semibold">Consistent Design</h3>
                <p className="text-muted-foreground text-sm">
                  Matches boot screen design language with same background and styling
                </p>
              </div>

              <div className="border-border bg-card rounded-lg border p-6 text-left">
                <h3 className="text-foreground mb-2 font-semibold">Accessibility</h3>
                <p className="text-muted-foreground text-sm">
                  ARIA alerts and proper semantic HTML for screen readers
                </p>
              </div>
            </div>

            {/* Usage example */}
            <div className="border-border bg-muted/30 mt-12 rounded-lg border p-6 text-left">
              <h3 className="text-foreground mb-4 font-semibold">Usage Example</h3>
              <pre className="bg-background text-foreground overflow-x-auto rounded p-4 text-xs">
                <code>{`import { BootErrorScreen } from '@/components/boot-error-screen';

function App() {
  return (
    <BootErrorScreen
      errorMessage="Не вдалося завантажити додаток"
      errorCode="ERR_CONNECTION_REFUSED"
      onRetry={() => window.location.reload()}
    />
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
