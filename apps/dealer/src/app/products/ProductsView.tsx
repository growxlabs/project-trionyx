'use client';

import React, { useState } from 'react';
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

  const filteredProducts = products.filter((p) => {
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

  return (
    <div className="space-y-6">
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-[#171714] tracking-tight mt-0.5">
              Products
            </h1>
            <p className="text-[13.5px] text-[#68665F] mt-1">
              Find product details and application information.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#68665F]">
            <span>{filteredProducts.length} of {products.length} products</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, code or category"
              aria-label="Search products"
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
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg px-5">
          {filteredProducts.map((p) => (
            <div key={p.id} className="grid gap-3 border-b border-[#171714]/10 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F]">{p.categoryName || 'General'} · {p.productCode}</p>
                <h2 className="mt-1 text-[17px] font-semibold text-[#171714]">
                  <Link href={`/products/${p.id}`} className="hover:text-[#F26522] hover:underline">{p.name}</Link>
                </h2>
                {(p.shortDescription || p.description) && (
                  <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#68665F] line-clamp-2">{p.shortDescription || p.description}</p>
                )}
              </div>
              <Link href={`/products/${p.id}`} className="text-[13px] font-semibold text-[#F26522] hover:underline">View product →</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-y border-[#171714]/10 py-8">
          <p className="text-[14px] text-[#68665F]">{products.length === 0 ? 'No products are listed yet.' : 'No products match this search.'}</p>
          {(search || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
              }}
              className="mt-3 text-[12.5px] font-semibold text-[#F26522] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
