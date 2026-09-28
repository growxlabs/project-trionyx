'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DistributorWithRelations, SafeUser } from '@trionyx/types';
import {
  WorkspaceHeader,
  OperationalSummaryStrip,
  StatusBadge,
  RegistryToolbar,
  EmptyOperationalState,
  type SummaryMetric,
} from '../../components/workspace';

interface DistributorsTableProps {
  initialDistributors: DistributorWithRelations[];
  initialTotal: number;
  user: SafeUser;
}

export type DistributorsWorkspaceTab = 'registry' | 'hubs';

export function DistributorsTable({ initialDistributors, initialTotal, user }: DistributorsTableProps) {
  const [activeTab, setActiveTab] = useState<DistributorsWorkspaceTab>('registry');
  const [distributors] = useState<DistributorWithRelations[]>(initialDistributors);
  const totalCount = initialTotal || distributors.length;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Derived metrics
  const activeCount = useMemo(() => distributors.filter((d) => d.status === 'ACTIVE').length, [distributors]);
  const inactiveCount = useMemo(() => distributors.filter((d) => d.status !== 'ACTIVE').length, [distributors]);
  const managedDealersTotal = useMemo(
    () => distributors.reduce((acc, d) => acc + (d.activeDealerCount ?? 0), 0),
    [distributors]
  );
  const territoriesCovered = useMemo(() => {
    const territories = new Set(distributors.map((d) => d.territory || d.state).filter(Boolean));
    return territories.size;
  }, [distributors]);

  // Extract unique states for filter
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(distributors.map((d) => d.state).filter(Boolean))).sort();
  }, [distributors]);

  const filteredDistributors = useMemo(() => {
    return distributors.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (stateFilter !== 'ALL' && d.state.toLowerCase() !== stateFilter.toLowerCase()) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = d.businessName.toLowerCase().includes(q);
        const matchCode = d.distributorCode.toLowerCase().includes(q);
        const matchContact = d.contactPerson.toLowerCase().includes(q);
        const matchPhone = d.phone.includes(q);
        const matchCity = d.city.toLowerCase().includes(q);
        const matchState = d.state.toLowerCase().includes(q);
        const matchTerritory = d.territory ? d.territory.toLowerCase().includes(q) : false;
        return matchName || matchCode || matchContact || matchPhone || matchCity || matchState || matchTerritory;
      }

      return true;
    });
  }, [distributors, search, statusFilter, stateFilter]);

  const summaryMetrics: SummaryMetric[] = [
    { label: 'Active Distributors', value: activeCount, tone: 'positive' },
    { label: 'Managed Dealers', value: managedDealersTotal, tone: 'default' },
    { label: 'Territories Covered', value: territoriesCovered, tone: 'default' },
    {
      label: 'Inactive / Flagged',
      value: inactiveCount,
      tone: inactiveCount > 0 ? 'alert' : 'default',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header with Primary Action */}
      <WorkspaceHeader
        title="Distributors"
        action={
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-normal text-[var(--text-secondary)]">
              {totalCount} distributors
            </span>
            {canManage && (
              <Link
                href="/distributors/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-white text-[13px] font-semibold transition-opacity shadow-xs"
              >
                + New Distributor
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
              {/* 1. Distributor Registry */}
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
                  <span className="truncate">Distributor Registry</span>
                </div>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)] tabular-nums">
                  {distributors.length}
                </span>
              </button>

              {/* 2. Logistics Hubs */}
              <button
                type="button"
                onClick={() => setActiveTab('hubs')}
                className={`w-full text-left px-3 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'hubs'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="truncate">Logistics Hubs</span>
                </div>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)] tabular-nums">
                  {distributors.length}
                </span>
              </button>
            </div>
          </div>

          {/* Operational Counts inside subnav */}
          <div className="pt-3 border-t border-[var(--border)] text-[12px] space-y-1.5 text-[var(--text-secondary)]">
            <div className="flex items-center justify-between">
              <span>Active Hubs</span>
              <span className="font-semibold text-[var(--status-success)] tabular-nums">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Managed Studios</span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">{managedDealersTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Territories</span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">{territoriesCovered}</span>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT FOCUSED WORKSPACE STAGE                            */}
        {/* ======================================================== */}
        <main className="flex-1 w-full min-w-0">
          {/* TAB 1: DISTRIBUTOR REGISTRY */}
          {activeTab === 'registry' && (
            <section aria-labelledby="distributor-registry-heading" className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="9" x2="9" y2="21" />
                </svg>
                <h2 id="distributor-registry-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                  Distributor Registry
                </h2>
                <span className="text-[12px] font-normal text-[var(--text-secondary)]">
                  ({filteredDistributors.length} of {distributors.length} distributors)
                </span>
              </div>

              {/* Compact Registry Toolbar */}
              <RegistryToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search code, business name, contact, city, state, territory..."
                totalCount={totalCount}
                filteredCount={filteredDistributors.length}
                unitLabel="distributors"
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
                  ...(uniqueStates.length > 0
                    ? [
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
                      ]
                    : []),
                ]}
              />

              {/* Working Table */}
              <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
                {filteredDistributors.length === 0 ? (
                  <EmptyOperationalState
                    title="No distributors match current filters"
                    description={
                      search || statusFilter !== 'ALL' || stateFilter !== 'ALL'
                        ? 'Try adjusting your search query or reset active filters.'
                        : 'No distributor organizations are registered in the system.'
                    }
                    action={
                      search || statusFilter !== 'ALL' || stateFilter !== 'ALL' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('ALL');
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
                    <table className="w-full text-left border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                          <th className="py-2.5 px-4 w-36">Distributor Code</th>
                          <th className="py-2.5 px-4">Business Name & Territory</th>
                          <th className="py-2.5 px-4">Contact</th>
                          <th className="py-2.5 px-4">Hub Location</th>
                          <th className="py-2.5 px-4 text-center w-28">Dealers</th>
                          <th className="py-2.5 px-4 w-28">Status</th>
                          <th className="py-2.5 px-4 text-right w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]/60">
                        {filteredDistributors.map((d) => (
                          <tr key={d.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                            <td className="py-2.5 px-4 font-mono font-medium text-[12px] text-[var(--text-primary)]">
                              <Link href={`/distributors/${d.id}`} className="hover:text-[var(--accent)] hover:underline">
                                {d.distributorCode}
                              </Link>
                            </td>
                            <td className="py-2.5 px-4">
                              <Link
                                href={`/distributors/${d.id}`}
                                className="font-medium text-[14px] text-[var(--text-primary)] hover:text-[var(--accent)] block"
                              >
                                {d.businessName}
                              </Link>
                              {d.territory && (
                                <span className="text-[12px] text-[var(--text-muted)] block">
                                  Territory: {d.territory}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                              <div className="font-medium text-[14px] text-[var(--text-primary)]">{d.contactPerson}</div>
                              <div className="text-[12px] text-[var(--text-muted)]">{d.phone}</div>
                            </td>
                            <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                              <div className="text-[14px]">{d.city}</div>
                              <div className="text-[12px] text-[var(--text-muted)]">{d.state}</div>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[12px] font-sans font-medium text-[var(--text-primary)]">
                                {d.activeDealerCount ?? 0}
                                <span className="text-[var(--text-muted)] ml-1">/ {d.dealerCount ?? 0}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <StatusBadge status={d.status} />
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <Link
                                  href={`/distributors/${d.id}`}
                                  className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                                >
                                  View →
                                </Link>
                                {canManage && (
                                  <Link
                                    href={`/distributors/${d.id}/edit`}
                                    className="text-[13px] font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
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

          {/* TAB 2: REGIONAL LOGISTICS HUBS */}
          {activeTab === 'hubs' && (
            <section aria-labelledby="territory-hubs-heading" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <h2 id="territory-hubs-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                    Regional Logistics Hubs ({distributors.length})
                  </h2>
                </div>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  {territoriesCovered} territories covered across {uniqueStates.length} states
                </span>
              </div>

              {distributors.length === 0 ? (
                <EmptyOperationalState
                  title="No Logistics Hubs"
                  description="No regional logistics hubs have been registered yet."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {distributors.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] flex flex-col justify-between gap-3 text-[13px]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[12px] text-[var(--text-secondary)] block">{d.distributorCode}</span>
                            <Link
                              href={`/distributors/${d.id}`}
                              className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                            >
                              {d.businessName}
                            </Link>
                          </div>
                          <StatusBadge status={d.status} />
                        </div>
                        <div className="mt-2 text-[12px] text-[var(--text-secondary)] space-y-0.5">
                          {d.territory && (
                            <div>
                              <span className="text-[var(--text-muted)]">Territory:</span>{' '}
                              <span className="font-medium text-[var(--text-primary)]">{d.territory}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-[var(--text-muted)]">Base:</span> {d.city}, {d.state}
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)]">Contact:</span> {d.contactPerson} ({d.phone})
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {d.activeDealerCount ?? 0}
                          </span>
                          <span className="text-[var(--text-secondary)]">active dealers</span>
                        </div>
                        <Link
                          href={`/distributors/${d.id}`}
                          className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                        >
                          View Hub →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
