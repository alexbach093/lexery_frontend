import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import {
  updateChatLibraryItem,
  DEFAULT_CHAT_USER_ID,
  type ChatLibraryItem,
} from '@/lib/chat-library';
import { cn } from '@/lib/utils';

interface SidebarRenameDialogProps {
  chat: ChatLibraryItem;
  onClose: () => void;
  onSuccess: (updatedChat: ChatLibraryItem) => void;
}

export function SidebarRenameDialog({ chat, onClose, onSuccess }: SidebarRenameDialogProps) {
  const [renameValue, setRenameValue] = useState(chat.title);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'error' | 'success' } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSaving]);

  const handleSave = async () => {
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setFeedback({ message: 'Введіть назву чату.', tone: 'error' });
      return;
    }
    if (nextTitle.length < 2) {
      setFeedback({ message: `Мінімум 2 символи.`, tone: 'error' });
      return;
    }
    if (nextTitle.length > 60) {
      setFeedback({ message: `Максимум 60 символів.`, tone: 'error' });
      return;
    }

    setFeedback(null);
    setIsSaving(true);
    try {
      const updatedChat = await updateChatLibraryItem(chat.id, {
        userId: DEFAULT_CHAT_USER_ID,
        title: nextTitle,
      });
      setFeedback({ message: 'Назву збережено.', tone: 'success' });
      setTimeout(() => {
        onSuccess(updatedChat);
      }, 250);
    } catch {
      setFeedback({ message: 'Не вдалося зберегти назву. Спробуйте ще раз.', tone: 'error' });
      setIsSaving(false);
    }
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const isValid = renameValue.trim().length >= 2 && renameValue.trim().length <= 60;
    if (!isSaving && isValid) {
      void handleSave();
    }
  };

  if (typeof document === 'undefined') return null;

  const trimmedLength = renameValue.trim().length;
  const validationMessage =
    trimmedLength === 0
      ? null
      : trimmedLength < 2
        ? `Мінімум 2 символи.`
        : trimmedLength > 60
          ? `Максимум 60 символів.`
          : null;

  const helperMessage =
    feedback?.tone === 'success'
      ? feedback.message
      : (validationMessage ?? feedback?.message ?? `2-60 символів`);
  const helperColor =
    feedback?.tone === 'success'
      ? '#1E8E5A'
      : validationMessage || feedback?.tone === 'error'
        ? '#C03A2B'
        : '#7A7A7A';

  const isValid = trimmedLength >= 2 && trimmedLength <= 60;
  const isSaveDisabled = isSaving || !isValid;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-rename-chat-title"
      className="fixed inset-0 z-130 box-border flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" aria-hidden />
      <div
        className="relative w-full max-w-130 rounded-[26px] border border-[#F1F1F1] bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="sidebar-rename-chat-title"
          className="m-0 font-sans text-xl leading-tight font-semibold text-[#2A2A2A]"
        >
          Перейменувати чат
        </h2>
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(event) => {
            setRenameValue(event.target.value);
            if (feedback?.tone === 'error') setFeedback(null);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter new chat title..."
          className="mt-4 box-border h-11.5 w-full rounded-xl border border-[#D7D7D7] bg-white px-3 font-sans text-sm text-[#2A2A2A] outline-none"
          aria-label="New chat title"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-sans text-xs" style={{ color: helperColor }}>
            {helperMessage}
          </span>
          <span
            className={cn(
              'font-sans text-xs whitespace-nowrap',
              trimmedLength > 60 ? 'text-[#C03A2B]' : 'text-[#9A9A9A]'
            )}
          >
            {trimmedLength}/60
          </span>
        </div>
        <div className="mt-4 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10.5 min-w-25.5 cursor-pointer rounded-lg border border-[#D7D7D7] bg-white font-sans text-sm text-[#2A2A2A] disabled:cursor-default disabled:opacity-70"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaveDisabled}
            className="h-10.5 min-w-31 cursor-pointer rounded-lg border-none font-sans text-sm font-medium text-white disabled:cursor-default disabled:bg-[#8A8A8A]"
            style={{ backgroundColor: isSaveDisabled ? '#8A8A8A' : '#2A2A2A' }}
          >
            {isSaving
              ? 'Збереження...'
              : feedback?.tone === 'success'
                ? 'Збережено'
                : 'Застосувати'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
