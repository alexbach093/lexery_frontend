'use client';

import { useRouter } from 'next/navigation';

import { BootScreen } from '@/components/boot-screen';
import { AppLayout } from '@/components/layout';

/**
 * Boot Page - Start/onboarding screen (first launch).
 * Uses shared AppLayout (sidebar + main area). After boot completes, redirects to /workspace.
 */
export default function BootPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
        }}
      >
        <BootScreen
          duration={3000}
          onComplete={() => {
            router.push('/workspace');
          }}
        />
      </div>
    </AppLayout>
  );
}
