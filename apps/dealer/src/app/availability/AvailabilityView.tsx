'use client';

import { useState, useMemo } from 'react';
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

const groups: Array<{ status: DealerProductAvailability; title: string; empty: string; actionLabel: string }> = [
  {
    status: 'AVAILABLE',
    title: 'Available now',
    empty: 'No products currently marked available.',
    actionLabel: 'Ask about stock →',
  },
  {
    status: 'LIMITED',
    title: 'Limited availability',
    empty: 'No products currently marked limited.',
    actionLabel: 'Ask about stock →',
  },
  {
    status: 'UNAVAILABLE',
    title: 'Unavailable',
    empty: 'No products currently marked unavailable.',
    actionLabel: 'Ask when available →',
  },
];

export function AvailabilityView({ initialItems, categories }: AvailabilityViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryName !== selectedCategory) return false;
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return [item.name, item.productCode, item.categoryName].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [initialItems, search, selectedCategory]);

  return (
    <div className="space-y-8 text-[#171717]">
      {/* 1. Header */}
      <div>
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0">
          Product Availability
        </h1>
      </div>

      {/* 2. Compact Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-y border-[#171717]/10 py-3.5">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product..."
            aria-label="Search products"
            className="w-full px-3 py-1.5 rounded-[4px] border border-[#171717]/15 bg-white text-[13px] text-[#171717] placeholder-[#737373]/60 focus:border-[#F26522] focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="w-full px-3 py-1.5 rounded-[4px] border border-[#171717]/15 bg-white text-[13px] text-[#171717] focus:border-[#F26522] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {(search || selectedCategory !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
            }}
            className="text-[12px] text-[#F26522] hover:underline self-center cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* 3. Availability State Groups */}
      <div className="space-y-8">
        {groups.map((group) => {
          const items = filteredItems.filter((item) => item.availability === group.status);
          return (
            <section key={group.status} aria-labelledby={`stock-${group.status.toLowerCase()}`}>
              <div className="flex items-baseline justify-between border-b border-[#171717]/10 pb-2.5">
                <h2
                  id={`stock-${group.status.toLowerCase()}`}
                  className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0"
                >
                  {group.title}
                </h2>
                <span className="font-mono text-[12px] font-semibold text-[#737373]">
                  {items.length}
                </span>
              </div>

              {items.length > 0 ? (
                <div className="divide-y divide-[#171717]/08">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]"
                    >
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="font-semibold text-[15px] text-[#171717] hover:text-[#F26522] block leading-snug"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-[#737373]">
                          <span>{item.categoryName}</span>
                          <span>·</span>
                          <span className="font-mono text-[11.5px]">{item.productCode}</span>
                          <span>·</span>
                          <span
                            className={`font-medium ${
                              item.availability === 'AVAILABLE'
                                ? 'text-[#065F46]'
                                : item.availability === 'LIMITED'
                                ? 'text-[#D97706]'
                                : 'text-[#DC2626]'
                            }`}
                          >
                            {item.availability === 'AVAILABLE'
                              ? 'Available'
                              : item.availability === 'LIMITED'
                              ? 'Limited'
                              : 'Currently unavailable'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link
                          href={`/requests/new?productId=${item.id}&type=AVAILABILITY&subject=Stock+Enquiry:+${encodeURIComponent(
                            item.name
                          )}`}
                          className="inline-flex items-center text-[12.5px] font-semibold text-[#F26522] hover:underline"
                        >
                          {group.actionLabel}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-5 text-[13px] text-[#737373] m-0">
                  {search || selectedCategory !== 'ALL'
                    ? 'No matching products in this group.'
                    : group.empty}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
