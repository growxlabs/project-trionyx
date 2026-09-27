'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DealerProduct, DealerProductAvailability } from '@trionyx/types';

interface ProductsViewProps {
  initialProducts: DealerProduct[];
  categories: Array<{ id: string; name: string }>;
}

export function ProductsView({ initialProducts, categories }: ProductsViewProps) {
  const [products] = useState<DealerProduct[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL');

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;
    if (selectedAvailability !== 'ALL' && p.availability !== selectedAvailability) return false;

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

  const getAvailabilityBadge = (availability: DealerProductAvailability) => {
    switch (availability) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            AVAILABLE
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            LIMITED STOCK
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
            BACKORDER ONLY
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#68665F] block">
              APPROVED PRODUCTS
            </span>
            <h1 className="text-[24px] font-bold text-[#171714] tracking-tight mt-0.5">
              Product Catalog
            </h1>
            <p className="text-[13.5px] text-[#68665F] mt-1">
              Certified coatings, surface protectants, and professional detailing consumables.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#68665F]">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#171714]/08">
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or category..."
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522]"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
            >
              <option value="ALL">All Availability States</option>
              <option value="AVAILABLE">Available</option>
              <option value="LIMITED">Limited Stock</option>
              <option value="UNAVAILABLE">Backorder Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-5 flex flex-col justify-between hover:border-[#171714]/25 transition-all shadow-[0_2px_8px_rgba(23,23,20,0.02)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold text-[#68665F] uppercase tracking-wider">
                    {p.categoryName || 'General'}
                  </span>
                  {getAvailabilityBadge(p.availability)}
                </div>

                <h3 className="text-[17px] font-bold text-[#171714] hover:text-[#F26522] transition-colors">
                  <Link href={`/products/${p.id}`}>{p.name}</Link>
                </h3>

                <p className="text-[13px] text-[#68665F] mt-2 line-clamp-2 leading-relaxed">
                  {p.shortDescription || p.description || 'Professional automotive coating formulation.'}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#171714]/08 flex items-center justify-between">
                <Link
                  href={`/requests/new?productId=${p.id}&subject=Stock+Enquiry:+${encodeURIComponent(p.name)}`}
                  className="text-[12.5px] font-semibold text-[#68665F] hover:text-[#171714]"
                >
                  Request Stock
                </Link>
                <Link
                  href={`/products/${p.id}`}
                  className="px-3 py-1.5 rounded bg-[#171714] text-white font-medium text-[12px] hover:bg-black transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-12 text-center">
          <p className="text-[14px] text-[#68665F]">No dealer products are currently available.</p>
          {(search || selectedCategory !== 'ALL' || selectedAvailability !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setSelectedAvailability('ALL');
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
