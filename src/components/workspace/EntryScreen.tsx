'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { BootScreen } from '@/components/ui/BootScreen';
import { getWorkspaceHomePath } from '@/lib/app-routes';

const BOOT_DONE_KEY = 'lexery-boot-done';

export function EntryScreen() {
  const router = useRouter();
  const shouldSkipBoot = useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof window === 'undefined') {
        return false;
      }

      return window.sessionStorage.getItem(BOOT_DONE_KEY) === '1';
    },
    () => false
  );

  useEffect(() => {
    if (shouldSkipBoot) {
      router.replace(getWorkspaceHomePath());
    }
  }, [router, shouldSkipBoot]);

  const handleBootComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(BOOT_DONE_KEY, '1');
    }

    router.replace(getWorkspaceHomePath());
  }, [router]);

  if (shouldSkipBoot) {
    return null;
  }

  return <BootScreen onComplete={handleBootComplete} />;
}

export default EntryScreen;
