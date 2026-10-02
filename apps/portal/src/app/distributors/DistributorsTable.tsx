'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DistributorWithRelations, SafeUser } from '@trionyx/types';
import {
  OperationalSummary,
  StatusBadge,
  RegistryToolbar,
  useRegisterWorkspaceViews,
  type WorkspaceViewsConfig,
} from '../../components/workspace';
import { DistributorEmptyState } from './DistributorEmptyState';

interface DistributorsTableProps {
  initialDistributors: DistributorWithRelations[];
  user: SafeUser;
}

export type DistributorsWorkspaceTab = 'registry' | 'hubs';

export function DistributorsTable({ initialDistributors, user }: DistributorsTableProps) {
  const [activeTab, setActiveTab] = useState<DistributorsWorkspaceTab>('registry');
  const [distributors] = useState<DistributorWithRelations[]>(initialDistributors);
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
  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== 'ALL' || stateFilter !== 'ALL';

  const workspaceViews = useMemo<WorkspaceViewsConfig>(
    () => ({
      storageKey: 'trionyx-workspace-distributors',
      activeId: activeTab,
      onSelect: (id: string) => setActiveTab(id as DistributorsWorkspaceTab),
      sections: [
        {
          items: [
            {
              id: 'registry',
              label: 'Distributor Registry',
            },
            {
              id: 'hubs',
              label: 'Logistics Hubs',
            },
          ],
        },
      ],
    }),
    [activeTab]
  );
  useRegisterWorkspaceViews(workspaceViews);

  return (
    <div className="space-y-8">
      {/* 1. Operational Summary + primary action */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <OperationalSummary
          segments={[
            { text: 'Right now we have ' },
            { value: activeCount, tone: 'positive' },
            { text: ' active distributors managing ' },
            { value: managedDealersTotal },
            { text: ' studios across ' },
            { value: territoriesCovered },
            { text: ' territories, with ' },
            { value: inactiveCount, tone: 'warning' },
            { text: ' inactive.' },
          ]}
        />
        {canManage && (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/distributors/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground)] text-[13px] font-semibold transition-opacity shadow-xs"
            >
              + New Distributor
            </Link>
          </div>
        )}
      </div>

      {/* 3. Workspace Stage — view selection lives in the secondary sidebar */}
      <div className="w-full">
          {/* TAB 1: DISTRIBUTOR REGISTRY */}
          {activeTab === 'registry' && (
            <section aria-labelledby="distributor-registry-heading" className="space-y-3">
              {filteredDistributors.length > 0 && (
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                <h2 id="distributor-registry-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0 shrink-0">
                  Distributor Registry
                </h2>
                </div>
                <RegistryToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search code, business name, contact, city, state, territory..."
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
              </div>
              )}

              {/* Working Table */}
              <div className="overflow-hidden">
                {filteredDistributors.length === 0 ? (
                  <DistributorEmptyState
                    kind="registry"
                    title={hasActiveFilters ? 'No matching distributors' : 'No distributors yet'}
                    description={
                      hasActiveFilters
                        ? 'Try a different search or clear your filters.'
                        : 'Add a distributor to start building your network.'
                    }
                    action={
                      hasActiveFilters ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('ALL');
                            setStateFilter('ALL');
                          }}
                          className="text-[12px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                        >
                          Clear filters
                        </button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b border-[var(--border)]/60 text-[12px] font-semibold text-[var(--text-secondary)]">
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
                              <StatusBadge
                                status="ACTIVE"
                                label={`${d.activeDealerCount ?? 0} / ${d.dealerCount ?? 0}`}
                                tone="neutral"
                              />
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
                <DistributorEmptyState kind="hubs" title="No logistics hubs yet" description="Regional hubs will appear here when distributors are added." />
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
      </div>
    </div>
  );
}
