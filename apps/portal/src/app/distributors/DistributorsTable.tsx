'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DistributorWithRelations, SafeUser, DistributorStatus } from '@trionyx/types';

interface DistributorsTableProps {
  initialDistributors: DistributorWithRelations[];
  initialTotal: number;
  user: SafeUser;
}

export function DistributorsTable({ initialDistributors, initialTotal, user }: DistributorsTableProps) {
  const [distributors, setDistributors] = useState<DistributorWithRelations[]>(initialDistributors);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Extract unique states for filter dropdown
  const uniqueStates = Array.from(
    new Set(distributors.map((d) => d.state).filter(Boolean))
  ).sort();

  // Filter in-memory for instant feedback
  const filteredDistributors = distributors.filter((d) => {
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
      return matchName || matchCode || matchContact || matchPhone || matchCity || matchState;
    }

    return true;
  });

  const getStatusBadge = (status: DistributorStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]">
            ACTIVE
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
            INACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
            SUSPENDED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <input
              type="text"
              placeholder="Search by code, name, city, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-[var(--surface-raised)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
            />
            <svg
              className="w-4 h-4 text-[var(--text-muted)] absolute left-2.5 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
            </svg>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-[13px] bg-[var(--surface-raised)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {/* State Filter */}
          {uniqueStates.length > 0 && (
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-1.5 text-[13px] bg-[var(--surface-raised)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)]"
            >
              <option value="ALL">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          )}

          {(search || statusFilter !== 'ALL' || stateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setStateFilter('ALL');
              }}
              className="text-[12px] text-[var(--accent-text)] hover:underline px-2 py-1 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/distributors/new"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>New Distributor</span>
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[var(--surface-raised)] border border-[var(--border)] rounded overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-[var(--text-secondary)] font-semibold">
              <th className="py-2.5 px-4">Code</th>
              <th className="py-2.5 px-4">Business Name</th>
              <th className="py-2.5 px-4">Contact Person</th>
              <th className="py-2.5 px-4">Phone / Email</th>
              <th className="py-2.5 px-4">Location</th>
              <th className="py-2.5 px-4 text-center">Dealers</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredDistributors.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[var(--text-muted)]">
                  No distributors match the current filters.
                </td>
              </tr>
            ) : (
              filteredDistributors.map((d) => (
                <tr key={d.id} className="hover:bg-[var(--surface)] transition">
                  <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                    <Link href={`/distributors/${d.id}`} className="hover:text-[var(--accent-text)]">
                      {d.distributorCode}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/distributors/${d.id}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-text)] block">
                      {d.businessName}
                    </Link>
                    {d.territory && (
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        Territory: {d.territory}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-primary)] font-medium">
                    {d.contactPerson}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    <div>{d.phone}</div>
                    {d.email && <div className="text-[11.5px] text-[var(--text-muted)]">{d.email}</div>}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {d.city}, {d.state}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[12px] font-mono text-[var(--text-primary)]">
                      {d.activeDealerCount ?? 0} / {d.dealerCount ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(d.status)}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      href={`/distributors/${d.id}`}
                      className="text-[12px] font-medium text-[var(--accent-text)] hover:underline"
                    >
                      View
                    </Link>
                    {canManage && (
                      <Link
                        href={`/distributors/${d.id}/edit`}
                        className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredDistributors.length === 0 ? (
          <div className="bg-[var(--surface-raised)] p-6 border border-[var(--border)] rounded text-center text-[var(--text-muted)] text-[13px]">
            No distributors match the current filters.
          </div>
        ) : (
          filteredDistributors.map((d) => (
            <div key={d.id} className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)] block">
                    {d.distributorCode}
                  </span>
                  <Link href={`/distributors/${d.id}`} className="font-semibold text-[15px] text-[var(--text-primary)] hover:text-[var(--accent-text)]">
                    {d.businessName}
                  </Link>
                </div>
                {getStatusBadge(d.status)}
              </div>

              <div className="text-[12.5px] space-y-1 text-[var(--text-secondary)] border-t border-[var(--border)] pt-2">
                <div>
                  <span className="text-[var(--text-muted)]">Contact:</span> {d.contactPerson} ({d.phone})
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Location:</span> {d.city}, {d.state}
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Dealers:</span>{' '}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {d.activeDealerCount ?? 0} active
                  </span>{' '}
                  ({d.dealerCount ?? 0} total)
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-2 flex items-center justify-end gap-3 text-[12px]">
                <Link href={`/distributors/${d.id}`} className="font-medium text-[var(--accent-text)] hover:underline">
                  View Details →
                </Link>
                {canManage && (
                  <Link href={`/distributors/${d.id}/edit`} className="font-medium text-[var(--text-secondary)] hover:underline">
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
