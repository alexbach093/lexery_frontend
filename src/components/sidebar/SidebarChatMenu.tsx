import { forwardRef } from 'react';
import { createPortal } from 'react-dom';

import {
  SidebarChatStarIcon,
  SidebarChatPencilIcon,
  SidebarChatTrashIcon,
} from '@/components/icons';
import type { ChatLibraryItem } from '@/lib/chat-library';
import { cn } from '@/lib/utils';

interface SidebarChatMenuProps {
  chat: ChatLibraryItem;
  position: { top: number; left: number };
  onPinToggle: (chat: ChatLibraryItem) => void;
  onRenameClick: (chat: ChatLibraryItem) => void;
  onDeleteClick: (chat: ChatLibraryItem) => void;
}

export const SidebarChatMenu = forwardRef<HTMLDivElement, SidebarChatMenuProps>(
  ({ chat, position, onPinToggle, onRenameClick, onDeleteClick }, ref) => {
    if (typeof document === 'undefined') return null;

    const menuItemClasses =
      'flex min-h-7 w-full cursor-pointer items-center justify-start gap-2 rounded-md border-none px-1.5 py-1 text-left transition-colors duration-150 hover:bg-[#F4F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]';

    return createPortal(
      <div
        ref={ref}
        role="menu"
        aria-orientation="vertical"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        className="fixed z-120 w-36 overflow-hidden rounded-xl border border-[#E0E7E8] bg-white px-1.5 py-1 shadow-sm"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPinToggle(chat);
            }}
            className={menuItemClasses}
          >
            <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
              <SidebarChatStarIcon filled={chat.pinned} className="block h-full w-full shrink-0" />
            </div>
            <span className="mt-px flex-1 truncate font-sans text-xs leading-none font-medium text-[#111827]">
              {chat.pinned ? 'Відкріпити' : 'Закріпити'}
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRenameClick(chat);
            }}
            className={menuItemClasses}
          >
            <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
              <SidebarChatPencilIcon className="block h-full w-full shrink-0" />
            </div>
            <span className="mt-px flex-1 truncate font-sans text-xs leading-none font-medium text-[#111827]">
              Перейменувати
            </span>
          </button>
        </div>
        <div className="my-1 h-px bg-[#E0E7E8]" aria-hidden />
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteClick(chat);
          }}
          className={cn(
            menuItemClasses,
            'mb-0.5 text-[#EF4444] hover:bg-[#FFF3F3] active:bg-[#FFE8E8]'
          )}
        >
          <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
            <SidebarChatTrashIcon className="block h-full w-full shrink-0 overflow-visible" />
          </div>
          <span className="mt-px flex-1 truncate font-sans text-xs leading-none font-medium text-inherit">
            Видалити
          </span>
        </button>
      </div>,
      document.body
    );
  }
);
SidebarChatMenu.displayName = 'SidebarChatMenu';
