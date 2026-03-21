import type { AttachedFile } from '@/features/attachments';
import type { Message, MessageAttachment, MessageVersion, StoredMessage } from '@/types';

import { HISTORY_TITLE_MAX_LENGTH, ASSISTANT_SUGGESTIONS } from './constants';

export type ApiMessage = { role: 'user' | 'assistant'; content: string };

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function buildHistoryTitle(text: string): string {
  const raw = text.trim();
  if (!raw) return 'Новий чат';
  return (
    raw.slice(0, HISTORY_TITLE_MAX_LENGTH) + (raw.length > HISTORY_TITLE_MAX_LENGTH ? '…' : '')
  );
}

export function buildMessageAttachments(files: AttachedFile[]): MessageAttachment[] | undefined {
  if (files.length === 0) return undefined;

  return files.map((item) => ({
    name: item.file.name,
    size: item.file.size,
    previewUrl:
      item.file.type.startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/i.test(item.file.name)
        ? URL.createObjectURL(item.file)
        : null,
    type: item.file.type,
    blob: item.file,
  }));
}

export function hasPendingAssistantResponse(
  messages: Pick<StoredMessage, 'role' | 'content'>[]
): boolean {
  const lastMessage = messages[messages.length - 1];
  return Boolean(lastMessage?.role === 'assistant' && !lastMessage.content.trim());
}

export function finalizeAssistantMessage(
  message: Message,
  options: {
    content: string;
    modifier?: string;
    appendVersion?: boolean;
    includeSuggestions?: boolean;
  }
): Message {
  const createdAt = new Date().toISOString();
  const nextVersion: MessageVersion = {
    content: options.content,
    createdAt,
    modifier: options.modifier,
  };
  const existingVersions =
    message.versions?.length && options.appendVersion
      ? message.versions.map((version) => ({ ...version }))
      : options.appendVersion && message.content.trim()
        ? [{ content: message.content, createdAt }]
        : [];
  const versions = options.appendVersion ? [...existingVersions, nextVersion] : [nextVersion];

  return {
    ...message,
    content: options.content,
    versions,
    activeVersionIndex: versions.length - 1,
    suggestions: options.includeSuggestions ? [...ASSISTANT_SUGGESTIONS] : message.suggestions,
  };
}
