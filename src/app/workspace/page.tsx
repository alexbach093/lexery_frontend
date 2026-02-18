'use client';

import { AppLayout } from '@/components/layout';
import { WorkspaceMain } from '@/components/workspace-main';

/**
 * Workspace Page - Main application interface (AI space, chats).
 * Uses shared AppLayout (sidebar + main area).
 */
export default function WorkspacePage() {
  return (
    <AppLayout>
      <WorkspaceMain />
    </AppLayout>
  );
}
