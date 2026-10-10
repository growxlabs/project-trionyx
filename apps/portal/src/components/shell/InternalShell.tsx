import React from 'react';
import type { SafeUser, Organization, OrganizationMembership } from '@trionyx/types';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { WorkspaceViewsProvider } from '../workspace';
import { OrgProvider } from './OrgContext';
import { getServerActiveOrg } from '@/lib/serverOrg';

interface InternalShellProps {
  user: SafeUser;
  activeOrg?: Organization;
  memberships?: OrganizationMembership[];
  children: React.ReactNode;
}

export async function InternalShell({ user, activeOrg, memberships, children }: InternalShellProps) {
  let initialActiveOrg = activeOrg;
  let initialMemberships = memberships;

  if (!initialActiveOrg) {
    try {
      const serverOrg = await getServerActiveOrg();
      initialActiveOrg = serverOrg.activeOrg;
      initialMemberships = serverOrg.memberships;
    } catch {
      // Graceful fallback to client-side fetch in OrgProvider if cookie not yet parsed
    }
  }

  return (
    <OrgProvider initialActiveOrg={initialActiveOrg} initialMemberships={initialMemberships}>
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
    </OrgProvider>
  );
}
