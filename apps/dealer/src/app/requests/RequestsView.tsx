'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DealerRequest, DealerRequestType } from '@trionyx/types';

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

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
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
  }, [requests, search, typeFilter]);

  const openRequests = useMemo(
    () => filteredRequests.filter((r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS'),
    [filteredRequests]
  );

  const resolvedRequests = useMemo(
    () => filteredRequests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED'),
    [filteredRequests]
  );

  return (
    <div className="space-y-8 text-[#171717]">
      {/* 1. Header with Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0">
            My Requests
          </h1>
        </div>

        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#F26522] hover:opacity-90 text-white font-semibold text-[13px] transition-opacity cursor-pointer self-start sm:self-auto shadow-xs"
        >
          New Request
        </Link>
      </div>

      {/* 2. Compact Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-y border-[#171717]/10 py-3.5">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, subject, or product..."
            aria-label="Search requests"
            className="w-full px-3 py-1.5 rounded-[4px] border border-[#171717]/15 bg-white text-[13px] text-[#171717] placeholder-[#737373]/60 focus:border-[#F26522] focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-56">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by request type"
            className="w-full px-3 py-1.5 rounded-[4px] border border-[#171717]/15 bg-white text-[13px] text-[#171717] focus:border-[#F26522] focus:outline-none"
          >
            <option value="ALL">All Request Types</option>
            <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
            <option value="AVAILABILITY">Stock Availability</option>
            <option value="GENERAL_SUPPORT">General Support</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        {(search || typeFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTypeFilter('ALL');
            }}
            className="text-[12px] text-[#F26522] hover:underline self-center cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* 3. Open Work Queue */}
      <section aria-labelledby="open-requests-heading">
        <div className="flex items-baseline justify-between border-b border-[#171717]/10 pb-2.5">
          <h2
            id="open-requests-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0"
          >
            OPEN ({openRequests.length})
          </h2>
          <span className="text-[11.5px] text-[#737373]">
            Requires response or actively in review
          </span>
        </div>

        {openRequests.length > 0 ? (
          <div className="divide-y divide-[#171717]/10">
            {openRequests.map((req) => (
              <div
                key={req.id}
                className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-[13px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11.5px] font-semibold text-[#737373]">
                      {req.requestCode}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#171717]/05 text-[#171717] font-medium">
                      {getTypeLabel(req.type)}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        req.status === 'OPEN' ? 'text-[#D97706]' : 'text-[#2563EB]'
                      }`}
                    >
                      {req.status === 'OPEN' ? 'Waiting for Trionyx / Distributor' : 'In progress'}
                    </span>
                  </div>

                  <Link
                    href={`/requests/${req.id}`}
                    className="block font-semibold text-[15px] text-[#171717] hover:text-[#F26522] leading-snug"
                  >
                    {req.subject}
                  </Link>

                  {req.productName && (
                    <div className="text-[12.5px] text-[#737373]">
                      {req.productName}
                    </div>
                  )}

                  <div className="text-[11.5px] text-[#737373] pt-0.5">
                    Updated {dateFormatter.format(new Date(req.updatedAt))}
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <Link
                    href={`/requests/${req.id}`}
                    className="inline-flex items-center text-[12.5px] font-semibold text-[#F26522] hover:underline"
                  >
                    Open request →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-[13px] text-[#737373] m-0">
            {search || typeFilter !== 'ALL'
              ? 'No open requests match your filter.'
              : 'No open requests at this time.'}
          </p>
        )}
      </section>

      {/* 4. Resolved / Closed Queue */}
      <section aria-labelledby="resolved-requests-heading" className="pt-4">
        <div className="flex items-baseline justify-between border-b border-[#171717]/10 pb-2.5">
          <h2
            id="resolved-requests-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0"
          >
            RESOLVED ({resolvedRequests.length})
          </h2>
          <span className="text-[11.5px] text-[#737373]">
            Concluded or closed queries
          </span>
        </div>

        {resolvedRequests.length > 0 ? (
          <div className="divide-y divide-[#171717]/10">
            {resolvedRequests.map((req) => (
              <div
                key={req.id}
                className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-[13px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11.5px] font-semibold text-[#737373]">
                      {req.requestCode}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#171717]/05 text-[#171717] font-medium">
                      {getTypeLabel(req.type)}
                    </span>
                    <span className="text-[11px] font-medium text-[#065F46]">
                      {req.status === 'RESOLVED' ? 'Resolved' : 'Closed'}
                    </span>
                  </div>

                  <Link
                    href={`/requests/${req.id}`}
                    className="block font-semibold text-[15px] text-[#171717] hover:text-[#F26522] leading-snug"
                  >
                    {req.subject}
                  </Link>

                  {req.productName && (
                    <div className="text-[12.5px] text-[#737373]">
                      {req.productName}
                    </div>
                  )}

                  <div className="text-[11.5px] text-[#737373] pt-0.5">
                    Resolved {dateFormatter.format(new Date(req.updatedAt))}
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <Link
                    href={`/requests/${req.id}`}
                    className="inline-flex items-center text-[12.5px] font-medium text-[#737373] hover:text-[#171717] hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-[13px] text-[#737373] m-0">
            No resolved requests to display.
          </p>
        )}
      </section>
    </div>
  );
}
