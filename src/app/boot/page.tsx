'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Boot — більше не окремий маршрут. Редірект на головну (/),
 * де boot є частиною воркспейсу (показується при першому завантаженні).
 */
export default function BootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
