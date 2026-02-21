'use client';

import Image from 'next/image';

interface WorkspaceSidebarProps {
  className?: string;
}

/**
 * Workspace Sidebar Component - Left navigation panel
 *
 * Figma: node 0:1357 (sidebar)
 * Width: 260px fixed
 * Contains: Logo, Search, Navigation items, User profile
 */
export function WorkspaceSidebar({ className }: WorkspaceSidebarProps) {
  return (
    <aside
      className={className}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '260px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #E0E7E8',
      }}
    >
      {/* Top Section */}
      <div
        style={{
          padding: '16px 15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            gap: '11px',
            alignItems: 'center',
          }}
        >
          <Image
            src="/images/workspace/logo.svg"
            alt="LEXERY Logo"
            width={42}
            height={40}
            style={{ display: 'block' }}
          />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '22.4px',
              letterSpacing: '0.16px',
              color: '#000000',
            }}
          >
            LEXERY
          </p>
        </div>

        {/* Пошук, потім блок кнопок: однакова менша відстань (15px), між кнопками 4px */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '44px',
              padding: '12px 15px',
              backgroundColor: '#F4F4F6',
              borderRadius: '4px',
            }}
          >
            <Image src="/images/workspace/search.svg" alt="" width={18} height={18} />
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '19.6px',
                letterSpacing: '0.14px',
                color: '#7E7E7E',
              }}
            >
              Пошук
            </p>
          </div>

          {/* Новий чат, Проєкти, Історія — 4px між собою */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {/* Новий чат */}
            <button
              className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                height: '44px',
                padding: '12px 15px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image src="/images/workspace/new-chat.svg" alt="" width={17} height={17} />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '19.6px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                }}
              >
                Новий чат
              </p>
            </button>

            {/* Проєкти */}
            <button
              className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                height: '44px',
                padding: '12px 15px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image src="/images/workspace/projects.svg" alt="" width={18} height={18} />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '19.6px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                }}
              >
                Проєкти
              </p>
            </button>

            {/* Історія */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                height: '44px',
                padding: '12px 15px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '17.107px',
                  letterSpacing: '0.14px',
                  color: '#5E5E5E',
                }}
              >
                Історія
              </p>
              <Image src="/images/workspace/history.svg" alt="" width={6} height={10} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Push to bottom */}
      <div style={{ marginTop: 'auto' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '0',
          }}
        >
          {/* Bottom Navigation — 4px між кнопками */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '0 15px',
            }}
          >
            {/* Налаштування */}
            <button
              className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                height: '44px',
                padding: '12px 15px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image src="/images/workspace/settings.svg" alt="" width={18} height={18} />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '19.6px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                }}
              >
                Налаштування
              </p>
            </button>

            {/* Виникла помилка */}
            <button
              className="transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                height: '44px',
                padding: '12px 15px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image src="/images/workspace/error.svg" alt="" width={18} height={18} />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '19.6px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                }}
              >
                Виникла помилка
              </p>
            </button>
          </div>

          {/* User Profile */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '76px',
              padding: '16px',
              backgroundColor: '#F6F6F6',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: '#E0E0E0',
              }}
            >
              <Image
                src="/images/workspace/avatar.png"
                alt="User avatar"
                width={44}
                height={44}
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '19.6px',
                  letterSpacing: '0.14px',
                  color: '#000000',
                  marginBottom: '2px',
                }}
              >
                Олександр
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '16.8px',
                  letterSpacing: '0.12px',
                  color: '#7C7B84',
                }}
              >
                alexlawon@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
