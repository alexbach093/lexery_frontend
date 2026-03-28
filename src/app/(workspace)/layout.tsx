import { Suspense, type ReactNode } from 'react';

import { WorkspaceLayoutClient } from './WorkspaceLayoutClient';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <WorkspaceLayoutClient>{children}</WorkspaceLayoutClient>
    </Suspense>
  );
}
