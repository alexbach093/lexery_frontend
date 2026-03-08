'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { cn } from '@/lib/utils';
import type { SettingsNavItem as SettingsNavItemType } from '@/types/settings';

type SettingsNavItemProps = {
  item: SettingsNavItemType;
  onNavigate?: () => void;
};

export function SettingsNavItem({ item, onNavigate }: SettingsNavItemProps) {
  const pathname = usePathname();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const isActive = pathname === item.href;

  return (
    <Link
      ref={linkRef}
      href={item.href}
      role="button"
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
      onClick={onNavigate}
      onKeyDown={(event) => {
        if (event.key === ' ') {
          event.preventDefault();
          linkRef.current?.click();
        }
      }}
      className={cn(
        'gap-two font-semimedium ease-outExpo flex h-8 w-full origin-center items-center justify-start rounded-md px-2.5 text-sm transition duration-300 outline-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        'active:ease-outExpo active:scale-[0.97] active:duration-150',
        isActive ? 'bg-quiet text-foreground' : 'text-quiet hover:bg-quiet hover:text-foreground'
      )}
    >
      <span className="min-w-0 truncate">{item.label}</span>
    </Link>
  );
}
