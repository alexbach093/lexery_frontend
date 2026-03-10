'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  SettingsNavDatabaseIcon,
  SettingsNavGearIcon,
  SettingsNavShieldIcon,
} from '@/components/ui/settings-nav-icons';

const MODAL_WIDTH = 752;
const MODAL_HEIGHT = 564;
const SIDEBAR_WIDTH = 186;
const CLOSE_BUTTON_SIZE = 36;
const CONTROL_HEIGHT = 36;
const DELETE_CONFIRM_WIDTH = 436;
const DELETE_CONFIRM_HEIGHT = 152;
const DELETE_CONFIRM_RADIUS = 28;
const DELETE_CONFIRM_CANCEL_WIDTH = 102;
const DELETE_CONFIRM_PRIMARY_MIN_WIDTH = 172;
const DELETE_CONFIRM_BUTTON_HEIGHT = 42;
const DELETE_ACCOUNT_CONFIRM_WIDTH = 620;
const DELETE_ACCOUNT_CONFIRM_RADIUS = 28;
const DELETE_ACCOUNT_PRIMARY_WIDTH = 156;
const DELETE_ACCOUNT_PRIMARY_HEIGHT = 44;

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
      style={{
        width: `${CLOSE_BUTTON_SIZE}px`,
        height: `${CLOSE_BUTTON_SIZE}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: '10px',
        backgroundColor: 'transparent',
        color: '#171717',
        cursor: 'pointer',
      }}
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
      style={{
        width: 'calc(100% - 8px)',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 12px',
        border: 'none',
        borderRadius: '12px',
        backgroundColor: active ? '#ECECEC' : 'transparent',
        color: '#171717',
        cursor: 'pointer',
        textAlign: 'left',
        alignSelf: 'center',
      }}
    >
      <span
        style={{
          width: '20px',
          height: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          letterSpacing: '0.14px',
        }}
      >
        {label}
      </span>
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
      style={{
        minWidth: '92px',
        height: `${CONTROL_HEIGHT}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 12px',
        borderRadius: '999px',
        border: `1px solid ${disabled ? '#E4E4E4' : danger ? '#F19A9A' : '#D7D7D7'}`,
        backgroundColor: disabled ? '#F5F5F5' : '#FFFFFF',
        color: disabled ? '#AAAAAA' : danger ? '#F25555' : '#3A3A3A',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 1 : 1,
        fontFamily: 'var(--font-sans)',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: 0,
      }}
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
      style={{
        height: `${CONTROL_HEIGHT}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '0 11px',
        border: '1px solid transparent',
        borderRadius: '8px',
        backgroundColor: active ? '#F2F2F2' : 'transparent',
        color: '#171717',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: 0,
        whiteSpace: 'nowrap',
        transition: 'background-color 140ms ease',
      }}
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
      style={{
        width: '32px',
        height: '20px',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        border: 'none',
        borderRadius: '999px',
        backgroundColor: checked ? '#1C1C1C' : '#D8D8D8',
        cursor: 'pointer',
        transition: 'background-color 150ms ease',
      }}
    >
      <span
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          transform: checked ? 'translateX(12px)' : 'translateX(0)',
          transition: 'transform 150ms ease',
        }}
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
      style={{
        minHeight: hasDescription ? (centeredInfoRow ? '76px' : '80px') : '54px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '16px',
        alignItems: hasDescription ? (centeredInfoRow ? 'center' : 'start') : 'center',
        padding: hasDescription ? (centeredInfoRow ? '10px 0' : '12px 0') : '8px 0',
        borderBottom: isLast ? 'none' : '1px solid #ECECEC',
      }}
    >
      <div
        style={{
          minWidth: 0,
          display: centeredInfoRow ? 'flex' : 'block',
          flexDirection: centeredInfoRow ? 'column' : undefined,
          justifyContent: centeredInfoRow ? 'center' : undefined,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: 0,
            color: '#171717',
          }}
        >
          {row.label}
        </div>
        {row.description && (
          <div
            style={{
              marginTop: '4px',
              maxWidth: '390px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '17px',
              letterSpacing: 0,
              color: '#8C8C8C',
            }}
          >
            {row.description}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: hasDescription ? (centeredInfoRow ? 'center' : 'flex-start') : 'center',
          justifyContent: 'flex-end',
          paddingTop: hasDescription ? (centeredInfoRow ? 0 : '2px') : 0,
          flexShrink: 0,
        }}
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
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        boxSizing: 'border-box',
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-chats-confirm-title"
        aria-describedby="delete-chats-confirm-description"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: `${DELETE_CONFIRM_WIDTH}px`,
          height: `${DELETE_CONFIRM_HEIGHT}px`,
          padding: '28px 24px 22px',
          borderRadius: `${DELETE_CONFIRM_RADIUS}px`,
          border: '1px solid #D9D9D9',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        <h3
          id="delete-chats-confirm-title"
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: '22px',
            letterSpacing: 0,
            color: '#000000',
            textAlign: 'center',
          }}
        >
          Очистити історію чатів - ви впевнені?
        </h3>
        <p
          id="delete-chats-confirm-description"
          style={{
            margin: '6px 0 0',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '17px',
            letterSpacing: 0,
            color: 'rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
          }}
        >
          Щоб очистити пам&apos;ять із чатів, зайдіть у{' '}
          <span style={{ textDecoration: 'underline' }}>налаштування.</span>
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '15px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              width: `${DELETE_CONFIRM_CANCEL_WIDTH}px`,
              height: `${DELETE_CONFIRM_BUTTON_HEIGHT}px`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              borderRadius: '999px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              color: '#000000',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '15px',
              lineHeight: '21px',
              letterSpacing: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              minWidth: `${DELETE_CONFIRM_PRIMARY_MIN_WIDTH}px`,
              height: `${DELETE_CONFIRM_BUTTON_HEIGHT}px`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 18px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#FF4747',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '15px',
              lineHeight: '21px',
              letterSpacing: 0,
              whiteSpace: 'nowrap',
            }}
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
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(250, 250, 250, 0.68)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxSizing: 'border-box',
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-confirm-title"
        aria-describedby="delete-account-confirm-description"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: `min(${DELETE_ACCOUNT_CONFIRM_WIDTH}px, calc(100% - 48px))`,
          maxHeight: 'calc(100% - 48px)',
          overflowY: 'auto',
          borderRadius: `${DELETE_ACCOUNT_CONFIRM_RADIUS}px`,
          border: '1px solid #D9D9D9',
          backgroundColor: '#FFFFFF',
          boxSizing: 'border-box',
        }}
        className="scrollbar-subtle"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '24px 24px 16px',
            borderBottom: '1px solid #EEEEEE',
          }}
        >
          <h3
            id="delete-account-confirm-title"
            style={{
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '26px',
              letterSpacing: 0,
              color: '#000000',
            }}
          >
            Видалити обліковий запис - ви впевнені?
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити підтвердження видалення облікового запису"
            style={{
              width: '28px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#000000',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div
          id="delete-account-confirm-description"
          style={{
            padding: '18px 24px 0',
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              listStyleType: 'disc',
              listStylePosition: 'outside',
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: 0,
            }}
          >
            <li>Видалення облікового запису є незворотним і його не можна скасувати.</li>
            <li>Ви не зможете створити новий обліковий запис із цією ж електронною адресою.</li>
            <li>
              Ваші дані буде видалено протягом 30 днів, але частина даних може зберігатися довше,
              якщо цього вимагає або дозволяє закон.
            </li>
          </ul>

          <p
            style={{
              margin: '18px 0 0',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: 0,
              color: 'rgba(0, 0, 0, 0.34)',
            }}
          >
            Ви зможете видалити обліковий запис лише якщо входили в нього протягом останніх 10
            хвилин. Увійдіть ще раз, а потім поверніться сюди.
          </p>
        </div>

        <div
          style={{
            marginTop: '22px',
            padding: '14px 24px 22px',
            borderTop: '1px solid #EEEEEE',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            style={{
              width: `${DELETE_ACCOUNT_PRIMARY_WIDTH}px`,
              height: `${DELETE_ACCOUNT_PRIMARY_HEIGHT}px`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
              border: 'none',
              borderRadius: '999px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: 0,
              whiteSpace: 'nowrap',
            }}
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
        <div ref={themeMenuRef} style={{ position: 'relative' }}>
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
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                minWidth: '132px',
                padding: '5px',
                border: '1px solid #DEDEDE',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                zIndex: 5,
              }}
            >
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setTheme(option);
                    setThemeOpen(false);
                    setThemeHovered(false);
                  }}
                  style={{
                    width: '100%',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '0 9px',
                    border: 'none',
                    borderRadius: '9px',
                    backgroundColor: option === theme ? '#F4F4F4' : 'transparent',
                    color: '#171717',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 400,
                    fontSize: '13px',
                    lineHeight: '17px',
                    textAlign: 'left',
                  }}
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
    <main
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(250, 250, 250, 0.62)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxSizing: 'border-box',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Налаштування"
        style={{
          width: '100%',
          maxWidth: `${MODAL_WIDTH}px`,
          minHeight: `${MODAL_HEIGHT}px`,
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `${SIDEBAR_WIDTH}px minmax(0, 1fr)`,
          border: '1px solid #D9D9D9',
          borderRadius: '22px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
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
        <aside
          style={{
            minHeight: `${MODAL_HEIGHT}px`,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#F8F8F8',
            borderRight: '1px solid #ECECEC',
          }}
        >
          <div style={{ padding: '12px 12px 10px' }}>
            <SettingsCloseButton onClick={handleClose} />
          </div>

          <div
            role="tablist"
            aria-orientation="vertical"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              padding: '6px 8px 12px',
            }}
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

        <section
          style={{
            minHeight: `${MODAL_HEIGHT}px`,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div
            style={{
              padding: '18px 18px 0',
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
            }}
            className="scrollbar-subtle"
          >
            <div
              style={{
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #ECECEC',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: '17px',
                  lineHeight: '24px',
                  letterSpacing: 0,
                  color: '#171717',
                }}
              >
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
