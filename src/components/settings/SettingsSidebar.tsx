'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { SettingsNavItem } from '@/components/settings/SettingsNavItem';
import { SETTINGS_SECTIONS } from '@/types/settings';

type SettingsSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SettingsSidebar({ onNavigate, className }: SettingsSidebarProps) {
  return (
    <nav
      aria-label="Налаштування"
      className={[
        'scrollbar-subtle w-sideBarWidth border-subtlest flex h-full flex-col gap-2 overflow-y-auto border-r py-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 flex px-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="group gap-xs text-quiet hover:bg-quiet hover:text-foreground flex items-center rounded-md px-2 py-1 text-sm transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate">Назад</span>
        </Link>
      </div>

      <div className="scrollbar-subtle overflow-y-auto px-2">
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.id} className="flex flex-col">
            <div className="text-quiet px-3 py-2 text-xs font-normal">{section.label}</div>
            <div className="flex flex-col gap-[2px]">
              {section.items.map((item) => (
                <div key={item.id} className="px-xs">
                  <SettingsNavItem item={item} onNavigate={onNavigate} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
