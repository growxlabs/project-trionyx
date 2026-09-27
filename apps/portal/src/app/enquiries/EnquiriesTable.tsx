'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ContactEnquiry, ContactEnquiryStatus, ContactEnquiryType, SafeUser, User } from '@trionyx/types';

interface EnquiriesTableProps {
  initialEnquiries: ContactEnquiry[];
  internalUsers: User[];
  user: SafeUser;
}

const TYPE_LABELS: Record<ContactEnquiryType, string> = {
  PRODUCT_ENQUIRY: 'Product Enquiry',
  DEALER_ENQUIRY: 'Dealer Enquiry',
  DISTRIBUTION_ENQUIRY: 'Distribution Enquiry',
  PRODUCT_SUPPORT: 'Product Support',
  GENERAL_ENQUIRY: 'General Enquiry',
};

export function EnquiriesTable({ initialEnquiries, internalUsers }: EnquiriesTableProps) {
  const [enquiries] = useState<ContactEnquiry[]>(initialEnquiries);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [assignedFilter, setAssignedFilter] = useState<string>('ALL');

  // Extract unique states for filter dropdown
  const uniqueStates = Array.from(
    new Set(enquiries.map((e) => e.state).filter(Boolean))
  ).sort();

  // Filter in memory for instantaneous filtering
  const filteredEnquiries = enquiries.filter((e) => {
    if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (stateFilter !== 'ALL' && e.state.toLowerCase() !== stateFilter.toLowerCase()) return false;

    if (assignedFilter === 'UNASSIGNED') {
      if (e.assignedTo) return false;
    } else if (assignedFilter !== 'ALL') {
      if (e.assignedTo !== assignedFilter) return false;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const codeMatch = e.enquiryCode.toLowerCase().includes(q);
      const nameMatch = e.fullName.toLowerCase().includes(q);
      const businessMatch = e.companyName ? e.companyName.toLowerCase().includes(q) : false;
      const phoneMatch = e.phone.includes(q);
      const emailMatch = e.email ? e.email.toLowerCase().includes(q) : false;
      const cityMatch = e.city.toLowerCase().includes(q);

      if (!codeMatch && !nameMatch && !businessMatch && !phoneMatch && !emailMatch && !cityMatch) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status: ContactEnquiryStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]">
            NEW
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
            IN PROGRESS
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
            CLOSED
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const hasActiveFilters =
    search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || stateFilter !== 'ALL' || assignedFilter !== 'ALL';

  return (
    <div className="space-y-4">
      {/* Controls / Filter Bar */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-4 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by code, name, business, phone, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
                setStateFilter('ALL');
                setAssignedFilter('ALL');
              }}
              className="text-[12.5px] text-[var(--accent-text)] hover:underline font-medium px-2 py-1 self-center"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--border)] text-[12.5px]">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
            <option value="DEALER_ENQUIRY">Dealer Enquiry</option>
            <option value="DISTRIBUTION_ENQUIRY">Distribution Enquiry</option>
            <option value="PRODUCT_SUPPORT">Product Support</option>
            <option value="GENERAL_ENQUIRY">General Enquiry</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          {/* State Filter */}
          {uniqueStates.length > 0 && (
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] font-medium"
            >
              <option value="ALL">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          )}

          {/* Assigned To Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] text-[var(--text-primary)] font-medium"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {internalUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <span className="ml-auto text-[12px] text-[var(--text-muted)]">
            Showing {filteredEnquiries.length} of {enquiries.length}
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[var(--surface-raised)] border border-[var(--border)] rounded overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-[var(--text-secondary)] font-semibold text-[11.5px] uppercase tracking-wider">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Name / Business</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[var(--text-muted)]">
                  No enquiries found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredEnquiries.map((enq) => {
                const displayName = enq.companyName
                  ? `${enq.companyName} (${enq.fullName})`
                  : enq.fullName;

                return (
                  <tr key={enq.id} className="hover:bg-[var(--surface)] transition duration-75">
                    <td className="py-3 px-4 font-mono font-medium text-[12px] text-[var(--text-primary)] whitespace-nowrap">
                      {enq.enquiryCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)] whitespace-nowrap">
                      {TYPE_LABELS[enq.type] || enq.type}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-primary)] max-w-[220px] truncate" title={displayName}>
                      <span className="font-medium">{enq.companyName || enq.fullName}</span>
                      {enq.companyName && (
                        <span className="block text-[11.5px] text-[var(--text-muted)] truncate">
                          Contact: {enq.fullName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                      {enq.phone}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[var(--text-secondary)] whitespace-nowrap leading-tight">
                      <div>{enq.city}, {enq.state}</div>
                      {enq.pincode && (
                        <div className="text-[11px] font-mono text-[var(--text-muted)]">{enq.pincode}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDate(enq.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="py-3 px-4 text-[12px] whitespace-nowrap">
                      {enq.assignedUserName ? (
                        <span className="font-medium text-[var(--text-primary)]">{enq.assignedUserName}</span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/enquiries/${enq.id}`}
                        className="font-medium text-[var(--accent-text)] hover:underline text-[12.5px]"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Section 21) */}
      <div className="block md:hidden space-y-3">
        {filteredEnquiries.length === 0 ? (
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-8 text-center text-[var(--text-muted)] text-[13px]">
            No enquiries found.
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-4 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[12px] font-semibold text-[var(--text-primary)] block">
                    {enq.enquiryCode}
                  </span>
                  <span className="text-[12px] font-medium text-[var(--text-secondary)] block">
                    {TYPE_LABELS[enq.type] || enq.type}
                  </span>
                </div>
                {getStatusBadge(enq.status)}
              </div>

              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                {enq.companyName || enq.fullName}
              </div>

              <div className="text-[12px] text-[var(--text-secondary)] space-y-0.5">
                <div>{enq.city}, {enq.state} {enq.pincode && `• ${enq.pincode}`}</div>
                <div className="font-mono text-[11.5px]">{enq.phone}</div>
              </div>

              <div className="border-t border-[var(--border)] pt-2.5 flex items-center justify-between text-[12px]">
                <span className="text-[var(--text-muted)]">{formatDate(enq.createdAt)}</span>
                <Link
                  href={`/enquiries/${enq.id}`}
                  className="font-semibold text-[var(--accent-text)] hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
