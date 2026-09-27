'use client';

import React from 'react';
import Link from 'next/link';
import type { DealerProduct, DealerProductAvailability } from '@trionyx/types';

interface ProductDetailViewProps {
  product: DealerProduct;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const getAvailabilityBadge = (availability: DealerProductAvailability) => {
    switch (availability) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            AVAILABLE FOR DISPATCH
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            LIMITED STOCK
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-bold bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
            BACKORDER ONLY
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumbs */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#68665F] hover:text-[#171714] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Product Catalog</span>
        </Link>
      </div>

      {/* Main Product Card */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 sm:p-8 shadow-[0_2px_12px_rgba(23,23,20,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#171714]/08 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11.5px] font-semibold text-[#68665F] uppercase tracking-wider">
                {product.categoryName || 'General Product'}
              </span>
              <span className="text-[#68665F]/40">•</span>
              <span className="text-[11.5px] font-mono font-semibold text-[#68665F]">
                {product.productCode}
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#171714] tracking-tight">
              {product.name}
            </h1>
            <p className="text-[14.5px] text-[#68665F] mt-2 max-w-3xl leading-relaxed">
              {product.shortDescription || 'Professional-grade automotive formulation.'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            {getAvailabilityBadge(product.availability)}
            <Link
              href={`/requests/new?productId=${product.id}&subject=Replenishment+Request:+${encodeURIComponent(product.name)}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#171714] text-white font-semibold text-[13px] hover:bg-black transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Request Product / Allocation</span>
            </Link>
          </div>
        </div>

        {/* Detailed Formulation Description */}
        {product.description && (
          <div className="py-6 border-b border-[#171714]/08">
            <h2 className="text-[14px] font-bold tracking-wider uppercase text-[#68665F] mb-3">
              Technical Description & Overview
            </h2>
            <div className="text-[14px] text-[#171714] leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Specifications Table */}
        <div className="py-6 border-b border-[#171714]/08">
          <h2 className="text-[14px] font-bold tracking-wider uppercase text-[#68665F] mb-4">
            Technical Specifications & Performance
          </h2>
          {product.specifications && product.specifications.length > 0 ? (
            <div className="border border-[#171714]/10 rounded-lg overflow-hidden divide-y divide-[#171714]/08">
              {product.specifications.map((spec) => (
                <div key={spec.id} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-[13.5px]">
                  <span className="font-semibold text-[#68665F]">{spec.label}</span>
                  <span className="sm:col-span-2 text-[#171714] font-medium mt-0.5 sm:mt-0">{spec.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#68665F]">No additional technical specifications recorded.</p>
          )}
        </div>

        {/* Collateral & Documents */}
        <div className="pt-6">
          <h2 className="text-[14px] font-bold tracking-wider uppercase text-[#68665F] mb-4">
            Approved Dealer Media & Collaterals
          </h2>
          {product.media && product.media.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {product.media.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded border border-[#171714]/10 bg-white flex items-center justify-between text-[13px]"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[#171714] truncate">{item.fileName}</p>
                    <span className="text-[11px] text-[#68665F] uppercase">{item.type}</span>
                  </div>
                  <a
                    href={item.storagePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-semibold text-[#F26522] hover:underline shrink-0"
                  >
                    View File
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#68665F]">
              Standard technical data sheets and application instructions available via distributor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
