'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface WorkspaceSidebarProps {
  className?: string;
}

/**
 * Workspace Sidebar Component - Left navigation panel
 *
 * Figma: node 0:1357 (sidebar)
 * Width: 220px fixed (compact, ChatGPT-like)
 * Contains: Logo, Navigation items, User profile
 */
export function WorkspaceSidebar({ className }: WorkspaceSidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    // Preserved: existing settings handler (wire here if needed)
  };

  const handleReportErrorClick = () => {
    setIsMenuOpen(false);
    // Preserved: existing report error handler (wire here if needed)
  };

  return (
    <aside
      className={className}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '220px',
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
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Logo з Figma (node 70:202) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: '5px',
          }}
        >
          <Image
            src="/images/workspace/logo-figma.svg"
            alt="LEXERY"
            width={32}
            height={32}
            style={{ display: 'block' }}
          />
        </div>

        {/* Блок кнопок: Новий чат, Проєкти, Історія */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* Новий чат, Проєкти, Історія */}
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
                height: '40px',
                padding: '10px 10px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Image src="/images/workspace/new-chat.svg" alt="" width={18} height={18} />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
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
                height: '40px',
                padding: '10px 10px',
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
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
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
                height: '40px',
                padding: '10px 10px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.14px',
                  color: '#3D3D3D',
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
            gap: '0',
            padding: '0',
          }}
        >
          {/* Profile + popup menu (ChatGPT-style) */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            {/* Popup menu — above profile button */}
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '12px',
                  right: '12px',
                  zIndex: 100,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '1px solid #E0E7E8',
                  overflow: 'hidden',
                }}
              >
                {/* User info header */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#E0E0E0',
                    }}
                  >
                    <Image
                      src="/images/workspace/avatar.png"
                      alt=""
                      width={32}
                      height={32}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '0.14px',
                        color: '#000000',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Олександр
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '17px',
                        letterSpacing: '0.12px',
                        color: '#5E5E5E',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      alexlawon@gmail.com
                    </p>
                  </div>
                </div>
                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#E0E7E8' }} />
                {/* Налаштування */}
                <button
                  type="button"
                  onClick={handleSettingsClick}
                  className="transition-colors duration-150 hover:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '0',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                  }}
                >
                  <Image src="/images/workspace/settings.svg" alt="" width={18} height={18} />
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
                    Налаштування
                  </span>
                </button>
                {/* Виникла помилка */}
                <button
                  type="button"
                  onClick={handleReportErrorClick}
                  className="transition-colors duration-150 hover:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '0',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                  }}
                >
                  <Image src="/images/workspace/error.svg" alt="" width={18} height={18} />
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
                    Виникла помилка
                  </span>
                </button>
              </div>
            )}

            {/* Clickable profile button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset"
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                width: '100%',
                padding: '6px 10px',
                border: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                backgroundColor: '#F6F6F6',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F0F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F6F6F6';
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#E0E0E0',
                }}
              >
                <Image
                  src="/images/workspace/avatar.png"
                  alt="User avatar"
                  width={24}
                  height={24}
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0.14px',
                    color: '#000000',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Олександр
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '17px',
                    letterSpacing: '0.12px',
                    color: '#5E5E5E',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  alexlawon@gmail.com
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
