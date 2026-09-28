import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';

interface InternalShellProps {
  user: SafeUser;
  children: React.ReactNode;
}

export function InternalShell({ user, children }: InternalShellProps) {
  return (
    <div className="min-h-screen bg-[#171714] text-[var(--text-primary)] flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar user={user} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header + Slide-out Navigation (hidden on desktop) */}
        <MobileNavigation user={user} />

        {/* Desktop Topbar — #22221E charcoal surface */}
        <Topbar user={user} />

        {/* Workbench Canvas — with curved top-left corner meeting the charcoal shell */}
        <div className="flex-1 flex flex-col bg-[var(--background)] lg:rounded-tl-[8px] overflow-hidden min-h-0">
          {/* Main Content Area */}
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-5 w-full">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
