'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  SettingsNavDatabaseIcon,
  SettingsNavGearIcon,
  SettingsNavShieldIcon,
} from '@/components/ui/settings-nav-icons';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = ['Системна', 'Темна', 'Світла'] as const;
type ThemeOption = (typeof THEME_OPTIONS)[number];

type SectionId = 'general' | 'info' | 'security';
type SettingKind = 'theme' | 'value' | 'toggle' | 'action';

type SettingRow = {
  id: string;
  label: string;
  description?: string;
  kind: SettingKind;
  value?: string;
  actionLabel?: string;
  danger?: boolean;
  disabled?: boolean;
};

type SettingsSection = {
  id: SectionId;
  label: string;
  rows: SettingRow[];
};

const SECTIONS: SettingsSection[] = [
  {
    id: 'general',
    label: 'Загальні',
    rows: [
      { id: 'theme', label: 'Тема', kind: 'theme' },
      { id: 'language', label: 'Мова', kind: 'value', value: 'Українська' },
      {
        id: 'memory',
        label: 'Збереження пам’яті',
        description: 'Дозволяє Lexery зберігати і використовувати чати для кращих відповідей',
        kind: 'toggle',
      },
      {
        id: 'delete-chats',
        label: 'Видалити всі чати',
        kind: 'action',
        actionLabel: 'Видалити',
        danger: true,
      },
      {
        id: 'logout',
        label: 'Вийти з акаунту',
        kind: 'action',
        actionLabel: 'Вийти',
      },
    ],
  },
  {
    id: 'info',
    label: 'Інформація',
    rows: [
      {
        id: 'shared',
        label: 'Поширені чати',
        description: 'Перегляд чатів, які були відкриті для інших користувачів.',
        kind: 'action',
        actionLabel: 'Переглянути',
        disabled: true,
      },
      {
        id: 'delete-account',
        label: 'Видалити обліковий запис',
        description: 'Незворотне видалення профілю, історії та локальних прив’язок.',
        kind: 'action',
        actionLabel: 'Видалити',
        danger: true,
      },
    ],
  },
  {
    id: 'security',
    label: 'Безпека',
    rows: [
      {
        id: 'mfa',
        label: 'Мультифакторна автентифікація',
        description: 'Додає другий рівень перевірки для входу в Lexery.',
        kind: 'action',
        actionLabel: 'Підключити',
        disabled: true,
      },
      {
        id: 'signout-all',
        label: 'Вийти з усіх пристроїв',
        description: 'Завершує всі інші активні сесії цього акаунту.',
        kind: 'action',
        actionLabel: 'Видалити',
        danger: true,
      },
    ],
  },
];

function ChevronDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5.5 7.75L10 12.25L14.5 7.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M14.5 5.5L5.5 14.5M5.5 5.5l9 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Закрити налаштування"
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border-none bg-transparent text-[#171717] transition-colors hover:bg-black/5"
    >
      <CloseIcon />
    </button>
  );
}

function SettingsTab({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-10 w-[calc(100%-8px)] cursor-pointer items-center gap-2.5 self-center rounded-xl border-none px-3 text-left text-[#171717] transition-colors',
        active ? 'bg-[#ECECEC]' : 'bg-transparent hover:bg-black/5'
      )}
    >
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="font-sans text-[14px] leading-5 font-medium tracking-[0.14px]">{label}</span>
    </button>
  );
}

function ActionButton({
  children,
  danger = false,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 min-w-23 items-center justify-center rounded-full border px-3 font-sans text-[14px] leading-5 font-normal tracking-normal transition-colors',
        disabled
          ? 'cursor-default border-[#E4E4E4] bg-[#F5F5F5] text-[#AAAAAA]'
          : danger
            ? 'cursor-pointer border-[#F19A9A] bg-white text-[#F25555] hover:bg-[#FFF0F0]'
            : 'cursor-pointer border-[#D7D7D7] bg-white text-[#3A3A3A] hover:bg-gray-50'
      )}
    >
      {children}
    </button>
  );
}

function SelectLikeControl({
  children,
  active = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        'inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-transparent px-2.75 font-sans text-[14px] leading-5 font-normal tracking-normal whitespace-nowrap text-[#171717] transition-colors duration-140 ease-in-out',
        active ? 'bg-[#F2F2F2]' : 'bg-transparent hover:bg-[#F2F2F2]/50'
      )}
    >
      {children}
    </button>
  );
}

function ToggleControl({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        'inline-flex h-5 w-8 cursor-pointer items-center rounded-full border-none p-0.5 transition-colors duration-150 ease-in-out',
        checked ? 'bg-[#1C1C1C]' : 'bg-[#D8D8D8]'
      )}
    >
      <span
        className={cn(
          'h-4 w-4 rounded-full bg-white transition-transform duration-150 ease-in-out',
          checked ? 'translate-x-3' : 'translate-x-0'
        )}
      />
    </button>
  );
}

function SettingRowItem({
  row,
  control,
  isLast,
}: {
  row: SettingRow;
  control: ReactNode;
  isLast: boolean;
}) {
  const hasDescription = Boolean(row.description);
  const centeredInfoRow = row.id === 'shared';

  return (
    <div
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] gap-4',
        hasDescription
          ? centeredInfoRow
            ? 'min-h-19 items-center py-2.5'
            : 'min-h-20 items-start py-3'
          : 'min-h-13.5 items-center py-2',
        !isLast && 'border-b border-[#ECECEC]'
      )}
    >
      <div className={cn('min-w-0', centeredInfoRow ? 'flex flex-col justify-center' : 'block')}>
        <div className="font-sans text-[14px] leading-5 font-normal tracking-normal text-[#171717]">
          {row.label}
        </div>
        {row.description && (
          <div className="mt-1 max-w-97.5 font-sans text-[12px] leading-4.25 font-normal tracking-normal text-[#8C8C8C]">
            {row.description}
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex shrink-0 justify-end',
          hasDescription
            ? centeredInfoRow
              ? 'items-center pt-0'
              : 'items-start pt-0.5'
            : 'items-center pt-0'
        )}
      >
        {control}
      </div>
    </div>
  );
}

function DeleteChatsConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      className="absolute inset-0 z-40 box-border flex items-center justify-center bg-white/50"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-chats-confirm-title"
        aria-describedby="delete-chats-confirm-description"
        onClick={(event) => event.stopPropagation()}
        className="box-border flex h-38 w-109 flex-col items-center justify-start rounded-[28px] border border-[#D9D9D9] bg-white/80 pt-7 pr-6 pb-5.5 pl-6 backdrop-blur-[14px]"
      >
        <h3
          id="delete-chats-confirm-title"
          className="m-0 text-center font-sans text-[16px] leading-5.5 font-bold tracking-normal text-black"
        >
          Очистити історію чатів - ви впевнені?
        </h3>
        <p
          id="delete-chats-confirm-description"
          className="mt-1.5 text-center font-sans text-[12px] leading-4.25 font-normal tracking-normal text-black/40"
        >
          Щоб очистити пам&apos;ять із чатів, зайдіть у{' '}
          <span className="underline">налаштування.</span>
        </p>
        <div className="mt-3.75 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10.5 w-25.5 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 font-sans text-[15px] leading-5.25 font-normal tracking-normal whitespace-nowrap text-black transition-colors hover:bg-white/90"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10.5 min-w-43 cursor-pointer items-center justify-center rounded-full border-none bg-[#FF4747] px-4.5 font-sans text-[15px] leading-5.25 font-normal tracking-normal whitespace-nowrap text-white transition-colors hover:bg-[#ff3333]"
          >
            Підтвердити видалення
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountConfirmDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-45 box-border flex items-center justify-center bg-[rgba(250,250,250,0.68)] p-6 backdrop-blur-sm"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-confirm-title"
        aria-describedby="delete-account-confirm-description"
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-subtle box-border max-h-[calc(100%-48px)] w-[min(620px,calc(100%-48px))] overflow-y-auto rounded-[28px] border border-[#D9D9D9] bg-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEEEEE] px-6 pt-6 pb-4">
          <h3
            id="delete-account-confirm-title"
            className="m-0 font-sans text-[18px] leading-6.5 font-semibold tracking-normal text-black"
          >
            Видалити обліковий запис - ви впевнені?
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити підтвердження видалення облікового запису"
            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent p-0 text-black transition-colors hover:bg-black/5"
          >
            <CloseIcon />
          </button>
        </div>

        <div id="delete-account-confirm-description" className="px-6 pt-4.5">
          <ul className="m-0 flex list-outside list-disc flex-col gap-2.5 pl-5.5 font-sans text-[14px] leading-5 font-normal tracking-normal text-black">
            <li>Видалення облікового запису є незворотним і його не можна скасувати.</li>
            <li>Ви не зможете створити новий обліковий запис із цією ж електронною адресою.</li>
            <li>
              Ваші дані буде видалено протягом 30 днів, але частина даних може зберігатися довше,
              якщо цього вимагає або дозволяє закон.
            </li>
          </ul>

          <p className="mt-4.5 font-sans text-[14px] leading-5 font-normal tracking-normal text-[rgba(0,0,0,0.34)]">
            Ви зможете видалити обліковий запис лише якщо входили в нього протягом останніх 10
            хвилин. Увійдіть ще раз, а потім поверніться сюди.
          </p>
        </div>

        <div className="mt-5.5 flex justify-end border-t border-[#EEEEEE] px-6 pt-3.5 pb-5.5">
          <button
            type="button"
            className="inline-flex h-11 w-39 cursor-pointer items-center justify-center rounded-full border-none bg-black px-6 font-sans text-[14px] leading-5 font-normal tracking-normal whitespace-nowrap text-white transition-colors hover:bg-black/80"
          >
            Оновити вхід
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsScreen({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>('general');
  const [theme, setTheme] = useState<ThemeOption>('Світла');
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeHovered, setThemeHovered] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [deleteChatsConfirmOpen, setDeleteChatsConfirmOpen] = useState(false);
  const [deleteAccountConfirmOpen, setDeleteAccountConfirmOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  const sectionIcons = useMemo<Record<SectionId, ReactNode>>(
    () => ({
      general: <SettingsNavGearIcon />,
      info: <SettingsNavDatabaseIcon />,
      security: <SettingsNavShieldIcon />,
    }),
    []
  );

  const activeSectionData = SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[0];
  const themeButtonActive = themeHovered || themeOpen;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setThemeOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!deleteChatsConfirmOpen && !deleteAccountConfirmOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDeleteChatsConfirmOpen(false);
        setDeleteAccountConfirmOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteAccountConfirmOpen, deleteChatsConfirmOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    router.back();
  };

  const handleDeleteChatsConfirm = () => setDeleteChatsConfirmOpen(false);

  const renderControl = (row: SettingRow) => {
    if (row.kind === 'theme') {
      return (
        <div ref={themeMenuRef} className="relative">
          <SelectLikeControl
            active={themeButtonActive}
            onClick={() => setThemeOpen((current) => !current)}
            onMouseEnter={() => setThemeHovered(true)}
            onMouseLeave={() => setThemeHovered(false)}
            onFocus={() => setThemeHovered(true)}
            onBlur={() => setThemeHovered(false)}
          >
            <span>{theme}</span>
            <ChevronDownIcon />
          </SelectLikeControl>

          {themeOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 z-10 min-w-33 rounded-xl border border-[#DEDEDE] bg-white p-1.25">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setTheme(option);
                    setThemeOpen(false);
                    setThemeHovered(false);
                  }}
                  className={cn(
                    'flex h-8 w-full cursor-pointer items-center justify-start rounded-[9px] border-none px-2.25 text-left font-sans text-[13px] leading-4.25 font-normal text-[#171717] transition-colors',
                    option === theme ? 'bg-[#F4F4F4]' : 'bg-transparent hover:bg-gray-100'
                  )}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (row.kind === 'value') {
      return (
        <SelectLikeControl>
          <span>{row.value}</span>
          {row.id !== 'language' && <ChevronDownIcon />}
        </SelectLikeControl>
      );
    }

    if (row.kind === 'toggle') {
      return (
        <ToggleControl
          checked={memoryEnabled}
          onClick={() => setMemoryEnabled((current) => !current)}
        />
      );
    }

    return (
      <ActionButton
        danger={row.danger}
        disabled={row.disabled}
        onClick={
          row.id === 'delete-chats'
            ? () => {
                setThemeOpen(false);
                setThemeHovered(false);
                setDeleteAccountConfirmOpen(false);
                setDeleteChatsConfirmOpen(true);
              }
            : row.id === 'delete-account'
              ? () => {
                  setThemeOpen(false);
                  setThemeHovered(false);
                  setDeleteChatsConfirmOpen(false);
                  setDeleteAccountConfirmOpen(true);
                }
              : undefined
        }
      >
        {row.actionLabel}
      </ActionButton>
    );
  };

  return (
    <main className="fixed inset-0 z-50 box-border flex items-center justify-center bg-[rgba(250,250,250,0.62)] p-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Налаштування"
        className="relative grid min-h-141 w-full max-w-188 grid-cols-[186px_minmax(0,1fr)] overflow-hidden rounded-[22px] border border-[#D9D9D9] bg-white"
      >
        {deleteAccountConfirmOpen && (
          <DeleteAccountConfirmDialog onClose={() => setDeleteAccountConfirmOpen(false)} />
        )}
        {deleteChatsConfirmOpen && (
          <DeleteChatsConfirmDialog
            onCancel={() => setDeleteChatsConfirmOpen(false)}
            onConfirm={handleDeleteChatsConfirm}
          />
        )}
        <aside className="flex min-h-141 flex-col border-r border-[#ECECEC] bg-[#F8F8F8]">
          <div className="px-3 pt-3 pb-2.5">
            <SettingsCloseButton onClick={handleClose} />
          </div>

          <div
            role="tablist"
            aria-orientation="vertical"
            className="flex flex-col px-2 pt-1.5 pb-3"
          >
            {SECTIONS.map((section) => (
              <SettingsTab
                key={section.id}
                label={section.label}
                active={activeSection === section.id}
                icon={sectionIcons[section.id]}
                onClick={() => {
                  setActiveSection(section.id);
                  setThemeOpen(false);
                  setThemeHovered(false);
                }}
              />
            ))}
          </div>
        </aside>

        <section className="flex min-h-141 flex-col bg-white">
          <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto px-4.5 pt-4.5">
            <div className="flex min-h-13 items-center border-b border-[#ECECEC]">
              <h2 className="m-0 font-sans text-[17px] leading-6 font-normal tracking-normal text-[#171717]">
                {activeSectionData.label}
              </h2>
            </div>

            <div>
              {activeSectionData.rows.map((row, index) => (
                <SettingRowItem
                  key={row.id}
                  row={row}
                  control={renderControl(row)}
                  isLast={index === activeSectionData.rows.length - 1}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SettingsScreen;
