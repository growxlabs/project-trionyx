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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[12px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Available for Dispatch
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[12px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            Limited Availability
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[12px] font-semibold bg-[#F5F5F5] text-[#525252] border border-[#E0E0E0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
            Currently Unavailable
          </span>
        );
    }
  };

  const documents = (product.media || []).filter((m) => m.type === 'DOCUMENT');
  const mediaImages = (product.media || []).filter((m) => m.type === 'IMAGE');

  return (
    <div className="space-y-8 text-[#171717]">
      {/* 1. Breadcrumbs */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#737373] hover:text-[#171717] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Products</span>
        </Link>
      </div>

      {/* 2. Product Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-[#171717]/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-[#737373]">
            <span>{product.categoryName || 'General Product'}</span>
            <span>•</span>
            <span className="font-mono">{product.productCode}</span>
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.03em] m-0">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="text-[14px] text-[#737373] max-w-2xl leading-relaxed m-0">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
          <div>{getAvailabilityBadge(product.availability)}</div>
          <Link
            href={`/requests/new?productId=${product.id}&type=AVAILABILITY`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#F26522] text-white text-[13px] font-semibold hover:bg-[#e05717] transition-colors shadow-sm"
          >
            Ask about availability →
          </Link>
        </div>
      </div>

      {/* 3. Product Overview */}
      <section aria-labelledby="overview-heading" className="space-y-3">
        <h2 id="overview-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
          PRODUCT OVERVIEW
        </h2>
        <div className="text-[14px] leading-relaxed text-[#171717] whitespace-pre-line max-w-3xl">
          {product.description || product.shortDescription || (
            <span className="text-[#737373] italic">No extended description recorded for this formulation.</span>
          )}
        </div>
      </section>

      {/* 4. Specifications */}
      <section aria-labelledby="specifications-heading" className="border-t border-[#171717]/10 pt-6 space-y-4">
        <h2 id="specifications-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
          SPECIFICATIONS & PROPERTIES
        </h2>
        {product.specifications && product.specifications.length > 0 ? (
          <div className="border border-[#171717]/10 rounded-[4px] bg-[#FFFFFF] divide-y divide-[#171717]/08 overflow-hidden max-w-3xl">
            {product.specifications.map((spec) => (
              <div key={spec.id} className="grid grid-cols-1 sm:grid-cols-3 px-4 py-2.5 text-[13px]">
                <span className="font-medium text-[#737373]">{spec.label}</span>
                <span className="sm:col-span-2 font-mono text-[#171717] mt-0.5 sm:mt-0 font-medium">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#737373] m-0">
            Standard technical specifications apply. Detailed chemistry and substrate compatibility available in TDS.
          </p>
        )}
      </section>

      {/* 5. Application & Handling */}
      <section aria-labelledby="application-heading" className="border-t border-[#171717]/10 pt-6 space-y-3">
        <h2 id="application-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
          APPLICATION & HANDLING GUIDELINES
        </h2>
        <div className="p-4 rounded-[4px] border border-[#171717]/10 bg-[#FFFFFF] space-y-2 max-w-3xl text-[13px] text-[#171717]">
          <p className="font-semibold text-[#171717] m-0">Professional Installation Only</p>
          <p className="text-[#737373] leading-relaxed m-0">
            Trionyx formulations must be applied by certified detailers in climate-controlled environments. Surfaces
            must be thoroughly decontaminated, corrected, and degreased prior to application to guarantee warranty
            coverage and maximum surface longevity.
          </p>
        </div>
      </section>

      {/* 6. Documents & Technical Data */}
      <section aria-labelledby="documents-heading" className="border-t border-[#171717]/10 pt-6 space-y-4">
        <h2 id="documents-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
          TECHNICAL DATA & COLLATERALS
        </h2>
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-[4px] border border-[#171717]/10 bg-[#FFFFFF] flex items-center justify-between gap-3 text-[13px]"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#171717] truncate m-0">{doc.fileName}</p>
                  <span className="text-[11px] tracking-wider text-[#737373]">Document</span>
                </div>
                <a
                  href={doc.storagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-semibold text-[#F26522] hover:underline shrink-0"
                >
                  Download →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#737373] m-0">
            Technical data sheets (TDS) and safety documentation (SDS) are provided directly via your regional distributor.
            To request localized collateral or physical brochures, submit an enquiry via My Requests.
          </p>
        )}

        {mediaImages.length > 0 && (
          <div className="pt-4 space-y-3">
            <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
              APPROVED ASSETS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mediaImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-[4px] border border-[#171717]/10 bg-[#FFFFFF] p-2 text-center text-[12px]"
                >
                  <div className="h-28 flex items-center justify-center bg-white rounded border border-[#171717]/05 mb-2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.storagePath}
                      alt={img.altText || img.fileName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-[#737373] truncate block text-[11px]">{img.fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 7. Bottom Action Banner */}
      <div className="border-t border-[#171717]/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#171717] m-0">
            Need allocation or sample stock for this product?
          </h3>
          <p className="text-[12.5px] text-[#737373] mt-0.5 m-0">
            Submit a direct stock replenishment or technical support request to Trionyx Operations.
          </p>
        </div>
        <Link
          href={`/requests/new?productId=${product.id}&type=AVAILABILITY`}
          className="inline-flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#171717] text-white text-[13px] font-semibold hover:bg-black transition-colors shrink-0"
        >
          Submit Allocation Request →
        </Link>
      </div>
    </div>
  );
}
