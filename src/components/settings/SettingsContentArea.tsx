'use client';

import { Menu } from 'lucide-react';

type SettingsContentAreaProps = {
  children: React.ReactNode;
  onOpenNavigation: () => void;
};

export function SettingsContentArea({ children, onOpenNavigation }: SettingsContentAreaProps) {
  return (
    <main className="bg-base flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-subtlest flex items-center justify-between border-b px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={onOpenNavigation}
          aria-label="Відкрити навігацію налаштувань"
          className="border-subtlest bg-base text-foreground ease-outExpo hover:bg-subtle active:ease-outExpo inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[0.97] active:duration-150"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
        </button>
        <span className="font-semimedium text-foreground text-sm">Налаштування</span>
        <div className="h-9 w-9" aria-hidden="true" />
      </div>

      <div className="scrollbar-subtle flex min-h-0 flex-1 flex-col overflow-auto [scrollbar-gutter:stable]">
        <div className="mx-auto flex w-full max-w-screen-md flex-col px-4 pt-6 pb-20 md:px-6 md:pt-8 md:pb-8">
          {children}
        </div>
      </div>
    </main>
  );
}
