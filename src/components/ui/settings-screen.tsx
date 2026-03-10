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
      },
      {
        id: 'download',
        label: 'Завантажити інформацію облікового запису',
        description: 'Експорт профілю та прив’язаних даних у локальний файл.',
        kind: 'action',
        actionLabel: 'Завантажити',
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

function ActionButton({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      style={{
        minWidth: '92px',
        height: `${CONTROL_HEIGHT}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 12px',
        borderRadius: '999px',
        border: `1px solid ${danger ? '#F19A9A' : '#D7D7D7'}`,
        backgroundColor: '#FFFFFF',
        color: danger ? '#F25555' : '#3A3A3A',
        cursor: 'pointer',
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

  return (
    <div
      style={{
        minHeight: hasDescription ? '80px' : '54px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '16px',
        alignItems: hasDescription ? 'start' : 'center',
        padding: hasDescription ? '12px 0' : '8px 0',
        borderBottom: isLast ? 'none' : '1px solid #ECECEC',
      }}
    >
      <div style={{ minWidth: 0 }}>
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
          alignItems: hasDescription ? 'flex-start' : 'center',
          justifyContent: 'flex-end',
          paddingTop: hasDescription ? '2px' : 0,
          flexShrink: 0,
        }}
      >
        {control}
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

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    router.back();
  };

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
          <ChevronDownIcon />
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

    return <ActionButton danger={row.danger}>{row.actionLabel}</ActionButton>;
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
          display: 'grid',
          gridTemplateColumns: `${SIDEBAR_WIDTH}px minmax(0, 1fr)`,
          border: '1px solid #D9D9D9',
          borderRadius: '22px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
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
