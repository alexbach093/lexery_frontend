/** Chat session (placeholder for future use). */
export interface ChatSession {
  id: string;
  title?: string;
}

/** Sidebar history item: minimal metadata for recent chats list (localStorage). */
export interface RecentChatItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  preview?: string;
}
