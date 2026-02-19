/** Single chat message. */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  /** Suggestion pills shown after assistant message (e.g. "Детальніше"). */
  suggestions?: string[];
}
