'use client';

export interface MessageContainerProps {
  role: 'user' | 'assistant';
  children: React.ReactNode;
  className?: string;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

/** General message frame: applies user/assistant layout (alignment, direction). */
export function MessageContainer({ role, children, className, innerRef }: MessageContainerProps) {
  if (role === 'user') {
    return (
      <div
        ref={innerRef}
        className={className}
        style={{
          alignSelf: 'flex-end',
          width: 'max-content',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        alignSelf: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
