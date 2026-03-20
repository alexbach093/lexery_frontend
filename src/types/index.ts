export interface ChatSession {
  id: string;
  title?: string;
}

export interface RecentChatItem {
  id: string;
  title: string;
  createdAt: string;
}

/** Attachment persisted by the tmp chat storage. */
export interface StoredAttachment {
  name: string;
  size: number;
  type: string;
  blob: Blob | null;
}

/** Attachment shown in chat (file sent by user). previewUrl is blob URL, revoked when message unmounts. */
export interface MessageAttachment {
  name: string;
  size: number;
  previewUrl: string | null;
  /** Runtime-only metadata used to re-persist hydrated attachments back into tmp storage. */
  type?: string;
  /** Runtime-only source blob/file used by the local tmp repository. */
  blob?: Blob | null;
}

/** One version of an assistant response (for version history / regenerate). */
export interface MessageVersion {
  content: string;
  createdAt?: string;
  /** Modifier used when generating this version: preset ("Додай більше деталей", "Зроби відповідь коротшою"), empty for "Спробувати знову", or custom user text. */
  modifier?: string;
}

/** Stored version of an assistant response. */
export interface StoredMessageVersion {
  content: string;
  createdAt?: string;
  modifier?: string;
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

/** Persisted chat message for tmp storage. */
export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggestions?: string[];
  attachments?: StoredAttachment[];
  versions?: StoredMessageVersion[];
  activeVersionIndex?: number;
}

/** Metadata shown in sidebar/search and shared across repository implementations. */
export interface StoredChatSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  userId?: string;
}

/** Full persisted chat session used by the tmp storage layer. */
export interface StoredChatSession extends StoredChatSessionSummary {
  messages: StoredMessage[];
  systemPrompt?: string;
}

export type SectionId = 'general' | 'info' | 'security';
export type SettingKind = 'theme' | 'value' | 'toggle' | 'action';

export type SettingRow = {
  id: string;
  label: string;
  description?: string;
  kind: SettingKind;
  value?: string;
  actionLabel?: string;
  danger?: boolean;
  disabled?: boolean;
};

export type SettingsSection = {
  id: SectionId;
  label: string;
  rows: SettingRow[];
};
