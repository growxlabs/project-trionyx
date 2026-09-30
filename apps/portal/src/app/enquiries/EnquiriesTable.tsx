'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ContactEnquiry, ContactEnquiryType, SafeUser, User } from '@trionyx/types';
import {
  OperationalSummary,
  StatusBadge,
  RegistryToolbar,
  useRegisterWorkspaceViews,
  type WorkspaceViewsConfig,
} from '../../components/workspace';
import { EnquiryEmptyState } from './EnquiryEmptyState';

interface EnquiriesTableProps {
  initialEnquiries: ContactEnquiry[];
  internalUsers: User[];
  user: SafeUser;
}

export type EnquiriesWorkspaceTab = 'registry' | 'needs_action' | 'breakdown';

const TYPE_LABELS: Record<ContactEnquiryType, string> = {
  PRODUCT_ENQUIRY: 'Product Enquiry',
  DEALER_ENQUIRY: 'Dealer Enquiry',
  DISTRIBUTION_ENQUIRY: 'Distribution Enquiry',
  PRODUCT_SUPPORT: 'Product Support',
  GENERAL_ENQUIRY: 'General Enquiry',
};

export function EnquiriesTable({ initialEnquiries, internalUsers, user }: EnquiriesTableProps) {
  const [activeTab, setActiveTab] = useState<EnquiriesWorkspaceTab>('registry');
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

  // Needs Action items (NEW or UNASSIGNED)
  const needsActionItems = useMemo(() => {
    return enquiries.filter((e) => e.status === 'NEW' || !e.assignedTo);
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
  const hasActiveFilters = Boolean(search.trim()) || typeFilter !== 'ALL' || statusFilter !== 'ALL' || stateFilter !== 'ALL' || assignedFilter !== 'ALL';

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

  const workspaceViews = useMemo<WorkspaceViewsConfig>(
    () => ({
      storageKey: 'trionyx-workspace-enquiries',
      activeId: activeTab,
      onSelect: (id: string) => setActiveTab(id as EnquiriesWorkspaceTab),
      sections: [
        {
          items: [
            {
              id: 'registry',
              label: 'Enquiries Registry',
            },
            {
              id: 'needs_action',
              label: 'Needs Action',
            },
            {
              id: 'breakdown',
              label: 'Enquiry Channels',
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
      {/* 1. Operational Summary */}
      <OperationalSummary
        segments={[
          { text: 'Right now there are ' },
          { value: newCount, tone: 'accent' },
          { text: ' new enquiries, ' },
          { value: inProgressCount, tone: 'warning' },
          { text: ' in progress and ' },
          { value: unassignedCount, tone: 'info' },
          { text: ' unassigned, with ' },
          { value: closedCount, tone: 'positive' },
          { text: ' closed.' },
        ]}
      />

      {/* 3. Workspace Stage — view selection lives in the secondary sidebar */}
      <div className="w-full">
          {/* TAB 1: ENQUIRIES REGISTRY */}
          {activeTab === 'registry' && (
            <section aria-labelledby="all-enquiries-heading" className="space-y-3">
              {filteredEnquiries.length > 0 && (
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                <h2 id="all-enquiries-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0 shrink-0">
                  Enquiries Registry
                </h2>
                {typeFilter !== 'ALL' && (
                  <span className="text-[12px] font-medium text-[var(--accent)] shrink-0">
                    · Filtered by {TYPE_LABELS[typeFilter as ContactEnquiryType] || typeFilter}
                  </span>
                )}
                </div>
                <RegistryToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search code, name, business, email, or city..."
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
                      { label: `New (${newCount})`, value: 'NEW' },
                      { label: `In Progress (${inProgressCount})`, value: 'IN_PROGRESS' },
                      { label: `Closed (${closedCount})`, value: 'CLOSED' },
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
                      { label: `Unassigned (${unassignedCount})`, value: 'UNASSIGNED' },
                      ...(user?.id ? [{ label: 'Assigned to Me', value: user.id }] : []),
                      ...internalUsers.map((u) => ({ label: u.name, value: u.id })),
                    ],
                  },
                ]}
                />
              </div>
              )}

              {/* Table */}
              <div className={`overflow-hidden ${filteredEnquiries.length === 0 ? '' : 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]'}`}>
                {filteredEnquiries.length === 0 ? (
                  <EnquiryEmptyState
                    kind="registry"
                    title={hasActiveFilters ? 'No matching enquiries' : 'No enquiries yet'}
                    description={
                      hasActiveFilters
                        ? 'Try a different search or clear your filters.'
                        : 'New customer and partner enquiries will appear here.'
                    }
                    action={
                      hasActiveFilters ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setTypeFilter('ALL');
                            setStatusFilter('ALL');
                            setStateFilter('ALL');
                            setAssignedFilter('ALL');
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
                        <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                          <th className="py-2.5 px-4 w-36">Code</th>
                          <th className="py-2.5 px-4">Type</th>
                          <th className="py-2.5 px-4">Name / Business</th>
                          <th className="py-2.5 px-4">Location</th>
                          <th className="py-2.5 px-4 w-28">Created</th>
                          <th className="py-2.5 px-4 w-28">Status</th>
                          <th className="py-2.5 px-4 w-32">Owner</th>
                          <th className="py-2.5 px-4 text-right w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]/60">
                        {filteredEnquiries.map((e) => (
                          <tr key={e.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                            <td className="py-2.5 px-4 font-mono font-medium text-[12px] text-[var(--text-primary)]">
                              <Link href={`/enquiries/${e.id}`} className="hover:text-[var(--accent)] hover:underline">
                                {e.enquiryCode}
                              </Link>
                            </td>
                            <td className="py-2.5 px-4 text-[13px] text-[var(--text-secondary)]">
                              {TYPE_LABELS[e.type] || e.type}
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="font-medium text-[14px] text-[var(--text-primary)]">{e.fullName}</div>
                              {e.companyName && (
                                <div className="text-[12px] text-[var(--text-muted)] truncate max-w-[200px]">
                                  {e.companyName}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-[13px] text-[var(--text-secondary)]">
                              {[e.city, e.state].filter(Boolean).join(', ') || '—'}
                            </td>
                            <td className="py-2.5 px-4 text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                              {formatDate(e.createdAt)}
                            </td>
                            <td className="py-2.5 px-4">
                              <StatusBadge status={e.status} />
                            </td>
                            <td className="py-2.5 px-4 text-[13px]">
                              {e.assignedTo ? (
                                <span className="font-medium text-[var(--text-primary)]">
                                  {userMap.get(e.assignedTo) || 'Assigned'}
                                </span>
                              ) : (
                                <span className="text-[var(--status-warning)] font-medium text-[12px]">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <Link
                                href={`/enquiries/${e.id}`}
                                className="text-[13px] font-medium text-[var(--accent)] hover:underline"
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
          )}

          {/* TAB 2: NEEDS ACTION */}
          {activeTab === 'needs_action' && (
            <section aria-labelledby="needs-action-heading" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--status-warning)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
                  </svg>
                  <h2 id="needs-action-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                    Needs Action Queue ({needsActionItems.length})
                  </h2>
                </div>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  Inquiries pending review or staff assignment
                </span>
              </div>

              {needsActionItems.length === 0 ? (
                <EnquiryEmptyState kind="caught-up" title="You’re all caught up" description="No enquiries need action right now." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {needsActionItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4 flex flex-col justify-between gap-3 text-[13px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[12px] font-medium text-[var(--text-primary)]">
                            {item.enquiryCode}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)] mb-2">
                          {TYPE_LABELS[item.type] || item.type}
                        </div>
                        <div className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                          {item.fullName}
                        </div>
                        {item.companyName && (
                          <div className="text-[12px] text-[var(--text-muted)] truncate">
                            {item.companyName}
                          </div>
                        )}

                        <div className="mt-2 text-[12px] text-[var(--text-secondary)] space-y-0.5">
                          <div>
                            <span className="text-[var(--text-muted)]">Location:</span>{' '}
                            {[item.city, item.state].filter(Boolean).join(', ') || 'Not specified'}
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)]">Contact:</span> {item.phone} · {item.email}
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)]">Owner:</span>{' '}
                            {item.assignedTo ? (
                              <span className="font-medium text-[var(--text-primary)]">
                                {userMap.get(item.assignedTo) || 'Assigned'}
                              </span>
                            ) : (
                              <span className="text-[var(--status-warning)] font-medium">Unassigned</span>
                            )}
                          </div>
                        </div>

                        {item.message && (
                          <div className="mt-2.5 p-2 bg-[var(--surface-subtle)] rounded-[3px] text-[12px] text-[var(--text-secondary)] line-clamp-2 border border-[var(--border)]/60">
                            {item.message}
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[12px]">
                        <span className="text-[var(--text-muted)]">
                          {formatDate(item.createdAt)}
                        </span>
                        <Link
                          href={`/enquiries/${item.id}`}
                          className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                        >
                          Open Enquiry →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: BREAKDOWN BY ENQUIRY TYPE */}
          {activeTab === 'breakdown' && (
            <section aria-labelledby="by-type-heading" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <h2 id="by-type-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                    Commercial Enquiry Channels
                  </h2>
                </div>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  5 primary customer & partner touchpoints
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    type: 'DEALER_ENQUIRY' as ContactEnquiryType,
                    title: 'Dealer Enquiries',
                    count: byTypeCounts.DEALER_ENQUIRY,
                    description: 'Prospective detailing studios applying for authorized dealership network tier and territory onboarding.',
                  },
                  {
                    type: 'DISTRIBUTION_ENQUIRY' as ContactEnquiryType,
                    title: 'Distribution',
                    count: byTypeCounts.DISTRIBUTION_ENQUIRY,
                    description: 'Regional warehouse, stocking distributor, and supply chain logistics partnership requests.',
                  },
                  {
                    type: 'PRODUCT_ENQUIRY' as ContactEnquiryType,
                    title: 'Product Inquiries',
                    count: byTypeCounts.PRODUCT_ENQUIRY,
                    description: 'Technical ceramic formula specifications, SDS/chemical data sheets, and bulk procurement queries.',
                  },
                  {
                    type: 'PRODUCT_SUPPORT' as ContactEnquiryType,
                    title: 'Product Support',
                    count: byTypeCounts.PRODUCT_SUPPORT,
                    description: 'Application protocols, curing guidelines, warranty validation, and applicator troubleshooting.',
                  },
                  {
                    type: 'GENERAL_ENQUIRY' as ContactEnquiryType,
                    title: 'General',
                    count: byTypeCounts.GENERAL_ENQUIRY,
                    description: 'General customer inquiries, corporate communications, media, and unclassified correspondence.',
                  },
                ].map((cat) => (
                  <div
                    key={cat.type}
                    className="p-4 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] flex flex-col justify-between gap-3 text-[13px]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[14px] text-[var(--text-primary)]">{cat.title}</span>
                        <span className="text-[18px] font-bold font-sans tabular-nums text-[var(--text-primary)]">
                          {cat.count}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] text-[var(--text-secondary)] leading-relaxed m-0">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-muted)]">
                        {enquiries.length > 0 ? `${Math.round((cat.count / enquiries.length) * 100)}% of volume` : '0%'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTypeFilter(cat.type);
                          setActiveTab('registry');
                        }}
                        className="text-[12px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        Filter Registry →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
