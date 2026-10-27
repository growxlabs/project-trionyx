'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DealerProductAvailability } from '@trionyx/types';

interface AvailabilityItem {
  id: string;
  name: string;
  productCode: string;
  categoryName: string;
  availability: DealerProductAvailability;
  lastUpdated: string;
}

interface AvailabilityViewProps {
  initialItems: AvailabilityItem[];
  categories: Array<{ id: string; name: string }>;
}

export function AvailabilityView({ initialItems, categories }: AvailabilityViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DealerProductAvailability>('ALL');

  // Compute metrics for the operational summary strip
  const counts = useMemo(() => {
    let available = 0;
    let limited = 0;
    let unavailable = 0;

    for (const item of initialItems) {
      if (item.availability === 'AVAILABLE') available++;
      else if (item.availability === 'LIMITED') limited++;
      else unavailable++;
    }

    return {
      available,
      limited,
      unavailable,
      total: initialItems.length,
    };
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryName !== selectedCategory) return false;
      if (statusFilter !== 'ALL' && item.availability !== statusFilter) return false;
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return [item.name, item.productCode, item.categoryName].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [initialItems, search, selectedCategory, statusFilter]);

  const renderStatusBadge = (availability: DealerProductAvailability) => {
    switch (availability) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11.5px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Available Now
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11.5px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            Limited Stock
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11.5px] font-semibold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            Unavailable
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 text-[#171717]">
      {/* 1. Header with Catalog Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.03em] m-0">
            Product Availability
          </h1>
          <p className="text-[13.5px] text-[#737373] mt-1 m-0">
            Real-time regional inventory allocation, dispatch status, and direct replenishment routing.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/requests/new?type=AVAILABILITY"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white text-[13px] font-semibold transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Stock Replenishment Request</span>
          </Link>
        </div>
      </div>

      {/* 2. Operational Summary Strip (Portal Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 rounded-[8px] border border-[#171717]/10 bg-white shadow-xs overflow-hidden divide-y divide-[#171717]/10 md:divide-y-0 md:divide-x">
        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#065F46] block mb-1">
            Available Now
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#065F46] tracking-tight">{counts.available}</span>
            <span className="text-[12px] text-[#737373]">ready to ship</span>
          </div>
        </div>

        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B45309] block mb-1">
            Limited Allocation
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#B45309] tracking-tight">{counts.limited}</span>
            <span className="text-[12px] text-[#737373]">low stock</span>
          </div>
        </div>

        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#DC2626] block mb-1">
            Currently Out of Stock
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#DC2626] tracking-tight">{counts.unavailable}</span>
            <span className="text-[12px] text-[#737373]">awaiting restock</span>
          </div>
        </div>

        <div className="p-4.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] block mb-1">
            Active Catalog
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#171717] tracking-tight">{counts.total}</span>
            <span className="text-[12px] text-[#737373]">products</span>
          </div>
        </div>
      </div>

      {/* 3. Portal-Style Registry Toolbar */}
      <div className="p-4 rounded-[8px] bg-white border border-[#171717]/10 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, code (TRX-PROD-...), or category..."
              className="w-full pl-9 pr-4 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13px] text-[#171717] placeholder-[#737373]/60 focus:border-[#F26522] focus:outline-none"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-[#737373]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13px] text-[#171717] focus:border-[#F26522] focus:outline-none font-medium"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex items-center justify-between border-t border-[#171717]/08 pt-3 flex-wrap gap-2 text-[12px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#737373] font-medium mr-1 text-[11.5px] uppercase tracking-wider">Status:</span>
            {(
              [
                { id: 'ALL', label: `All (${counts.total})` },
                { id: 'AVAILABLE', label: `Available (${counts.available})` },
                { id: 'LIMITED', label: `Limited (${counts.limited})` },
                { id: 'UNAVAILABLE', label: `Unavailable (${counts.unavailable})` },
              ] as const
            ).map((filter) => {
              const active = statusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#171717]/05 text-[#737373] hover:text-[#171717] hover:bg-[#171717]/10'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {(search || selectedCategory !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setStatusFilter('ALL');
              }}
              className="text-[#F26522] hover:underline font-semibold cursor-pointer text-[12px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Products Registry Table (Card Container) */}
      <div className="rounded-[8px] border border-[#171717]/10 bg-white shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-3.5 bg-[#F9FAFB] border-b border-[#171717]/10 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
          <div className="w-1/2 sm:w-2/5">Product Details</div>
          <div className="hidden sm:block sm:w-1/4">Category</div>
          <div className="w-1/4 sm:w-1/5 text-center">Status</div>
          <div className="w-1/4 sm:w-1/5 text-right">Action</div>
        </div>

        {/* Product Items */}
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-[#171717]/08">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors"
              >
                {/* Left: Product Name + Code */}
                <div className="w-1/2 sm:w-2/5 min-w-0">
                  <Link
                    href={`/products/${item.id}`}
                    className="font-semibold text-[14px] text-[#171717] hover:text-[#F26522] transition-colors truncate block"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-[3px] bg-[#171717]/05 text-[#171717] border border-[#171717]/10 font-medium">
                      {item.productCode}
                    </span>
                    <span className="text-[11px] text-[#737373] sm:hidden truncate">
                      · {item.categoryName}
                    </span>
                  </div>
                </div>

                {/* Center 1: Category */}
                <div className="hidden sm:block sm:w-1/4 text-[13px] text-[#737373]">
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#171717]/04 border border-[#171717]/08 text-[12px] font-medium text-[#171717]">
                    {item.categoryName}
                  </span>
                </div>

                {/* Center 2: Status Badge */}
                <div className="w-1/4 sm:w-1/5 flex justify-center">
                  {renderStatusBadge(item.availability)}
                </div>

                {/* Right: Action Button */}
                <div className="w-1/4 sm:w-1/5 flex justify-end">
                  <Link
                    href={`/requests/new?productId=${item.id}&type=AVAILABILITY&subject=Stock+Check:+${encodeURIComponent(
                      item.name
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white text-[12px] font-semibold transition-colors shadow-xs"
                  >
                    <span>Request</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#171717]/05 flex items-center justify-center mx-auto text-[#737373]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#171717] m-0">No matching products found</p>
            <p className="text-[12.5px] text-[#737373] m-0">
              Try adjusting your search criteria or clear active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setStatusFilter('ALL');
              }}
              className="mt-2 inline-flex items-center px-3 py-1.5 text-[12px] font-semibold text-[#F26522] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
