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

export const SIDEBAR_CHAT_MENU_WIDTH = 160;
export const SIDEBAR_CHAT_MENU_HEIGHT = 118;

export const SidebarChatMenu = forwardRef<HTMLDivElement, SidebarChatMenuProps>(
  ({ chat, position, onPinToggle, onRenameClick, onDeleteClick }, ref) => {
    if (typeof document === 'undefined') return null;

    const menuItemClasses =
      'absolute left-2 right-2 flex h-7 items-center gap-2 rounded-[9px] px-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5D5D5D]';
    const menuItemLabelClasses =
      'min-w-0 truncate font-sans text-[13px] leading-[17px] font-medium tracking-[-0.13px] text-inherit';

    return createPortal(
      <div
        ref={ref}
        role="menu"
        aria-orientation="vertical"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        className="fixed z-120 h-[118px] w-40 overflow-hidden rounded-[16px] border border-[#E5E5E5] bg-white"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPinToggle(chat);
          }}
          className={cn(
            menuItemClasses,
            'top-[7px] text-black hover:bg-[#F4F4F4] active:bg-[#EEEEEE]'
          )}
        >
          <div className="flex h-[15px] w-[15px] shrink-0 items-center justify-center">
            <SidebarChatStarIcon filled={chat.pinned} className="block h-full w-full shrink-0" />
          </div>
          <span className={menuItemLabelClasses}>{chat.pinned ? 'Відкріпити' : 'Закріпити'}</span>
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRenameClick(chat);
          }}
          className={cn(
            menuItemClasses,
            'top-[35px] text-black hover:bg-[#F4F4F4] active:bg-[#EEEEEE]'
          )}
        >
          <div className="flex h-[15px] w-[15px] shrink-0 items-center justify-center">
            <SidebarChatPencilIcon className="block h-full w-full shrink-0" />
          </div>
          <span className={menuItemLabelClasses}>Перейменувати</span>
        </button>
        <div className="absolute inset-x-2 top-[72px] h-px bg-[#E5E5E5]" aria-hidden />
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
            'top-[80px] text-[#FF4747] hover:bg-[#FFF3F3] active:bg-[#FFE8E8]'
          )}
        >
          <div className="flex h-[15px] w-[15px] shrink-0 items-center justify-center">
            <SidebarChatTrashIcon className="block h-[14px] w-[14px] shrink-0" />
          </div>
          <span className={menuItemLabelClasses}>Видалити</span>
        </button>
      </div>,
      document.body
    );
  }
);
SidebarChatMenu.displayName = 'SidebarChatMenu';
