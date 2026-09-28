import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, getInternalOverview, AUTH_CONFIG } from '@trionyx/auth';
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
    cookieStore.delete(AUTH_CONFIG.cookieName);
    redirect('/login');
  }

  const { user } = authData;

  // Retrieve authoritative overview domain data (persisted audit events, null unbuilt metrics)
  const overviewData = await getInternalOverview(user);

  return (
    <InternalShell user={user}>
      {/* Overview Context Header */}
      <section className="mb-8 pb-6 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] leading-tight m-0">
              Operations Overview
            </h1>
            <p className="text-[13.5px] sm:text-[14px] text-[var(--text-secondary)] mt-1.5 m-0">
              Signed in as <span className="font-semibold text-[var(--text-primary)]">{user.name}</span> ({user.email})
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--status-success-soft)] border border-[var(--status-success-border)] text-[var(--status-success)] text-[11.5px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
              Active
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
