'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { SettingsContentArea } from '@/components/settings/SettingsContentArea';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';

type SettingsLayoutProps = {
  children: React.ReactNode;
};

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(selector));
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const elements = Array.from(drawer.querySelectorAll<HTMLElement>(selector)).filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1
      );

      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !drawer.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="bg-base h-screen p-2">
      <div className="border-subtlest bg-base relative flex h-full min-h-0 rounded-md border">
        <div className="hidden md:flex md:h-full md:shrink-0">
          <SettingsSidebar />
        </div>

        <div
          className={[
            'fixed inset-0 z-50 md:hidden',
            mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
          ].join(' ')}
          aria-hidden={!mobileOpen}
        >
          <button
            type="button"
            aria-label="Закрити навігацію налаштувань"
            onClick={() => setMobileOpen(false)}
            className={[
              'bg-underlay ease-outExpo absolute inset-0 cursor-pointer transition-opacity duration-300',
              mobileOpen ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />

          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Навігація налаштувань"
            className={[
              'w-sideBarWidth border-subtlest bg-base ease-outExpo absolute inset-y-0 left-0 flex max-w-[85vw] transform flex-col border-r shadow-xl transition duration-300',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
          >
            <SettingsSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        <SettingsContentArea onOpenNavigation={() => setMobileOpen(true)}>
          {children}
        </SettingsContentArea>
      </div>
    </div>
  );
}
