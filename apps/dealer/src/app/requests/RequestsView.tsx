'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DealerRequest, DealerRequestType } from '@trionyx/types';
import { humanize } from '@/lib/format';

interface RequestsViewProps {
  initialRequests: DealerRequest[];
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

function getTypeLabel(type: DealerRequestType) {
  switch (type) {
    case 'PRODUCT_ENQUIRY':
      return 'Product Enquiry';
    case 'AVAILABILITY':
      return 'Stock Availability';
    case 'GENERAL_SUPPORT':
      return 'General Support';
    case 'OTHER':
    default:
      return 'Other';
  }
}

export function RequestsView({ initialRequests }: RequestsViewProps) {
  const [requests] = useState<DealerRequest[]>(initialRequests);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = r.requestCode.toLowerCase().includes(q);
        const matchSubject = r.subject.toLowerCase().includes(q);
        const matchProduct = r.productName?.toLowerCase().includes(q) || false;
        return matchCode || matchSubject || matchProduct;
      }

      return true;
    });
  }, [requests, search, typeFilter, statusFilter]);

  // Operational metrics
  const totalCount = requests.length;
  const openCount = useMemo(() => requests.filter((r) => r.status === 'OPEN').length, [requests]);
  const inProgressCount = useMemo(() => requests.filter((r) => r.status === 'IN_PROGRESS').length, [requests]);
  const resolvedCount = useMemo(() => requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length, [requests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Resolved
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[11px] font-semibold text-red-600">Urgent</span>;
      case 'HIGH':
        return <span className="text-[11px] font-medium text-amber-600">High</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-medium text-neutral-600">Medium</span>;
      case 'LOW':
      default:
        return <span className="text-[11px] font-medium text-neutral-400">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-[-0.02em] text-[#171717] m-0">
            My Requests
          </h1>
          <p className="text-[13.5px] text-[#737373] mt-1 m-0">
            Track and coordinate inventory allocations, technical enquiries, and support tickets with Trionyx Operations.
          </p>
        </div>

        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white font-semibold text-[13px] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <span>+ New Request</span>
        </Link>
      </div>

      {/* 2. Operational Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 rounded-[8px] border border-neutral-200 bg-white shadow-xs overflow-hidden divide-y divide-neutral-200 md:divide-y-0 md:divide-x">
        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] block mb-1">
            Total Inquiries
          </span>
          <span className="text-[26px] font-bold text-[#171717]">{totalCount}</span>
        </div>

        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1D4ED8] block mb-1">
            Open &amp; Pending
          </span>
          <span className="text-[26px] font-bold text-[#1D4ED8]">{openCount}</span>
        </div>

        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B45309] block mb-1">
            In Progress
          </span>
          <span className="text-[26px] font-bold text-[#B45309]">{inProgressCount}</span>
        </div>

        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#065F46] block mb-1">
            Resolved / Closed
          </span>
          <span className="text-[26px] font-bold text-[#065F46]">{resolvedCount}</span>
        </div>
      </div>

      {/* 3. Portal-Style Registry Toolbar */}
      <div className="p-4 rounded-[8px] bg-white border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by request code (TRX-REQ-...), subject, or product..."
              aria-label="Search requests"
              className="w-full pl-9 pr-4 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13px] text-[#171717] placeholder-neutral-400 focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
              className="w-full px-3 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13px] text-[#171717] focus:border-[#F26522] focus:outline-none transition-colors"
            >
              <option value="ALL">All Request Types</option>
              <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
              <option value="AVAILABILITY">Stock Availability</option>
              <option value="GENERAL_SUPPORT">General Support</option>
              <option value="OTHER">Other Query</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="w-full px-3 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13px] text-[#171717] focus:border-[#F26522] focus:outline-none transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {(search || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-[12px] text-[#F26522] hover:underline px-2 py-2 shrink-0 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Requests Table */}
      <div className="rounded-[8px] border border-neutral-200 bg-white shadow-xs overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373]">
                  <th className="py-3 px-4">Request Code</th>
                  <th className="py-3 px-4">Subject &amp; Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[13px]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#737373] whitespace-nowrap">
                      {req.requestCode}
                    </td>

                    {/* Subject & Product */}
                    <td className="py-3.5 px-4 min-w-[240px]">
                      <Link
                        href={`/requests/${req.id}`}
                        className="font-semibold text-[#171717] hover:text-[#F26522] transition-colors line-clamp-1"
                      >
                        {req.subject}
                      </Link>
                      {req.productName && (
                        <div className="text-[12px] text-neutral-500 mt-0.5 flex items-center gap-1">
                          <span>📦</span>
                          <span>{req.productName}</span>
                        </div>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11.5px] font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-[4px] border border-neutral-200">
                        {getTypeLabel(req.type)}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(req.priority || 'MEDIUM')}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Updated */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[12px] text-neutral-500">
                      {dateFormatter.format(new Date(req.updatedAt))}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/requests/${req.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-neutral-50 hover:bg-neutral-100 text-[#171717] text-[12px] font-medium border border-neutral-200 transition-colors shadow-2xs"
                      >
                        <span>View</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[14px] text-[#171717] m-0">No Requests Found</p>
              <p className="text-[13px] text-neutral-500 mt-1 m-0">
                {search || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No inquiries match the current search or filter criteria.'
                  : 'You have not submitted any inquiries or allocation requests yet.'}
              </p>
            </div>
            {(search || typeFilter !== 'ALL' || statusFilter !== 'ALL') ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[4px] bg-neutral-100 hover:bg-neutral-200 text-[12px] font-medium text-[#171717] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white text-[13px] font-semibold transition-colors shadow-xs"
              >
                <span>+ Create Your First Request</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
