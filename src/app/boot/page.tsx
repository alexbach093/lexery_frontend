'use client';

import { useState } from 'react';

import { BootScreen } from '@/components/boot-screen';

export default function BootDemoPage() {
  const [showBoot, setShowBoot] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);

  const handleReset = () => {
    setBootComplete(false);
    setShowBoot(true);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Boot screen overlay */}
      {showBoot && (
        <BootScreen
          duration={3000}
          onComplete={() => {
            setShowBoot(false);
            setBootComplete(true);
          }}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
              LEXERY Boot Screen
            </h1>
            <p className="text-muted-foreground text-lg">
              Professional loading experience for Legal AI application
            </p>
          </div>

          {/* Status */}
          {bootComplete && (
            <div className="animate-fade-in-up border-primary/20 bg-primary/5 rounded-lg border p-6">
              <p className="text-primary text-sm font-medium">✓ Boot sequence complete</p>
            </div>
          )}

          {/* Demo controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleReset}
              className="border-border bg-background hover:bg-muted flex h-12 items-center justify-center rounded-lg border px-6 font-medium transition-colors"
            >
              Replay Boot Sequence
            </button>
          </div>

          {/* Features */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="border-border bg-card rounded-lg border p-6 text-left">
              <h3 className="text-foreground mb-2 font-semibold">Responsive Design</h3>
              <p className="text-muted-foreground text-sm">
                Optimized for mobile, tablet, and desktop screens with smooth animations
              </p>
            </div>

            <div className="border-border bg-card rounded-lg border p-6 text-left">
              <h3 className="text-foreground mb-2 font-semibold">Accessibility</h3>
              <p className="text-muted-foreground text-sm">
                Full ARIA support with screen reader announcements and keyboard navigation
              </p>
            </div>

            <div className="border-border bg-card rounded-lg border p-6 text-left">
              <h3 className="text-foreground mb-2 font-semibold">Professional Animation</h3>
              <p className="text-muted-foreground text-sm">
                Smooth 60fps animations with dual-ring spinner and progress tracking
              </p>
            </div>

            <div className="border-border bg-card rounded-lg border p-6 text-left">
              <h3 className="text-foreground mb-2 font-semibold">Customizable</h3>
              <p className="text-muted-foreground text-sm">
                Configurable duration, messages, and callbacks for integration
              </p>
            </div>
          </div>

          {/* Usage example */}
          <div className="border-border bg-muted/30 mt-12 rounded-lg border p-6 text-left">
            <h3 className="text-foreground mb-4 font-semibold">Usage Example</h3>
            <pre className="bg-background text-foreground overflow-x-auto rounded p-4 text-xs">
              <code>{`import { BootScreen } from '@/components/boot-screen';

function App() {
  return (
    <BootScreen
      duration={3000}
      onComplete={() => console.log('Ready!')}
      showProgress
      message="Initializing Legal AI..."
    />
  );
}`}</code>
            </pre>
          </div>

          {/* Component props */}
          <div className="border-border bg-card mt-8 rounded-lg border p-6 text-left">
            <h3 className="text-foreground mb-4 font-semibold">Component Props</h3>
            <div className="space-y-3 text-sm">
              <div className="border-border flex flex-col gap-1 border-b pb-3">
                <div className="flex items-center gap-2">
                  <code className="bg-muted rounded px-2 py-1 font-mono text-xs">duration</code>
                  <span className="text-muted-foreground">number</span>
                </div>
                <p className="text-muted-foreground">
                  Duration of boot sequence in milliseconds (default: 3000)
                </p>
              </div>

              <div className="border-border flex flex-col gap-1 border-b pb-3">
                <div className="flex items-center gap-2">
                  <code className="bg-muted rounded px-2 py-1 font-mono text-xs">onComplete</code>
                  <span className="text-muted-foreground">() =&gt; void</span>
                </div>
                <p className="text-muted-foreground">
                  Callback function when boot sequence completes
                </p>
              </div>

              <div className="border-border flex flex-col gap-1 border-b pb-3">
                <div className="flex items-center gap-2">
                  <code className="bg-muted rounded px-2 py-1 font-mono text-xs">showProgress</code>
                  <span className="text-muted-foreground">boolean</span>
                </div>
                <p className="text-muted-foreground">
                  Display progress bar indicator (default: true)
                </p>
              </div>

              <div className="border-border flex flex-col gap-1 border-b pb-3">
                <div className="flex items-center gap-2">
                  <code className="bg-muted rounded px-2 py-1 font-mono text-xs">message</code>
                  <span className="text-muted-foreground">string</span>
                </div>
                <p className="text-muted-foreground">Custom loading message text</p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <code className="bg-muted rounded px-2 py-1 font-mono text-xs">className</code>
                  <span className="text-muted-foreground">string</span>
                </div>
                <p className="text-muted-foreground">Additional CSS classes for styling</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
