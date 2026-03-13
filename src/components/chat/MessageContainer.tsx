'use client';

import { cn } from '@/lib/utils';

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
        className={cn('flex w-max max-w-full flex-col items-end gap-2 self-end', className)}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col items-start self-start', className)}>{children}</div>
  );
}
