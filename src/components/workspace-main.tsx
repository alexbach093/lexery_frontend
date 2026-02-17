'use client';

import Image from 'next/image';

interface WorkspaceMainProps {
  className?: string;
}

/**
 * Workspace Main Content - AI Chat Interface
 *
 * Figma: node 0:1339 (AI box)
 * Contains: Greeting, Chat input, Action buttons
 */
export function WorkspaceMain({ className }: WorkspaceMainProps) {
  return (
    <main
      className={className}
      style={{
        marginLeft: '260px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top Bar - Поради Button */}
      <div
        style={{
          position: 'absolute',
          top: '29px',
          right: '28px',
        }}
      >
        <button
          style={{
            display: 'flex',
            gap: '9px',
            alignItems: 'center',
            justifyContent: 'center',
            height: '33px',
            padding: '7px 12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E7E8',
            borderRadius: '5px',
            cursor: 'pointer',
            minWidth: '90px',
          }}
        >
          <Image src="/images/workspace/tips.svg" alt="" width={10} height={15} />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '11.941px',
              lineHeight: '16.718px',
              letterSpacing: '0.1194px',
              color: '#040404',
            }}
          >
            Поради
          </p>
        </button>
      </div>

      {/* Center Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '0 20px',
        }}
      >
        {/* Greeting */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '22.587px',
            lineHeight: 'normal',
            color: '#000000',
            textAlign: 'center',
            marginBottom: '38px',
          }}
        >
          Доброго ранку, Олександре!
        </p>

        {/* Chat Input Container */}
        <div
          style={{
            width: '693px',
            maxWidth: '100%',
            position: 'relative',
          }}
        >
          {/* Input Box */}
          <div
            style={{
              position: 'relative',
              backgroundColor: '#F6F6F6',
              borderRadius: '15px',
              height: '151px',
              padding: '18px 22px',
            }}
          >
            <textarea
              placeholder="Запитайте будь-що"
              style={{
                width: '100%',
                height: 'calc(100% - 49px)',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '19.6px',
                letterSpacing: '0.14px',
                color: '#8C8C8C',
                resize: 'none',
              }}
            />

            {/* Bottom Actions - Inside the gray box */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '15px',
                right: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Left Actions - Attachment buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#EDEDED',
                  borderRadius: '9px',
                  height: '31px',
                  padding: '9px 17px',
                  minWidth: '136px',
                }}
              >
                <Image
                  src="/images/workspace/attachments.svg"
                  alt="Attachments"
                  width={104}
                  height={13}
                  style={{ display: 'block' }}
                />
              </div>

              {/* Right Action - Send Button */}
              <button
                style={{
                  width: '37px',
                  height: '37px',
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  flexShrink: 0,
                }}
                aria-label="Send message"
              >
                <Image
                  src="/images/workspace/send-button.svg"
                  alt="Send"
                  width={37}
                  height={37}
                  style={{ display: 'block' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default WorkspaceMain;
