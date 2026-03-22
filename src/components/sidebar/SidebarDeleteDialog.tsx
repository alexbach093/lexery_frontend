import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import {
  deleteChatLibraryItem,
  DEFAULT_CHAT_USER_ID,
  type ChatLibraryItem,
} from '@/lib/chat-library';
import { cn } from '@/lib/utils';

interface SidebarDeleteDialogProps {
  chat: ChatLibraryItem;
  onClose: () => void;
  onSuccess: (deletedChatId: string) => void;
}

export function SidebarDeleteDialog({ chat, onClose, onSuccess }: SidebarDeleteDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSaving]);

  const handleDeleteConfirm = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await deleteChatLibraryItem(chat.id, DEFAULT_CHAT_USER_ID);
      onSuccess(chat.id);
    } catch {
      setFeedback('Failed to delete chat. Try again.');
      setIsSaving(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="sidebar-delete-chat-title"
      aria-describedby="sidebar-delete-chat-description"
      className="fixed inset-0 z-135 box-border flex items-center justify-center p-6"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-hidden />
      <div
        className="relative box-border w-full max-w-109 rounded-[28px] border border-[#D9D9D9] bg-white px-6 pt-7 pb-5.5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="sidebar-delete-chat-title"
          className="m-0 text-center font-sans text-base font-bold text-black"
        >
          Видалити чат - ви впевнені?
        </h2>
        <p
          id="sidebar-delete-chat-description"
          className="mt-1.5 px-2 text-center font-sans text-xs text-black/40 sm:px-6"
        >
          Ви дійсно хочете видалити чат
          <span className="mt-1 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-black/40">
            &quot;{chat.title}&quot;?
          </span>
        </p>
        {feedback && (
          <p className="mt-2 text-center font-sans text-xs text-[#E14D4D]">{feedback}</p>
        )}
        <div
          className={cn('flex items-center justify-center gap-2.5', feedback ? 'mt-3' : 'mt-3.75')}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10.5 cursor-pointer rounded-full border border-black/10 bg-white px-6.5 font-sans text-[15px] text-black transition-colors duration-150 hover:bg-gray-50 disabled:cursor-default"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={() => void handleDeleteConfirm()}
            disabled={isSaving}
            className={cn(
              'h-10.5 cursor-pointer rounded-full border px-6.5 font-sans text-sm transition-colors duration-150 disabled:cursor-default',
              isSaving
                ? 'border-[#F4CACA] bg-white text-[#F2A4A4]'
                : 'border-[#F19A9A] bg-white text-[#F25555] hover:bg-[#FFF0F0]'
            )}
          >
            {isSaving ? 'Видалення...' : 'Видалити'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
