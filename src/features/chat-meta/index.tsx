'use client';

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
          <svg
            width={18}
            height={18}
            viewBox="0 0 12 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block shrink-0"
            aria-hidden
          >
            <path
              d="M3.26919 16.3462H8.49986M5.88452 0.653846C2.9957 0.653846 0.653846 2.99574 0.653846 5.88462C0.653846 6.94341 0.968422 7.92873 1.50921 8.75221C2.3408 10.0185 2.75624 10.6513 2.81021 10.7458C3.29035 11.587 3.20195 11.2903 3.26237 12.2571C3.26917 12.3657 3.26919 12.5302 3.26919 12.859C3.26919 13.3405 3.65949 13.7308 4.14096 13.7308L7.62808 13.7308C8.10955 13.7308 8.49986 13.3405 8.49986 12.859C8.49986 12.5302 8.49986 12.3657 8.50666 12.2571C8.56708 11.2903 8.47817 11.587 8.95831 10.7458C9.01229 10.6513 9.42843 10.0185 10.26 8.75221C10.8008 7.92873 11.1154 6.94341 11.1154 5.88462C11.1154 2.99574 8.77335 0.653846 5.88452 0.653846Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
          <svg
            width={32}
            height={32}
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block"
            aria-hidden
          >
            <path
              d="M20.25 17.75L26.5 11.5"
              stroke="#9A9A9A"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22.3335 11.5H26.5002V15.6667"
              stroke="#9A9A9A"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26.5 20.6667V24.8333C26.5 25.2754 26.3244 25.6993 26.0118 26.0118C25.6993 26.3244 25.2754 26.5 24.8333 26.5H13.1667C12.7246 26.5 12.3007 26.3244 11.9882 26.0118C11.6756 25.6993 11.5 25.2754 11.5 24.8333V13.1667C11.5 12.7246 11.6756 12.3007 11.9882 11.9882C12.3007 11.6756 12.7246 11.5 13.1667 11.5H17.3333"
              stroke="#9A9A9A"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={cn(baseBtnClasses, fullBtnClasses)}
          aria-label="Поради"
        >
          <svg
            width={32}
            height={32}
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block"
            aria-hidden
          >
            <path
              d="M20.25 17.75L26.5 11.5"
              stroke="#9A9A9A"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22.3335 11.5H26.5002V15.6667"
              stroke="#9A9A9A"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26.5 20.6667V24.8333C26.5 25.2754 26.3244 25.6993 26.0118 26.0118C25.6993 26.3244 25.2754 26.5 24.8333 26.5H13.1667C12.7246 26.5 12.3007 26.3244 11.9882 26.0118C11.6756 25.6993 11.5 25.2754 11.5 24.8333V13.1667C11.5 12.7246 11.6756 12.3007 11.9882 11.9882C12.3007 11.6756 12.7246 11.5 13.1667 11.5H17.3333"
              stroke="#9A9A9A"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="m-0 font-sans text-sm leading-5 font-medium tracking-[0.14px] text-[#9A9A9A]">
            Поради
          </p>
        </button>
      )}
    </div>
  );
}
