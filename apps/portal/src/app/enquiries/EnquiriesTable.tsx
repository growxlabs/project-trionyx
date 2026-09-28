'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ContactEnquiry, ContactEnquiryStatus, ContactEnquiryType, SafeUser, User } from '@trionyx/types';
import {
  WorkspaceHeader,
  OperationalSummaryStrip,
  StatusBadge,
  RegistryToolbar,
  type SummaryMetric,
} from '../../components/workspace';

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

  // Compute Work Queue metrics
  const newCount = useMemo(() => enquiries.filter((e) => e.status === 'NEW').length, [enquiries]);
  const inProgressCount = useMemo(() => enquiries.filter((e) => e.status === 'IN_PROGRESS').length, [enquiries]);
  const unassignedCount = useMemo(() => enquiries.filter((e) => !e.assignedTo).length, [enquiries]);
  const closedCount = useMemo(() => enquiries.filter((e) => e.status === 'CLOSED').length, [enquiries]);

  const queueMetrics: SummaryMetric[] = [
    { label: 'NEW', value: newCount, tone: newCount > 0 ? 'alert' : 'default' },
    { label: 'IN PROGRESS', value: inProgressCount, tone: inProgressCount > 0 ? 'warning' : 'default' },
    { label: 'UNASSIGNED', value: unassignedCount, tone: unassignedCount > 0 ? 'warning' : 'default' },
    { label: 'CLOSED', value: closedCount, tone: 'default' },
  ];

  // Needs Action items (NEW or UNASSIGNED, up to 4)
  const needsActionItems = useMemo(() => {
    return enquiries
      .filter((e) => e.status === 'NEW' || !e.assignedTo)
      .slice(0, 4);
  }, [enquiries]);

  // Breakdown by Type
  const byTypeCounts = useMemo(() => {
    return {
      DEALER_ENQUIRY: enquiries.filter((e) => e.type === 'DEALER_ENQUIRY').length,
      DISTRIBUTION_ENQUIRY: enquiries.filter((e) => e.type === 'DISTRIBUTION_ENQUIRY').length,
      PRODUCT_ENQUIRY: enquiries.filter((e) => e.type === 'PRODUCT_ENQUIRY').length,
      PRODUCT_SUPPORT: enquiries.filter((e) => e.type === 'PRODUCT_SUPPORT').length,
      GENERAL_ENQUIRY: enquiries.filter((e) => e.type === 'GENERAL_ENQUIRY').length,
    };
  }, [enquiries]);

  // Unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(enquiries.map((e) => e.state).filter(Boolean))).sort();
  }, [enquiries]);

  const userMap = useMemo(() => {
    return new Map(internalUsers.map((u) => [u.id, u.name]));
  }, [internalUsers]);

  // Filtered list
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (stateFilter !== 'ALL' && e.state?.toLowerCase() !== stateFilter.toLowerCase()) return false;

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
        const cityMatch = e.city ? e.city.toLowerCase().includes(q) : false;

        if (!codeMatch && !nameMatch && !businessMatch && !phoneMatch && !emailMatch && !cityMatch) {
          return false;
        }
      }

      return true;
    });
  }, [enquiries, search, typeFilter, statusFilter, stateFilter, assignedFilter]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <WorkspaceHeader
        title="Enquiries"
        meta={<span className="font-mono text-[12.5px] text-[var(--text-muted)]">{enquiries.length} enquiries</span>}
      />

      {/* 2. Work Queue Strip */}
      <OperationalSummaryStrip
        metrics={queueMetrics}
      />

      {/* 3. New / Needs Action Cards */}
      {needsActionItems.length > 0 && (
        <section aria-labelledby="needs-action-heading">
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 id="needs-action-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] m-0">
              NEW &amp; NEEDS ACTION
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {needsActionItems.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11.5px] font-semibold text-[var(--text-primary)]">
                      {item.enquiryCode}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    {TYPE_LABELS[item.type] || item.type}
                  </div>
                  <div className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">
                    {item.fullName}
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)] mt-0.5 truncate">
                    {[item.city, item.state].filter(Boolean).join(', ') || 'No location specified'}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    {formatDate(item.createdAt)}
                  </span>
                  <Link
                    href={`/enquiries/${item.id}`}
                    className="text-[12px] font-semibold text-[var(--accent)] hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. By Type Breakdown */}
      <section aria-labelledby="by-type-heading">
        <h2 id="by-type-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2.5">
          BREAKDOWN BY ENQUIRY TYPE
        </h2>
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] text-center sm:text-left">
          <div className="p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] block truncate">
              Dealer Enquiries
            </span>
            <span className="text-[20px] font-semibold text-[var(--text-primary)] mt-1 block">
              {byTypeCounts.DEALER_ENQUIRY}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] block truncate">
              Distribution
            </span>
            <span className="text-[20px] font-semibold text-[var(--text-primary)] mt-1 block">
              {byTypeCounts.DISTRIBUTION_ENQUIRY}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] block truncate">
              Product Inquiries
            </span>
            <span className="text-[20px] font-semibold text-[var(--text-primary)] mt-1 block">
              {byTypeCounts.PRODUCT_ENQUIRY}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] block truncate">
              Product Support
            </span>
            <span className="text-[20px] font-semibold text-[var(--text-primary)] mt-1 block">
              {byTypeCounts.PRODUCT_SUPPORT}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] block truncate">
              General
            </span>
            <span className="text-[20px] font-semibold text-[var(--text-primary)] mt-1 block">
              {byTypeCounts.GENERAL_ENQUIRY}
            </span>
          </div>
        </div>
      </section>

      {/* 5. All Enquiries Registry */}
      <section aria-labelledby="all-enquiries-heading">
        <h2 id="all-enquiries-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">
          ALL ENQUIRIES
        </h2>

        {/* Compact Toolbar */}
        <RegistryToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search code, name, business, email, or city..."
          totalCount={enquiries.length}
          filteredCount={filteredEnquiries.length}
          unitLabel="enquiries"
          filters={[
            {
              id: 'type',
              label: 'Type',
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { label: 'All Types', value: 'ALL' },
                { label: 'Product Enquiry', value: 'PRODUCT_ENQUIRY' },
                { label: 'Dealer Enquiry', value: 'DEALER_ENQUIRY' },
                { label: 'Distribution Enquiry', value: 'DISTRIBUTION_ENQUIRY' },
                { label: 'Product Support', value: 'PRODUCT_SUPPORT' },
                { label: 'General Enquiry', value: 'GENERAL_ENQUIRY' },
              ],
            },
            {
              id: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All Statuses', value: 'ALL' },
                { label: 'New', value: 'NEW' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Closed', value: 'CLOSED' },
              ],
            },
            {
              id: 'state',
              label: 'State',
              value: stateFilter,
              onChange: setStateFilter,
              options: [
                { label: 'All States', value: 'ALL' },
                ...uniqueStates.map((st) => ({ label: st!, value: st! })),
              ],
            },
            {
              id: 'assigned',
              label: 'Owner',
              value: assignedFilter,
              onChange: setAssignedFilter,
              options: [
                { label: 'All Owners', value: 'ALL' },
                { label: 'Unassigned', value: 'UNASSIGNED' },
                ...internalUsers.map((u) => ({ label: u.name, value: u.id })),
              ],
            },
          ]}
        />

        {/* Table */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
          {filteredEnquiries.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[var(--text-secondary)]">
              No enquiries match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    <th className="py-2.5 px-4 w-32">Code</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Name / Business</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4 w-28">Created</th>
                    <th className="py-2.5 px-4 w-28">Status</th>
                    <th className="py-2.5 px-4 w-32">Owner</th>
                    <th className="py-2.5 px-4 text-right w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredEnquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[12px] text-[var(--text-primary)]">
                        <Link href={`/enquiries/${e.id}`} className="hover:text-[var(--accent)] hover:underline">
                          {e.enquiryCode}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[12px] font-medium text-[var(--text-secondary)]">
                        {TYPE_LABELS[e.type] || e.type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--text-primary)]">{e.fullName}</div>
                        {e.companyName && (
                          <div className="text-[11.5px] text-[var(--text-muted)] truncate max-w-[200px]">
                            {e.companyName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {[e.city, e.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                        {formatDate(e.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="py-3 px-4 text-[12px]">
                        {e.assignedTo ? (
                          <span className="font-medium text-[var(--text-primary)]">
                            {userMap.get(e.assignedTo) || 'Assigned'}
                          </span>
                        ) : (
                          <span className="text-[var(--status-warning)] font-medium text-[11px] uppercase tracking-wider">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/enquiries/${e.id}`}
                          className="text-[12px] font-semibold text-[var(--accent)] hover:underline"
                        >
                          Open →
                        </Link>
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
