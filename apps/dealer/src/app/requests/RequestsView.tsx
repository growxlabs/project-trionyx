'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DealerRequest, DealerRequestStatus, DealerRequestType } from '@trionyx/types';

interface RequestsViewProps {
  initialRequests: DealerRequest[];
}

export function RequestsView({ initialRequests }: RequestsViewProps) {
  const [requests] = useState<DealerRequest[]>(initialRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = r.requestCode.toLowerCase().includes(q);
      const matchSubject = r.subject.toLowerCase().includes(q);
      const matchProduct = r.productName?.toLowerCase().includes(q) || false;
      return matchCode || matchSubject || matchProduct;
    }

    return true;
  });

  const getStatusBadge = (status: DealerRequestStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            RESOLVED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7]">
            CLOSED
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[11px] font-bold text-[#DC2626]">URGENT</span>;
      case 'HIGH':
        return <span className="text-[11px] font-semibold text-[#EA580C]">High</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-medium text-[#D97706]">Medium</span>;
      case 'LOW':
      default:
        return <span className="text-[11px] font-medium text-[#71717A]">Low</span>;
    }
  };

  const getTypeLabel = (type: DealerRequestType) => {
    switch (type) {
      case 'PRODUCT_ENQUIRY':
        return 'Product Enquiry';
      case 'AVAILABILITY':
        return 'Availability / Stock';
      case 'GENERAL_SUPPORT':
        return 'Support';
      case 'OTHER':
      default:
        return 'General';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#68665F] block">
              SUPPORT & INQUIRIES
            </span>
            <h1 className="text-[24px] font-bold text-[#171714] tracking-tight mt-0.5">
              My Requests
            </h1>
            <p className="text-[13.5px] text-[#68665F] mt-1">
              Direct inquiries, stock allocations, and technical queries logged with the Trionyx operations desk.
            </p>
          </div>
          <div>
            <Link
              href="/requests/new"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded bg-[#F26522] hover:bg-[#D9531E] text-white font-semibold text-[13.5px] shadow-[0_2px_8px_rgba(242,101,34,0.25)] transition-all"
            >
              + Raise New Request
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#171714]/08">
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, subject, product..."
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522]"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
            >
              <option value="ALL">All Request Types</option>
              <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
              <option value="AVAILABILITY">Availability / Stock</option>
              <option value="GENERAL_SUPPORT">General Support</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Requests Table */}
      <div className="hidden md:block bg-[#FCFBF7] border border-[#171714]/10 rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(23,23,20,0.02)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EFECE3]/60 border-b border-[#171714]/10 text-[11.5px] font-bold uppercase tracking-wider text-[#68665F]">
              <th className="py-3 px-4">Request Code</th>
              <th className="py-3 px-4">Subject & Product</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171714]/08 text-[13.5px]">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[12px] text-[#171714]">
                    <Link
                      href={`/requests/${req.id}`}
                      className="hover:text-[#F26522] transition-colors"
                    >
                      {req.requestCode}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 max-w-[280px]">
                    <Link
                      href={`/requests/${req.id}`}
                      className="font-semibold text-[#171714] hover:text-[#F26522] transition-colors block truncate"
                    >
                      {req.subject}
                    </Link>
                    {req.productName && (
                      <span className="inline-block mt-0.5 text-[11.5px] text-[#68665F] bg-[#EFECE3] px-2 py-0.5 rounded font-medium truncate max-w-full">
                        📦 {req.productName}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#68665F] font-medium text-[12.5px]">
                    {getTypeLabel(req.type)}
                  </td>
                  <td className="py-3.5 px-4">{getPriorityBadge(req.priority)}</td>
                  <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>
                  <td className="py-3.5 px-4 text-[12.5px] text-[#68665F]">
                    {new Date(req.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/requests/${req.id}`}
                      className="inline-flex items-center text-[12.5px] font-semibold text-[#F26522] hover:text-[#D9531E] transition-colors"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#68665F]">
                  <p className="text-[14px] font-medium">No requests found</p>
                  <p className="text-[12.5px] mt-1 text-[#68665F]/80">
                    Try adjusting your filters or submit a new inquiry.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Requests List */}
      <div className="md:hidden space-y-3">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#F26522]">
                    {req.requestCode}
                  </span>
                  <h3 className="text-[15px] font-bold text-[#171714] mt-0.5">
                    <Link href={`/requests/${req.id}`} className="hover:underline">
                      {req.subject}
                    </Link>
                  </h3>
                  {req.productName && (
                    <span className="inline-block mt-1 text-[11px] text-[#68665F] bg-[#EFECE3] px-2 py-0.5 rounded">
                      📦 {req.productName}
                    </span>
                  )}
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div className="flex items-center gap-3 text-[12px] text-[#68665F] pt-2 border-t border-[#171714]/08">
                <span>{getTypeLabel(req.type)}</span>
                <span>•</span>
                <span>Priority: {getPriorityBadge(req.priority)}</span>
              </div>

              <div className="flex items-center justify-between text-[12px] pt-1">
                <span className="text-[#68665F]">
                  {new Date(req.createdAt).toLocaleDateString('en-IN')}
                </span>
                <Link
                  href={`/requests/${req.id}`}
                  className="font-semibold text-[#F26522]"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-8 text-center text-[#68665F] text-[13px]">
            No requests found.
          </div>
        )}
      </div>
    </div>
  );
}
