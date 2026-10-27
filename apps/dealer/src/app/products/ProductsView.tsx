'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DealerProduct } from '@trionyx/types';

interface ProductsViewProps {
  initialProducts: DealerProduct[];
  categories: Array<{ id: string; name: string }>;
}

export function ProductsView({ initialProducts, categories }: ProductsViewProps) {
  const [products] = useState<DealerProduct[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = p.productCode.toLowerCase().includes(q);
        const matchCategory = p.categoryName?.toLowerCase().includes(q);
        const matchDesc = p.shortDescription?.toLowerCase().includes(q);
        return matchName || matchCode || matchCategory || matchDesc;
      }

      return true;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="space-y-8 text-[#171717]">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.03em] m-0">
            Products Catalog
          </h1>
          <p className="text-[13.5px] text-[#737373] mt-1 m-0">
            Authorized Trionyx automotive formulations, multimedia hardware, and studio collaterals.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/availability"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] border border-neutral-200 bg-white hover:bg-neutral-50 text-[13px] font-semibold text-[#171717] transition-colors shadow-xs"
          >
            <span>View Stock Availability</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 2. Product Families Category Pills */}
      {categories.length > 0 && (
        <section aria-labelledby="product-families-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 id="product-families-heading" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#737373] m-0">
              Technology & Product Families
            </h2>
            <span className="font-mono text-[11px] text-[#737373]">
              {categories.length} Families
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer border ${
                selectedCategory === 'ALL'
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#737373] border-neutral-200 hover:text-[#171717] hover:border-neutral-300'
              }`}
            >
              All Families ({products.length})
            </button>
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              const count = products.filter((p) => p.categoryId === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : c.id)}
                  className={`px-3 py-1.5 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#737373] border-neutral-200 hover:text-[#171717] hover:border-neutral-300'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-[8px] bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, code (TRX-PROD-...), or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13px] text-[#171717] placeholder-neutral-400 focus:border-[#F26522] focus:outline-none"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13px] text-[#171717] focus:border-[#F26522] focus:outline-none font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
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
            className="text-[12px] font-semibold text-[#F26522] hover:underline self-center cursor-pointer shrink-0"
          >
            Reset
          </button>
        )}
      </div>

      {/* 4. Product Registry Cards */}
      <div className="rounded-[8px] border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
          <div className="w-1/2 sm:w-2/5">Product & Model</div>
          <div className="hidden sm:block sm:w-1/4">Category Family</div>
          <div className="w-1/4 sm:w-1/5 text-center">Dispatch Status</div>
          <div className="w-1/4 sm:w-1/5 text-right">Actions</div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredProducts.map((p) => {
              const availabilityBadge =
                p.availability === 'AVAILABLE' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    Available
                  </span>
                ) : p.availability === 'LIMITED' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    Limited
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                    Unavailable
                  </span>
                );

              return (
                <div key={p.id} className="px-6 py-4.5 flex items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors">
                  {/* Left: Name and Code */}
                  <div className="w-1/2 sm:w-2/5 min-w-0 space-y-1">
                    <Link
                      href={`/products/${p.id}`}
                      className="text-[15px] font-semibold text-[#171717] hover:text-[#F26522] transition-colors block truncate"
                    >
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] text-[#737373]">
                        {p.productCode}
                      </span>
                      {p.shortDescription && (
                        <span className="text-[12px] text-[#737373] truncate hidden md:inline">
                          · {p.shortDescription}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center 1: Category */}
                  <div className="hidden sm:block sm:w-1/4 text-[13px] text-[#525252]">
                    {p.categoryName || 'General'}
                  </div>

                  {/* Center 2: Status */}
                  <div className="w-1/4 sm:w-1/5 flex justify-center">
                    {availabilityBadge}
                  </div>

                  {/* Right: Actions */}
                  <div className="w-1/4 sm:w-1/5 flex justify-end items-center gap-2">
                    <Link
                      href={`/products/${p.id}`}
                      className="px-3 py-1.5 rounded-[4px] border border-neutral-200 bg-white hover:bg-neutral-50 text-[12px] font-semibold text-[#171717] transition-colors shadow-xs hidden sm:inline-flex"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/requests/new?productId=${p.id}&type=AVAILABILITY&subject=Stock+Check:+${encodeURIComponent(
                        p.name
                      )}`}
                      className="px-3 py-1.5 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white text-[12px] font-semibold transition-colors shadow-xs inline-flex items-center gap-1"
                    >
                      <span>Inquire</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <p className="text-[14px] font-medium text-[#171717] m-0">No products match your search or filter.</p>
            <p className="text-[12.5px] text-[#737373] m-0">
              Clear your active filters to see all available inventory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
