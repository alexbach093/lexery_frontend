/** Attachment shown in chat (file sent by user). previewUrl is blob URL, revoked when message unmounts. */
export interface MessageAttachment {
  name: string;
  size: number;
  previewUrl: string | null;
}

/** Single chat message. */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  /** Suggestion pills shown after assistant message (e.g. "Детальніше"). */
  suggestions?: string[];
  /** User message: attached files (thumbnail + name in chat). */
  attachments?: MessageAttachment[];
}
