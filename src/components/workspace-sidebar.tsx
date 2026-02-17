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

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
            height: '40px',
            padding: '10px 12px',
            backgroundColor: '#F4F4F6',
            borderRadius: '4px',
          }}
        >
          <Image src="/images/workspace/search.svg" alt="" width={20} height={20} />
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

        {/* Navigation Items */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* Новий чат */}
          <button
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '44px',
              padding: '12px 15px',
              backgroundColor: '#F4F4F6',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Image src="/images/workspace/new-chat.svg" alt="" width={15} height={15} />
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
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              height: '44px',
              padding: '12px',
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Image src="/images/workspace/projects.svg" alt="" width={20} height={20} />
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
        </div>

        {/* Історія Section */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            height: '18px',
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
          <Image src="/images/workspace/history.svg" alt="" width={4} height={8} />
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
          {/* Bottom Navigation */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '0 16px',
            }}
          >
            {/* Налаштування */}
            <button
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                height: '44px',
                padding: '12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image src="/images/workspace/settings.svg" alt="" width={20} height={20} />
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
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                height: '44px',
                padding: '12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image src="/images/workspace/error.svg" alt="" width={20} height={20} />
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
