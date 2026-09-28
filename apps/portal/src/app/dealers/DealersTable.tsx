'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DealerWithRelations, SafeUser } from '@trionyx/types';
import {
  WorkspaceHeader,
  OperationalSummaryStrip,
  StatusBadge,
  RegistryToolbar,
  EmptyOperationalState,
  type SummaryMetric,
} from '../../components/workspace';

interface DealersTableProps {
  initialDealers: DealerWithRelations[];
  totalCount?: number;
  distributors: Array<{ id: string; distributorCode: string; businessName: string; city: string; state: string }>;
  user: SafeUser;
}

export type DealersWorkspaceTab = 'registry' | 'unassigned' | 'coverage';

export function DealersTable({ initialDealers, totalCount, distributors, user }: DealersTableProps) {
  const [activeTab, setActiveTab] = useState<DealersWorkspaceTab>('registry');
  const [dealers] = useState<DealerWithRelations[]>(initialDealers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [distributorFilter, setDistributorFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Derived metrics
  const activeCount = useMemo(() => dealers.filter((d) => d.status === 'ACTIVE').length, [dealers]);
  const unassignedDealers = useMemo(() => dealers.filter((d) => !d.distributorId), [dealers]);
  const unassignedCount = unassignedDealers.length;
  const inactiveOrSuspended = useMemo(
    () => dealers.filter((d) => d.status === 'INACTIVE' || d.status === 'SUSPENDED'),
    [dealers]
  );
  const inactiveCount = inactiveOrSuspended.length;
  const totalNetworkCount = totalCount ?? dealers.length;

  // Extract unique states for filter and regional coverage
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of dealers) {
      if (d.state) {
        counts[d.state] = (counts[d.state] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [dealers]);

  const uniqueStates = useMemo(() => {
    return stateCounts.map(([st]) => st);
  }, [stateCounts]);

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;

      if (distributorFilter === 'UNASSIGNED') {
        if (d.distributorId) return false;
      } else if (distributorFilter !== 'ALL') {
        if (d.distributorId !== distributorFilter) return false;
      }

      if (stateFilter !== 'ALL' && d.state.toLowerCase() !== stateFilter.toLowerCase()) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = d.businessName.toLowerCase().includes(q);
        const matchCode = d.dealerCode.toLowerCase().includes(q);
        const matchContact = d.contactPerson.toLowerCase().includes(q);
        const matchPhone = d.phone.includes(q);
        const matchCity = d.city.toLowerCase().includes(q);
        const matchState = d.state.toLowerCase().includes(q);
        const matchDst = d.distributor?.businessName.toLowerCase().includes(q) || false;
        return matchName || matchCode || matchContact || matchPhone || matchCity || matchState || matchDst;
      }

      return true;
    });
  }, [dealers, search, statusFilter, distributorFilter, stateFilter]);

  const summaryMetrics: SummaryMetric[] = [
    { label: 'Active Dealers', value: activeCount, tone: 'positive' },
    {
      label: 'Unassigned',
      value: unassignedCount,
      tone: unassignedCount > 0 ? 'alert' : 'default',
    },
    {
      label: 'Inactive / Suspended',
      value: inactiveCount,
      tone: inactiveCount > 0 ? 'alert' : 'default',
    },
    { label: 'Total Network', value: totalNetworkCount, tone: 'default' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header with Primary Action */}
      <WorkspaceHeader
        title="Dealers"
        action={
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-normal text-[var(--text-secondary)]">
              {dealers.length} dealers
            </span>
            {canManage && (
              <Link
                href="/dealers/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-white text-[13px] font-semibold transition-opacity shadow-xs"
              >
                + New Dealer
              </Link>
            )}
          </div>
        }
      />

      {/* 2. Operational Summary Strip */}
      <OperationalSummaryStrip
        metrics={summaryMetrics}
      />

      {/* 3. In-Page Navigation & Workspace Stage */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* ======================================================== */}
        {/* LEFT IN-PAGE NAVIGATION (Operational Index)             */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-64 shrink-0 bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-3 space-y-3">
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Workspace Views
            </div>

            <div className="space-y-1">
              {/* 1. Studio Registry */}
              <button
                type="button"
                onClick={() => setActiveTab('registry')}
                className={`w-full text-left px-3 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'registry'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="9" x2="9" y2="21" />
                  </svg>
                  <span className="truncate">Studio Registry</span>
                </div>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)] tabular-nums">
                  {dealers.length}
                </span>
              </button>

              {/* 2. Unassigned Studios */}
              <button
                type="button"
                onClick={() => setActiveTab('unassigned')}
                className={`w-full text-left px-3 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'unassigned'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--status-warning)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <svg className="w-4 h-4 text-[var(--status-warning)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
                  </svg>
                  <span className="truncate">Unassigned Studios</span>
                </div>
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded-[2px] tabular-nums ${
                    unassignedCount > 0
                      ? 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]'
                  }`}
                >
                  {unassignedCount}
                </span>
              </button>

              {/* 3. Regional Coverage */}
              <button
                type="button"
                onClick={() => setActiveTab('coverage')}
                className={`w-full text-left px-3 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'coverage'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                  </svg>
                  <span className="truncate">Regional Coverage</span>
                </div>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)] tabular-nums">
                  {stateCounts.length}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Summary Counts inside subnav */}
          <div className="pt-3 border-t border-[var(--border)] text-[12px] space-y-1.5 text-[var(--text-secondary)]">
            <div className="flex items-center justify-between">
              <span>Active Studios</span>
              <span className="font-semibold text-[var(--status-success)] tabular-nums">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Unassigned Hubs</span>
              <span className={`font-semibold tabular-nums ${unassignedCount > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--text-primary)]'}`}>
                {unassignedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>States Covered</span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">{stateCounts.length}</span>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT FOCUSED WORKSPACE STAGE                            */}
        {/* ======================================================== */}
        <main className="flex-1 w-full min-w-0">
          {/* TAB 1: STUDIO REGISTRY */}
          {activeTab === 'registry' && (
            <section aria-labelledby="dealer-registry-heading" className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="9" x2="9" y2="21" />
                </svg>
                <h2 id="dealer-registry-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                  Studio Registry
                </h2>
                <span className="text-[12px] font-normal text-[var(--text-secondary)]">
                  ({filteredDealers.length} of {dealers.length} studios)
                </span>
                {stateFilter !== 'ALL' && (
                  <span className="text-[12px] font-medium text-[var(--accent)]">
                    · Filtered by {stateFilter}
                  </span>
                )}
              </div>

              {/* Compact Registry Toolbar */}
              <RegistryToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search code, studio name, contact, city, or phone..."
                totalCount={dealers.length}
                filteredCount={filteredDealers.length}
                unitLabel="dealers"
                filters={[
                  {
                    id: 'status',
                    label: 'Status',
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: [
                      { label: 'All Statuses', value: 'ALL' },
                      { label: `Active (${activeCount})`, value: 'ACTIVE' },
                      { label: 'Inactive', value: 'INACTIVE' },
                      { label: 'Suspended', value: 'SUSPENDED' },
                    ],
                  },
                  ...(user.role !== 'DISTRIBUTOR' && distributors.length > 0
                    ? [
                        {
                          id: 'distributor',
                          label: 'Distributor',
                          value: distributorFilter,
                          onChange: setDistributorFilter,
                          options: [
                            { label: 'All Channels', value: 'ALL' },
                            { label: `Unassigned (${unassignedCount})`, value: 'UNASSIGNED' },
                            ...distributors.map((dst) => ({
                              label: dst.businessName,
                              value: dst.id,
                            })),
                          ],
                        },
                      ]
                    : []),
                  {
                    id: 'state',
                    label: 'State',
                    value: stateFilter,
                    onChange: setStateFilter,
                    options: [
                      { label: 'All States', value: 'ALL' },
                      ...uniqueStates.map((st) => ({ label: st, value: st })),
                    ],
                  },
                ]}
              />

              {/* Working Table */}
              <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
                {filteredDealers.length === 0 ? (
                  <EmptyOperationalState
                    title="No dealers match current filters"
                    description={
                      search || statusFilter !== 'ALL' || distributorFilter !== 'ALL' || stateFilter !== 'ALL'
                        ? 'Try clearing the search or filter controls to view all network records.'
                        : 'No dealer records have been registered in the database yet.'
                    }
                    action={
                      search || statusFilter !== 'ALL' || distributorFilter !== 'ALL' || stateFilter !== 'ALL' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('ALL');
                            setDistributorFilter('ALL');
                            setStateFilter('ALL');
                          }}
                          className="text-[12px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                        >
                          Reset all filters
                        </button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                          <th className="py-2.5 px-4 w-32">Dealer Code</th>
                          <th className="py-2.5 px-4">Studio / Dealer Name</th>
                          <th className="py-2.5 px-4">Contact</th>
                          <th className="py-2.5 px-4">Location</th>
                          <th className="py-2.5 px-4">Assigned Distributor</th>
                          <th className="py-2.5 px-4 w-28">Status</th>
                          <th className="py-2.5 px-4 text-right w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {filteredDealers.map((dl) => (
                          <tr key={dl.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[42px]">
                            <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                              <Link href={`/dealers/${dl.id}`} className="hover:text-[var(--accent)] hover:underline">
                                {dl.dealerCode}
                              </Link>
                            </td>
                            <td className="py-2.5 px-4">
                              <Link
                                href={`/dealers/${dl.id}`}
                                className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)] block"
                              >
                                {dl.businessName}
                              </Link>
                              {dl.legalName && dl.legalName !== dl.businessName && (
                                <span className="text-[12px] text-[var(--text-secondary)] block">
                                  {dl.legalName}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                              <div className="text-[14px] font-normal text-[var(--text-primary)]">{dl.contactPerson}</div>
                              <div className="text-[12px] text-[var(--text-secondary)]">{dl.phone}</div>
                            </td>
                            <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                              <div className="text-[14px] font-normal text-[var(--text-primary)]">{dl.city}</div>
                              <div className="text-[12px] text-[var(--text-secondary)]">{dl.state}</div>
                            </td>
                            <td className="py-2.5 px-4">
                              {dl.distributor ? (
                                <div>
                                  <Link
                                    href={`/distributors/${dl.distributor.id}`}
                                    className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                                  >
                                    {dl.distributor.businessName}
                                  </Link>
                                  <span className="text-[12px] font-mono text-[var(--text-secondary)] block">
                                    {dl.distributor.distributorCode}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4">
                              <StatusBadge status={dl.status} />
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <Link
                                  href={`/dealers/${dl.id}`}
                                  className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                                >
                                  View →
                                </Link>
                                {canManage && (
                                  <Link
                                    href={`/dealers/${dl.id}/edit`}
                                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                                  >
                                    Edit
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 2: UNASSIGNED STUDIOS */}
          {activeTab === 'unassigned' && (
            <section aria-labelledby="attention-dealers-heading" className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--status-warning)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
                  </svg>
                  <h2 id="attention-dealers-heading" className="text-[14px] font-semibold text-[var(--status-warning)] m-0">
                    Unassigned Studios ({unassignedCount})
                  </h2>
                </div>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  Studios requiring regional distributor routing
                </span>
              </div>

              {unassignedCount === 0 ? (
                <div className="py-8 text-center text-[var(--text-secondary)] text-[13px]">
                  All authorized detailing studios are assigned to active regional distributor hubs.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[4px] bg-[var(--surface-subtle)]">
                  {unassignedDealers.map((d) => (
                    <div key={d.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] hover:bg-[var(--surface-raised)] transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] text-[var(--text-secondary)]">{d.dealerCode}</span>
                          <Link href={`/dealers/${d.id}`} className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)]">
                            {d.businessName}
                          </Link>
                          <span className="text-[13px] text-[var(--text-secondary)]">· {d.city}, {d.state}</span>
                        </div>
                        <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          Contact: {d.contactPerson} ({d.phone})
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/dealers/${d.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[12.5px] font-medium text-[var(--accent)] hover:underline"
                        >
                          <span>Assign Distributor →</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: REGIONAL COVERAGE */}
          {activeTab === 'coverage' && (
            <section aria-labelledby="regional-coverage-heading" className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                  </svg>
                  <h2 id="regional-coverage-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                    Regional Coverage ({stateCounts.length} states / territories)
                  </h2>
                </div>
                {stateFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setStateFilter('ALL')}
                    className="text-[12px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Clear Selected State ({stateFilter})
                  </button>
                )}
              </div>

              <p className="text-[13px] text-[var(--text-secondary)] m-0">
                Select any state below to filter the studio registry.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stateCounts.map(([st, count]) => {
                  const isSelected = stateFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStateFilter(isSelected ? 'ALL' : st);
                        setActiveTab('registry');
                      }}
                      className={`p-3.5 rounded-[4px] border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--surface-subtle)] ring-1 ring-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[14px] text-[var(--text-primary)]">
                          {st}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {count} {count === 1 ? 'studio' : 'studios'}
                        </span>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-[12px] font-medium text-[var(--accent)]">
                          Filter in Registry →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
