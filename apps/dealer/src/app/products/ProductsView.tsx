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
      <div>
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0">
          Products
        </h1>
      </div>

      {/* 2. Product Families (Section 6) */}
      {categories.length > 0 && (
        <section aria-labelledby="product-families-heading" className="border-t border-[#171717]/10 pt-5 space-y-3">
          <h2 id="product-families-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
            Product Families
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-[4px] text-[12.5px] font-medium border transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#171717] border-[#171717]/15 hover:border-[#171717]/30'
              }`}
            >
              All Families
            </button>
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : c.id)}
                  className={`px-3 py-1 rounded-[4px] text-[12.5px] font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#171717] border-[#171717]/15 hover:border-[#171717]/30'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-y border-[#171717]/10 py-3.5">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
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
            className="text-[12px] text-[#F26522] hover:underline self-center cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* 4. Editorial Products List */}
      <section aria-labelledby="products-list-heading">
        <div className="flex items-baseline justify-between border-b border-[#171717]/10 pb-2.5">
          <h2 id="products-list-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
            PRODUCTS ({filteredProducts.length})
          </h2>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="divide-y divide-[#171717]/10">
            {filteredProducts.map((p) => {
              const availabilityLabel =
                p.availability === 'AVAILABLE'
                  ? 'Available'
                  : p.availability === 'LIMITED'
                  ? 'Limited'
                  : 'Unavailable';

              const availabilityColor =
                p.availability === 'AVAILABLE'
                  ? 'text-[#065F46]'
                  : p.availability === 'LIMITED'
                  ? 'text-[#D97706]'
                  : 'text-[#DC2626]';

              return (
                <div key={p.id} className="py-5 space-y-2 text-[13px]">
                  <div className="text-[11px] font-semibold tracking-wider text-[#737373]">
                    {p.categoryName || 'General'} / Coating
                  </div>

                  <div>
                    <Link
                      href={`/products/${p.id}`}
                      className="text-[16px] font-semibold text-[#171717] hover:text-[#F26522] block leading-snug"
                    >
                      {p.name}
                    </Link>
                    {p.shortDescription && (
                      <p className="mt-1 text-[13px] text-[#737373] max-w-2xl leading-relaxed m-0">
                        {p.shortDescription}
                      </p>
                    )}
                  </div>

                  <div className="text-[12.5px]">
                    <span className="text-[#737373]">Availability: </span>
                    <span className={`font-semibold ${availabilityColor}`}>{availabilityLabel}</span>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <Link
                      href={`/products/${p.id}`}
                      className="text-[12.5px] font-semibold text-[#171717] hover:text-[#F26522] hover:underline"
                    >
                      View product →
                    </Link>
                    <Link
                      href={`/requests/new?productId=${p.id}&type=AVAILABILITY&subject=Stock+Check:+${encodeURIComponent(
                        p.name
                      )}`}
                      className="text-[12.5px] font-semibold text-[#F26522] hover:underline"
                    >
                      Ask about stock →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-[13px] text-[#737373]">
            {search || selectedCategory !== 'ALL'
              ? 'No products match your search or filter.'
              : 'No products are currently available for this dealership.'}
          </div>
        )}
      </section>
    </div>
  );
}
