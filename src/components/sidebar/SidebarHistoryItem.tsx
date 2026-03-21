import { useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';

import { SidebarChatMoreIcon } from '@/components/icons';
import type { ChatLibraryItem } from '@/lib/chat-library';
import { cn } from '@/lib/utils';

interface SidebarHistoryItemProps {
  chat: ChatLibraryItem;
  isActive: boolean;
  isMenuOpen: boolean;
  onClick: (chatId: string) => void;
  onMenuClick: (chat: ChatLibraryItem, trigger: HTMLElement) => void;
}

export function SidebarHistoryItem({
  chat,
  isActive,
  isMenuOpen,
  onClick,
  onMenuClick,
}: SidebarHistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const showMenuButton = isHovered || isMenuOpen;

  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onMenuClick(chat, event.currentTarget);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(chat.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'relative isolate flex min-h-8 w-full cursor-pointer items-center justify-start rounded-lg border-none py-1.5 pr-4 pl-3 text-left transition-colors duration-150',
        'before:pointer-events-none before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:rounded-lg before:bg-transparent before:transition-colors before:duration-150 hover:before:bg-[#F4F4F6] focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset',
        'group',
        isActive && 'bg-[#F4F4F6]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={() => onClick(chat.id)}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          'min-w-0 flex-1 transition-[padding] duration-150 ease-in-out',
          showMenuButton ? 'pr-7' : ''
        )}
      >
        <p className="truncate font-sans text-sm font-medium tracking-[0.14px] text-black">
          {chat.title.length > 40 ? `${chat.title.slice(0, 40)}…` : chat.title}
        </p>
      </div>

      <div
        className={cn(
          'absolute top-1/2 right-2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center transition-opacity duration-150',
          showMenuButton ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <button
          type="button"
          aria-label="Chat settings"
          onClick={handleMenuClick}
          className={cn(
            'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none focus-visible:ring-inset',
            isMenuOpen
              ? 'bg-[#F4F4F6] text-black'
              : 'bg-transparent text-[#6B7280] hover:text-black'
          )}
        >
          <SidebarChatMoreIcon className="block h-6 w-6 shrink-0" />
        </button>
      </div>
    </div>
  );
}
