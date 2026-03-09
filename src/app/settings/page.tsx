'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Налаштування тепер показуються оверлеєм на головній сторінці.
 * Пряме посилання /settings перенаправляє на головну.
 */
export default function SettingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
