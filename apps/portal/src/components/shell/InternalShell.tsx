import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { WorkspaceViewsProvider } from '../workspace';

interface InternalShellProps {
  user: SafeUser;
  children: React.ReactNode;
}

export function InternalShell({ user, children }: InternalShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar (hidden on mobile) — holds nav + profile */}
      <Sidebar user={user} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header + Slide-out Navigation (hidden on desktop) */}
        <MobileNavigation user={user} />

        {/* Workbench Canvas — secondary sidebar spans the full height */}
        <div className="flex-1 flex flex-col bg-[var(--background)] border-l border-[var(--border)] min-h-0 min-w-0">
          <WorkspaceViewsProvider>{children}</WorkspaceViewsProvider>
        </div>
      </div>
    </div>
  );
}
