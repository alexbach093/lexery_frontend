'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';

import {
  SettingsNavGearIcon,
  SettingsNavDatabaseIcon,
  SettingsNavShieldIcon,
} from '@/components/ui/settings-nav-icons';

const CARD_MAX_WIDTH = 820;
/** Мінімальна висота картки: ширше і нижче за пропорціями. */
const CARD_MIN_HEIGHT = 480;
/** Мінімальна висота блоку контенту. */
const CONTENT_BLOCK_MIN_HEIGHT = 300;

const THEME_OPTIONS = ['Системна', 'Темна', 'Світла'] as const;
type ThemeOption = (typeof THEME_OPTIONS)[number];

type SectionId = 'general' | 'info' | 'security';

type SectionItem = {
  id: SectionId;
  label: string;
};

const SECTIONS: SectionItem[] = [
  { id: 'general', label: 'Загальні' },
  { id: 'info', label: 'Інформація' },
  { id: 'security', label: 'Безпека' },
];

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      style={{
        width: '32px',
        height: '18px',
        borderRadius: '999px',
        border: 'none',
        padding: '2px',
        cursor: 'pointer',
        backgroundColor: checked ? '#000000' : '#D9D9D9',
        transition: 'background-color 150ms ease',
        position: 'relative',
      }}
    >
      <span
        style={{
          display: 'block',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          transform: checked ? 'translateX(14px)' : 'translateX(0)',
          transition: 'transform 150ms ease',
        }}
      />
    </button>
  );
}

function SideNavButton({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 16px 6px 12px',
        minHeight: '32px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: active ? '#F2F2F2' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          color: '#000000',
          display: 'inline-flex',
          flexShrink: 0,
          width: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
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
          color: '#000000',
        }}
      >
        {label}
      </span>
    </button>
  );
}

function ActionOutlineButton({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      style={{
        minWidth: '76px',
        height: '32px',
        padding: '0 12px',
        borderRadius: '999px',
        border: `1px solid ${danger ? '#FF4747' : '#E0E0E0'}`,
        backgroundColor: '#FFFFFF',
        color: danger ? '#FF4747' : '#2A2A2A',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0.14px',
      }}
    >
      {children}
    </button>
  );
}

function Row({
  label,
  description,
  control,
  hideTopBorder: _hideTopBorder,
  hideBottomBorder,
  controlStyle,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  hideTopBorder?: boolean;
  hideBottomBorder?: boolean;
  /** Додатковий стиль для контейнера контрола (наприклад, змістити вимикач ліворуч). */
  controlStyle?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        minHeight: '52px',
        display: 'flex',
        alignItems: description ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: '20px',
        padding: description ? '10px 0 8px' : '6px 0',
        borderBottom: hideBottomBorder ? 'none' : '1px solid #ECECEC',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '0.14px',
            color: '#000000',
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              marginTop: '4px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              letterSpacing: '0.08px',
              color: '#7A7A7A',
              maxWidth: '360px',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          ...(description ? { alignSelf: 'center' as const } : {}),
          ...controlStyle,
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
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  const sectionIcons = useMemo(
    () => ({
      general: <SettingsNavGearIcon />,
      info: <SettingsNavDatabaseIcon />,
      security: <SettingsNavShieldIcon />,
    }),
    []
  );

  const sectionContent =
    activeSection === 'general' ? (
      <>
        <Row
          label="Тема"
          hideTopBorder
          control={
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setThemeOpen((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                }}
              >
                <span>{theme}</span>
                <ChevronDownIcon />
              </button>

              {themeOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '120px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    padding: '8px 10px',
                    boxSizing: 'border-box',
                    zIndex: 2,
                  }}
                >
                  {THEME_OPTIONS.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setTheme(option);
                        setThemeOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: index === 0 ? '0 0 8px' : '8px 0 0',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        letterSpacing: '0.08px',
                        color: option === theme ? '#000000' : '#7A7A7A',
                        textAlign: 'left',
                      }}
                    >
                      <span>{option}</span>
                      {option === theme && (
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
                          <path
                            d="M4.5 10.5L8 14L15.5 6.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />

        <Row label="Мова" control={<span style={valueTextStyle}>Українська</span>} />

        <Row
          label="Збереження пам’яті"
          description="Дозволяє Lexery зберігати і використовувати чати для кращих відповідей"
          control={
            <Toggle checked={memoryEnabled} onChange={() => setMemoryEnabled((prev) => !prev)} />
          }
          controlStyle={{ marginRight: '20px' }}
        />

        <Row
          label="Видалити всі чати"
          control={<ActionOutlineButton danger>Видалити</ActionOutlineButton>}
        />

        <Row
          label="Вийти з акаунту"
          hideBottomBorder
          control={<ActionOutlineButton>Вийти</ActionOutlineButton>}
        />
      </>
    ) : activeSection === 'info' ? (
      <>
        <Row
          label="Поширені чати"
          hideTopBorder
          control={<ActionOutlineButton>Переглянути</ActionOutlineButton>}
        />
        <Row
          label="Видалити обліковий запис"
          control={<ActionOutlineButton danger>Видалити</ActionOutlineButton>}
        />
        <Row
          label="Завантажити інформацію облікового запису"
          hideBottomBorder
          control={<ActionOutlineButton>Завантажити</ActionOutlineButton>}
        />
      </>
    ) : (
      <>
        <Row
          label="Мультифакторна автентифікація"
          hideTopBorder
          control={<ActionOutlineButton>Підключити</ActionOutlineButton>}
        />
        <Row
          label="Вийти з усіх пристроїв"
          hideBottomBorder
          control={<ActionOutlineButton danger>Видалити</ActionOutlineButton>}
        />
      </>
    );

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
        boxSizing: 'border-box',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Налаштування"
        style={{
          width: '100%',
          maxWidth: `${CARD_MAX_WIDTH}px`,
          minHeight: `${CARD_MIN_HEIGHT}px`,
          margin: '0 24px',
          border: '1px solid #EAEAEA',
          borderRadius: '26px',
          backgroundColor: '#FFFFFF',
          padding: '20px 34px 28px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '20px',
              letterSpacing: '0.02em',
              color: '#000000',
            }}
          >
            Налаштування
          </h1>
          <button
            type="button"
            onClick={() => (onClose ? onClose() : router.back())}
            aria-label="Закрити налаштування"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              padding: 0,
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#000000',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '184px 1px minmax(0, 1fr)',
            gap: 0,
            alignItems: 'stretch',
            minHeight: `${CONTENT_BLOCK_MIN_HEIGHT}px`,
            marginTop: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              paddingRight: '24px',
            }}
          >
            {SECTIONS.map((section) => (
              <SideNavButton
                key={section.id}
                label={section.label}
                active={activeSection === section.id}
                icon={sectionIcons[section.id]}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </div>

          <div
            style={{
              width: '1px',
              backgroundColor: '#ECECEC',
              alignSelf: 'stretch',
            }}
            aria-hidden
          />

          <div style={{ paddingLeft: '24px' }}>{sectionContent}</div>
        </div>
      </div>
    </main>
  );
}

const valueTextStyle: CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: '0.14px',
  color: '#000000',
};

export default SettingsScreen;
