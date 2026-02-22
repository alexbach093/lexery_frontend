/** Attachment shown in chat (file sent by user). previewUrl is blob URL, revoked when message unmounts. */
export interface MessageAttachment {
  name: string;
  size: number;
  previewUrl: string | null;
}

/** One version of an assistant response (for version history / regenerate). */
export interface MessageVersion {
  content: string;
  createdAt?: string;
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
  /** Assistant only: version history; content = versions[activeVersionIndex].content. */
  versions?: MessageVersion[];
  /** Assistant only: index of the version currently shown. */
  activeVersionIndex?: number;
}
