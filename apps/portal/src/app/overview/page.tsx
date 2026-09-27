import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, getInternalOverview, formatRoleLabel, AUTH_CONFIG } from '@trionyx/auth';
import { InternalShell } from '../../components/shell/InternalShell';
import { SummaryCards } from './SummaryCards';
import { RecentActivity } from './RecentActivity';
import { AttentionNeeded } from './AttentionNeeded';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  // Retrieve authoritative overview domain data (persisted audit events, null unbuilt metrics)
  const overviewData = await getInternalOverview(user);

  const roleLabel = formatRoleLabel(user.role);

  const roleBadgeStyles: Record<string, string> = {
    DISTRIBUTOR: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    MANAGING_DIRECTOR: 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
    ADMIN: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    STAFF: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)]',
  };

  const badgeClass =
    roleBadgeStyles[user.role] || 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border-[var(--border)]';

  return (
    <InternalShell user={user}>
      {/* Overview Context Header */}
      <section className="mb-8 pb-6 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)]">
                CONTROL CONSOLE
              </span>
              <span className="text-[var(--text-muted)] text-[11px]">•</span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                STEP 2 SHELL ACTIVE
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] leading-tight m-0">
              Operations Overview
            </h1>
            <p className="text-[13.5px] sm:text-[14px] text-[var(--text-secondary)] mt-1 m-0">
              Signed in as <span className="font-semibold text-[var(--text-primary)]">{user.name}</span> ({user.email})
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-[4px] border text-[11.5px] font-semibold uppercase tracking-wider ${badgeClass}`}
            >
              {roleLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--status-success-soft)] border border-[var(--status-success-border)] text-[var(--status-success)] text-[11.5px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
              {user.status}
            </span>
          </div>
        </div>
      </section>

      {/* 4 Summary Cards (Active Dealers, Orders, Low Stock, Pending Actions) */}
      <SummaryCards summary={overviewData.summary} />

      {/* Main Operations Grid: Recent Activity & Attention Needed */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 cols on desktop) */}
        <div className="lg:col-span-2">
          <RecentActivity activities={overviewData.recentActivity} />
        </div>

        {/* Attention Needed (1 col on desktop) */}
        <div className="lg:col-span-1">
          <AttentionNeeded items={overviewData.attentionItems} />
        </div>
      </section>
    </InternalShell>
  );
}
