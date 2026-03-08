'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SettingsActionButton } from './SettingsPage';

const DELETE_ACCOUNT_BULLETS = [
  'Ваші дані профілю, параметри та налаштування буде видалено.',
  'Вашу історію пошуку, треди та будь-який інший контент, яким ви ділилися, буде видалено.',
];

export function DeleteAccountInline() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [expanded]);

  useEffect(() => {
    if (expanded) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [expanded]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-foreground text-sm font-medium">Видалити акаунт</p>
          </div>
          <div className="text-quiet mt-0 text-[13px] leading-6">
            Назавжди видалити ваш акаунт і дані
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
          <SettingsActionButton type="button" onClick={() => setExpanded(true)}>
            Видалити
          </SettingsActionButton>
        </div>
      </div>

      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-account-title"
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="bg-underlay absolute inset-0 cursor-pointer"
            aria-label="Закрити"
          />
          <div className="border-subtlest bg-base relative z-10 flex max-h-[85vh] w-full max-w-screen-sm flex-col overflow-hidden rounded-xl border md:max-h-[85vh] md:w-[540px]">
            <div className="flex items-start justify-between gap-4 px-10 pt-9 pb-1 md:px-12 md:pt-10 md:pb-2">
              <h3 id="delete-account-title" className="text-foreground text-lg font-bold">
                Підтвердження видалення акаунта
              </h3>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Закрити"
                className="text-quiet hover:bg-quiet hover:text-foreground inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="px-10 pt-3 pb-2 md:px-12 md:pt-4 md:pb-3">
                <div className="max-w-2xl space-y-4">
                  <p className="text-foreground text-sm leading-6">
                    Перш ніж видалити акаунт, ознайомтеся з тим, що станеться з вашими даними:
                  </p>

                  <ul className="text-foreground space-y-2 pl-6 text-sm leading-6">
                    {DELETE_ACCOUNT_BULLETS.map((item) => (
                      <li key={item} className="list-disc pl-0.5">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className="text-foreground text-sm leading-6">
                    Усі дані буде остаточно видалено через 30 днів після видалення акаунта.{' '}
                    <strong className="font-semibold">
                      Зверніть увагу: видалення акаунта неможливо скасувати.
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-base flex flex-col items-stretch justify-end gap-2 px-10 pt-1 pb-9 md:flex-row md:items-center md:px-12 md:pt-2 md:pb-10">
              <SettingsActionButton
                type="button"
                onClick={() => setExpanded(false)}
                className="bg-quiet hover:bg-subtle h-8 w-full rounded-lg border-transparent px-3 text-sm md:w-auto"
              >
                Скасувати
              </SettingsActionButton>
              <button
                type="button"
                className="ease-outExpo active:ease-outExpo inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-lg border border-transparent bg-[#ff6b86] px-3 text-sm font-medium text-white transition duration-300 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[0.97] active:duration-150 md:w-auto"
              >
                Підтвердити видалення
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
