'use client';

import { WorkspaceMain } from '@/components/workspace-main';
import { WorkspaceSidebar } from '@/components/workspace-sidebar';

/**
 * Workspace Page - Main application interface
 *
 * Figma: node 0:1335 (workspace main open sidebar)
 * Layout: Sidebar (260px) + Main content
 */
export default function WorkspacePage() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
    >
      <WorkspaceSidebar />
      <WorkspaceMain />
    </div>
  );
}
