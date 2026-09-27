'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DealerWithRelations, SafeUser, DealerStatus } from '@trionyx/types';

interface DealersTableProps {
  initialDealers: DealerWithRelations[];
  distributors: Array<{ id: string; distributorCode: string; businessName: string; city: string; state: string }>;
  user: SafeUser;
}

export function DealersTable({ initialDealers, distributors, user }: DealersTableProps) {
  const [dealers] = useState<DealerWithRelations[]>(initialDealers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [distributorFilter, setDistributorFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const canManage = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Extract unique states for filter
  const uniqueStates = Array.from(
    new Set(dealers.map((d) => d.state).filter(Boolean))
  ).sort();

  const filteredDealers = dealers.filter((d) => {
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

  const getStatusBadge = (status: DealerStatus) => {
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
              placeholder="Search by code, dealer name, city, phone..."
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

          {/* Distributor Filter (Only if MD/Admin) */}
          {user.role !== 'DISTRIBUTOR' && distributors.length > 0 && (
            <select
              value={distributorFilter}
              onChange={(e) => setDistributorFilter(e.target.value)}
              className="px-3 py-1.5 text-[13px] bg-[var(--surface-raised)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] max-w-[200px] truncate"
            >
              <option value="ALL">All Distributors</option>
              <option value="UNASSIGNED">Unassigned Dealers</option>
              {distributors.map((dst) => (
                <option key={dst.id} value={dst.id}>
                  {dst.businessName}
                </option>
              ))}
            </select>
          )}

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

          {(search || statusFilter !== 'ALL' || distributorFilter !== 'ALL' || stateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setDistributorFilter('ALL');
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
              href="/dealers/new"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>New Dealer</span>
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
              <th className="py-2.5 px-4">Studio / Dealer Name</th>
              <th className="py-2.5 px-4">Contact Person</th>
              <th className="py-2.5 px-4">Phone / Email</th>
              <th className="py-2.5 px-4">Location</th>
              <th className="py-2.5 px-4">Assigned Distributor</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredDealers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[var(--text-muted)]">
                  No dealers match the current filters.
                </td>
              </tr>
            ) : (
              filteredDealers.map((dl) => (
                <tr key={dl.id} className="hover:bg-[var(--surface)] transition">
                  <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                    <Link href={`/dealers/${dl.id}`} className="hover:text-[var(--accent-text)]">
                      {dl.dealerCode}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/dealers/${dl.id}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-text)] block">
                      {dl.businessName}
                    </Link>
                    {dl.legalName && (
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        {dl.legalName}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-primary)] font-medium">
                    {dl.contactPerson}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    <div>{dl.phone}</div>
                    {dl.email && <div className="text-[11.5px] text-[var(--text-muted)]">{dl.email}</div>}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {dl.city}, {dl.state}
                  </td>
                  <td className="py-3 px-4">
                    {dl.distributor ? (
                      <div>
                        <Link
                          href={`/distributors/${dl.distributor.id}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-text)] block"
                        >
                          {dl.distributor.businessName}
                        </Link>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {dl.distributor.distributorCode}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(dl.status)}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      href={`/dealers/${dl.id}`}
                      className="text-[12px] font-medium text-[var(--accent-text)] hover:underline"
                    >
                      View
                    </Link>
                    {canManage && (
                      <Link
                        href={`/dealers/${dl.id}/edit`}
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
        {filteredDealers.length === 0 ? (
          <div className="bg-[var(--surface-raised)] p-6 border border-[var(--border)] rounded text-center text-[var(--text-muted)] text-[13px]">
            No dealers match the current filters.
          </div>
        ) : (
          filteredDealers.map((dl) => (
            <div key={dl.id} className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)] block">
                    {dl.dealerCode}
                  </span>
                  <Link href={`/dealers/${dl.id}`} className="font-semibold text-[15px] text-[var(--text-primary)] hover:text-[var(--accent-text)]">
                    {dl.businessName}
                  </Link>
                </div>
                {getStatusBadge(dl.status)}
              </div>

              <div className="text-[12.5px] space-y-1 text-[var(--text-secondary)] border-t border-[var(--border)] pt-2">
                <div>
                  <span className="text-[var(--text-muted)]">Contact:</span> {dl.contactPerson} ({dl.phone})
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Location:</span> {dl.city}, {dl.state}
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Distributor:</span>{' '}
                  {dl.distributor ? (
                    <span className="font-medium text-[var(--text-primary)]">
                      {dl.distributor.businessName}
                    </span>
                  ) : (
                    <span className="text-[var(--status-warning)] font-medium">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-2 flex items-center justify-end gap-3 text-[12px]">
                <Link href={`/dealers/${dl.id}`} className="font-medium text-[var(--accent-text)] hover:underline">
                  View Details →
                </Link>
                {canManage && (
                  <Link href={`/dealers/${dl.id}/edit`} className="font-medium text-[var(--text-secondary)] hover:underline">
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
