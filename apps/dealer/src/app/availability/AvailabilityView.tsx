'use client';

import { useState } from 'react';
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

const groups: Array<{ status: DealerProductAvailability; title: string; empty: string }> = [
  { status: 'AVAILABLE', title: 'Available now', empty: 'No products currently marked available.' },
  { status: 'LIMITED', title: 'Limited availability', empty: 'No products currently marked limited.' },
  { status: 'UNAVAILABLE', title: 'Unavailable', empty: 'No products currently marked unavailable.' },
];

export function AvailabilityView({ initialItems, categories }: AvailabilityViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredItems = initialItems.filter((item) => {
    if (selectedCategory !== 'ALL' && item.categoryName !== selectedCategory) return false;
    const query = search.trim().toLowerCase();
    return !query || [item.name, item.productCode, item.categoryName].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#171714]">Product availability</h1>
        <p className="mt-1 text-[14px] text-[#68665F]">Check current availability before requesting stock.</p>
      </header>

      <div className="grid gap-3 border-y border-[#171714]/10 py-4 sm:grid-cols-[minmax(0,1fr)_240px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product"
          aria-label="Search products"
          className="min-h-11 w-full rounded border border-[#171714]/20 bg-white px-3 text-[13px] text-[#171714] focus:border-[#F26522] focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          aria-label="Filter by category"
          className="min-h-11 w-full rounded border border-[#171714]/20 bg-white px-3 text-[13px] text-[#171714] focus:border-[#F26522] focus:outline-none"
        >
          <option value="ALL">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
        </select>
      </div>

      {groups.map((group) => {
        const items = filteredItems.filter((item) => item.availability === group.status);
        return (
          <section key={group.status} aria-labelledby={`stock-${group.status.toLowerCase()}`}>
            <div className="flex items-baseline justify-between gap-4 border-b border-[#171714]/10 pb-3">
              <h2 id={`stock-${group.status.toLowerCase()}`} className="text-[16px] font-semibold uppercase tracking-[0.08em] text-[#171714]">{group.title}</h2>
              <span className="text-[13px] text-[#68665F]">{items.length}</span>
            </div>
            {items.length > 0 ? (
              <ul className="divide-y divide-[#171714]/10">
                {items.map((item) => (
                  <li key={item.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div>
                      <Link href={`/products/${item.id}`} className="text-[15px] font-semibold text-[#171714] hover:text-[#F26522] hover:underline">{item.name}</Link>
                      <p className="mt-1 text-[12px] text-[#68665F]">{item.categoryName} · {item.productCode}</p>
                      <p className="mt-1 text-[12px] text-[#68665F]">
                        Updated {new Date(item.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <Link
                      href={`/requests/new?productId=${item.id}&subject=Stock+Enquiry:+${encodeURIComponent(item.name)}`}
                      className="text-[13px] font-semibold text-[#F26522] hover:underline"
                    >
                      {group.status === 'UNAVAILABLE' ? 'Ask when available →' : 'Ask about stock →'}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-5 text-[13px] text-[#68665F]">
                {search || selectedCategory !== 'ALL' ? 'No matching products in this group.' : group.empty}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
