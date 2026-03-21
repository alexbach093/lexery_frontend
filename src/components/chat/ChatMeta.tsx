'use client';

import { TipsIcon, ExternalLinkIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface ChatMetaProps {
  hasMessages: boolean;
  compact: boolean;
}

/** Top bar: Tips button (full or compact). */
export function ChatMeta({ hasMessages, compact }: ChatMetaProps) {
  // Shared base classes for the tips buttons
  const baseBtnClasses =
    'box-border flex cursor-default items-center rounded-[5px] border border-[#E0E7E8] bg-white opacity-100';
  const fullBtnClasses = 'min-h-[33px] min-w-[90px] justify-start gap-2.5 p-2.5 text-[#9A9A9A]';
  const compactBtnClasses = 'h-10 w-10 justify-center p-0';

  return (
    <div className="absolute top-7.25 right-7">
      {!hasMessages ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={cn(baseBtnClasses, fullBtnClasses)}
          aria-label="Поради"
        >
          <TipsIcon width={18} height={18} className="block shrink-0" aria-hidden="true" />
          <p className="m-0 font-sans text-sm leading-5 font-medium tracking-[0.14px] text-[#9A9A9A]">
            Поради
          </p>
        </button>
      ) : compact ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={cn(baseBtnClasses, compactBtnClasses)}
          aria-label="Поради"
        >
          <ExternalLinkIcon
            width={32}
            height={32}
            className="block text-[#9A9A9A]"
            aria-hidden="true"
          />
        </button>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={cn(baseBtnClasses, fullBtnClasses)}
          aria-label="Поради"
        >
          <ExternalLinkIcon
            width={32}
            height={32}
            className="block text-[#9A9A9A]"
            aria-hidden="true"
          />
          <p className="m-0 font-sans text-sm leading-5 font-medium tracking-[0.14px] text-[#9A9A9A]">
            Поради
          </p>
        </button>
      )}
    </div>
  );
}
