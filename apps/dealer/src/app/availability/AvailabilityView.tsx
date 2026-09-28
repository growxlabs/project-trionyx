'use client';

import React, { useState } from 'react';
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
  const [items] = useState<AvailabilityItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.categoryName !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && item.availability !== selectedStatus) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.productCode.toLowerCase().includes(q);
      const matchCategory = item.categoryName.toLowerCase().includes(q);
      return matchName || matchCode || matchCategory;
    }

    return true;
  });

  const getAvailabilityBadge = (status: DealerProductAvailability) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            AVAILABLE
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            LIMITED STOCK
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-bold bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-[#171714] tracking-tight mt-0.5">
              Product Availability
            </h1>
            <p className="text-[13.5px] text-[#68665F] mt-1">
              Check the latest listed stock status before requesting a product.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12.5px] text-[#68665F]">
            <span>{filteredItems.length} of {items.length} products</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or code"
              aria-label="Search product availability"
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522]"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
            >
              <option value="ALL">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
            >
              <option value="ALL">All stock statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="LIMITED">Limited Stock</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#FCFBF7] border border-[#171714]/10 rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(23,23,20,0.02)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EFECE3]/60 border-b border-[#171714]/10 text-[11.5px] font-bold uppercase tracking-wider text-[#68665F]">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Stock status</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171714]/08 text-[13.5px]">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/products/${item.id}`}
                      className="font-bold text-[#171714] hover:text-[#F26522] transition-colors"
                    >
                      {item.name}
                    </Link>
                    <span className="block text-[11px] font-mono text-[#68665F]">{item.productCode}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#68665F] font-medium">{item.categoryName}</td>
                  <td className="py-3.5 px-4">{getAvailabilityBadge(item.availability)}</td>
                  <td className="py-3.5 px-4 text-[12.5px] text-[#68665F]">
                    {new Date(item.lastUpdated).toLocaleDateString('en-IN', {
                      dateStyle: 'medium',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/requests/new?productId=${item.id}&subject=Stock+Enquiry:+${encodeURIComponent(item.name)}`}
                      className="inline-flex items-center px-3 py-1.5 rounded bg-[#171714] text-white font-medium text-[12px] hover:bg-black transition-colors"
                    >
                      Ask about stock
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#68665F]">
                  No products matching the selected availability filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-[#68665F] uppercase">
                    {item.categoryName}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#171714]">
                    <Link href={`/products/${item.id}`}>{item.name}</Link>
                  </h3>
                  <span className="text-[11px] font-mono text-[#68665F]">{item.productCode}</span>
                </div>
                {getAvailabilityBadge(item.availability)}
              </div>

              <div className="pt-2 border-t border-[#171714]/08 flex items-center justify-between text-[12px]">
                <span className="text-[#68665F]">
                  Updated {new Date(item.lastUpdated).toLocaleDateString('en-IN')}
                </span>
                <Link
                  href={`/requests/new?productId=${item.id}&subject=Stock+Enquiry:+${encodeURIComponent(item.name)}`}
                  className="px-3 py-1.5 rounded bg-[#171714] text-white font-medium"
                >
                  Ask about stock →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-8 text-center text-[#68665F] text-[13px]">
            No products matching the selected availability filters.
          </div>
        )}
      </div>
    </div>
  );
}
