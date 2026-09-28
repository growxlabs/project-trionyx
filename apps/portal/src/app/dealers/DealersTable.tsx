'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DealerWithRelations, SafeUser, DealerStatus } from '@trionyx/types';
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

export function DealersTable({ initialDealers, totalCount, distributors, user }: DealersTableProps) {
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
    { label: 'ACTIVE DEALERS', value: activeCount, tone: 'positive' },
    {
      label: 'UNASSIGNED',
      value: unassignedCount,
      tone: unassignedCount > 0 ? 'alert' : 'default',
    },
    {
      label: 'INACTIVE / SUSPENDED',
      value: inactiveCount,
      tone: inactiveCount > 0 ? 'alert' : 'default',
    },
    { label: 'TOTAL NETWORK', value: totalNetworkCount, tone: 'default' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header with Primary Action */}
      <WorkspaceHeader
        title="Dealers"
        action={
          <div className="flex items-center gap-3">
            <span className="text-[12.5px] font-mono text-[var(--text-muted)]">
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

      {/* 3. Attention Queue: Unassigned or Flagged Dealers */}
      {canManage && unassignedCount > 0 && (
        <section aria-labelledby="attention-dealers-heading" className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="attention-dealers-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--status-warning)] m-0">
              UNASSIGNED DEALERS ({unassignedCount})
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[4px] bg-[var(--surface-subtle)]">
            {unassignedDealers.slice(0, 3).map((d) => (
              <div key={d.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11.5px] text-[var(--text-muted)]">{d.dealerCode}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{d.businessName}</span>
                    <span className="text-[12px] text-[var(--text-secondary)]">· {d.city}, {d.state}</span>
                  </div>
                  <div className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    Contact: {d.contactPerson} ({d.phone})
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dealers/${d.id}`}
                    className="text-[12px] font-semibold text-[var(--accent)] hover:underline"
                  >
                    Assign Distributor →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Regional Coverage Strip */}
      {stateCounts.length > 0 && (
        <section aria-labelledby="regional-coverage-heading" className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="regional-coverage-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] m-0">
              REGIONAL COVERAGE ({stateCounts.length} STATES / TERRITORIES)
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {stateCounts.map(([st, count]) => {
              const isSelected = stateFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStateFilter(isSelected ? 'ALL' : st)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] text-[12px] font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  <span>{st}</span>
                  <span className={`text-[10.5px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-[var(--surface-raised)] text-[var(--text-muted)]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
            {stateFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setStateFilter('ALL')}
                className="text-[11.5px] text-[var(--accent)] hover:underline px-2 py-1 cursor-pointer"
              >
                Clear state filter
              </button>
            )}
          </div>
        </section>
      )}

      {/* 5. Dealer Registry */}
      <section aria-labelledby="dealer-registry-heading">
        <h2 id="dealer-registry-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">
          DEALER REGISTRY
        </h2>

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
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
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
                    <tr key={dl.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-2.5 px-4 font-mono font-semibold text-[12px] text-[var(--text-primary)]">
                        <Link href={`/dealers/${dl.id}`} className="hover:text-[var(--accent)] hover:underline">
                          {dl.dealerCode}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4">
                        <Link
                          href={`/dealers/${dl.id}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] block"
                        >
                          {dl.businessName}
                        </Link>
                        {dl.legalName && dl.legalName !== dl.businessName && (
                          <span className="text-[11px] text-[var(--text-muted)] block">
                            {dl.legalName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                        <div className="font-medium text-[var(--text-primary)]">{dl.contactPerson}</div>
                        <div className="text-[11.5px] text-[var(--text-muted)]">{dl.phone}</div>
                      </td>
                      <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                        <div>{dl.city}</div>
                        <div className="text-[11.5px] text-[var(--text-muted)]">{dl.state}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        {dl.distributor ? (
                          <div>
                            <Link
                              href={`/distributors/${dl.distributor.id}`}
                              className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] text-[12.5px]"
                            >
                              {dl.distributor.businessName}
                            </Link>
                            <span className="text-[11px] font-mono text-[var(--text-muted)] block">
                              {dl.distributor.distributorCode}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
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
                            className="text-[12px] font-semibold text-[var(--accent)] hover:underline"
                          >
                            View →
                          </Link>
                          {canManage && (
                            <Link
                              href={`/dealers/${dl.id}/edit`}
                              className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
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
    </div>
  );
}
