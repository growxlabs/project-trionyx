'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DealerProduct, DealerProductAvailability } from '@trionyx/types';

interface ProductDetailViewProps {
  product: DealerProduct;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'media' | 'inquiry'>('overview');

  const getAvailabilityBadge = (availability: DealerProductAvailability) => {
    switch (availability) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Available for Dispatch
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            Limited Allocation
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-semibold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            Currently Unavailable
          </span>
        );
    }
  };

  const documents = (product.media || []).filter((m) => m.type === 'DOCUMENT');
  const mediaImages = (product.media || []).filter((m) => m.type === 'IMAGE');

  // Clean specification label to strip any concatenated artifacts
  const cleanSpecLabel = (rawLabel: string) => {
    if (!rawLabel) return '';
    return rawLabel.replace(/^Formulation([A-Z])/, '$1');
  };

  // Determine category-specific handling and application instructions
  const renderHandlingGuidelines = () => {
    const categoryLower = (product.categoryName || '').toLowerCase();
    const isCoating = categoryLower.includes('coating');
    const isElectronics = categoryLower.includes('multimedia') || categoryLower.includes('lamp') || categoryLower.includes('player');
    const isFilm = categoryLower.includes('film') || categoryLower.includes('ppf');
    const isDamping = categoryLower.includes('damping');

    if (isElectronics) {
      return (
        <div className="p-5 rounded-[8px] border border-[#171717]/10 bg-white space-y-2 text-[13.5px]">
          <p className="font-semibold text-[#171717] m-0">Professional Automotive Electronics Installation</p>
          <p className="text-[#737373] leading-relaxed m-0">
            Trionyx multimedia units and electronic accessories must be installed using the vehicle-specific wiring harness adapter and compatible dashboard fascia. Ensure the vehicle battery is safely disconnected before making any electrical connections, and verify chassis grounding to prevent electrical interference.
          </p>
        </div>
      );
    }

    if (isFilm) {
      return (
        <div className="p-5 rounded-[8px] border border-[#171717]/10 bg-white space-y-2 text-[13.5px]">
          <p className="font-semibold text-[#171717] m-0">Certified Cleanroom Installation</p>
          <p className="text-[#737373] leading-relaxed m-0">
            Paint Protection Film and window films must be applied in a dedicated, dust-controlled installation bay. Vehicle panels must undergo extensive decontamination and IPA wipe-down. Use authorized slip solution and squeegee pressure to achieve optically clear adhesion without silvering.
          </p>
        </div>
      );
    }

    if (isDamping) {
      return (
        <div className="p-5 rounded-[8px] border border-[#171717]/10 bg-white space-y-2 text-[13.5px]">
          <p className="font-semibold text-[#171717] m-0">Substrate Preparation & Rolling Fitment</p>
          <p className="text-[#737373] leading-relaxed m-0">
            Acoustic damping sheets require degreased, dry vehicle sheet metal. Roll with high-pressure polyurethane application rollers to eliminate air pockets and guarantee maximum acoustic dissipation.
          </p>
        </div>
      );
    }

    // Default for coatings / chemicals
    return (
      <div className="p-5 rounded-[8px] border border-[#171717]/10 bg-white space-y-2 text-[13.5px]">
        <p className="font-semibold text-[#171717] m-0">Certified Studio Surface Application</p>
        <p className="text-[#737373] leading-relaxed m-0">
          Trionyx surface formulations must be applied by certified detailers in climate-controlled environments (20°C–25°C, humidity &lt;50%). Surfaces must be thoroughly decontaminated, multi-stage paint corrected, and wiped down with dedicated panel prep prior to application.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-[#171717]">
      {/* 1. Breadcrumbs */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#737373] hover:text-[#171717] transition-colors"
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
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[4px] bg-[#171717]/05 border border-[#171717]/08 text-[11px] font-semibold uppercase tracking-wider text-[#171717]">
              {product.categoryName || 'General Product'}
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] bg-[#171717]/05 text-[#171717] border border-[#171717]/10 font-medium">
              {product.productCode}
            </span>
          </div>

          <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] m-0">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="text-[14.5px] text-[#737373] max-w-2xl leading-relaxed m-0">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
          <div>{getAvailabilityBadge(product.availability)}</div>
          <Link
            href={`/requests/new?productId=${product.id}&type=AVAILABILITY&subject=Stock+Check:+${encodeURIComponent(
              product.name
            )}`}
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white text-[13px] font-semibold transition-colors shadow-xs"
          >
            <span>Request Stock Allocation</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 3. Operational KPI Metric Cards (Portal Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#171717]/10 rounded-[8px] p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] block mb-1">
            Dispatch Status
          </span>
          <div className="text-[17px] font-bold text-[#171717] tracking-tight">
            {product.availability === 'AVAILABLE'
              ? 'Available for Dispatch'
              : product.availability === 'LIMITED'
              ? 'Limited Allocation'
              : 'Out of Stock'}
          </div>
          <span className="text-[11.5px] text-[#737373] mt-0.5 block">Regional inventory status</span>
        </div>

        <div className="bg-white border border-[#171717]/10 rounded-[8px] p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] block mb-1">
            Category Family
          </span>
          <div className="text-[17px] font-bold text-[#171717] tracking-tight truncate">
            {product.categoryName || 'General'}
          </div>
          <span className="text-[11.5px] text-[#737373] mt-0.5 block">Official product family</span>
        </div>

        <div className="bg-white border border-[#171717]/10 rounded-[8px] p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] block mb-1">
            Technical Specs
          </span>
          <div className="text-[17px] font-bold text-[#171717] tracking-tight">
            {product.specifications ? product.specifications.length : 0} Parameters
          </div>
          <span className="text-[11.5px] text-[#737373] mt-0.5 block">Verified characteristics</span>
        </div>

        <div className="bg-white border border-[#171717]/10 rounded-[8px] p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] block mb-1">
            Media & Documentation
          </span>
          <div className="text-[17px] font-bold text-[#171717] tracking-tight">
            {product.media ? product.media.length : 0} Assets
          </div>
          <span className="text-[11.5px] text-[#737373] mt-0.5 block">TDS, images, and collaterals</span>
        </div>
      </div>

      {/* 4. Portal-Style Navigation Tabs */}
      <div className="border-b border-[#171717]/10 flex items-center gap-2 overflow-x-auto">
        {(
          [
            { key: 'overview', label: 'Overview' },
            {
              key: 'specs',
              label: `Specifications (${product.specifications ? product.specifications.length : 0})`,
            },
            {
              key: 'media',
              label: `Media & Docs (${product.media ? product.media.length : 0})`,
            },
            { key: 'inquiry', label: 'Stock & Replenishment' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-3 text-[13px] font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#F26522] text-[#F26522]'
                  : 'border-transparent text-[#737373] hover:text-[#171717]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 5. TAB CONTENT */}
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-[8px] border border-[#171717]/10 shadow-xs space-y-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737373] m-0">
              Product Overview
            </h2>
            <div className="text-[14px] leading-relaxed text-[#171717] whitespace-pre-line max-w-3xl">
              {product.description || product.shortDescription || (
                <span className="text-[#737373] italic">No extended description recorded for this product.</span>
              )}
            </div>
          </section>

          {/* Application Guidelines */}
          <section className="space-y-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737373] m-0">
              Application & Fitment Guidelines
            </h2>
            {renderHandlingGuidelines()}
          </section>
        </div>
      )}

      {/* TAB 2: SPECIFICATIONS */}
      {activeTab === 'specs' && (
        <section className="bg-white rounded-[8px] border border-[#171717]/10 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[#171717]/10 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#171717] m-0">
              Technical Specifications & Properties
            </h2>
            <span className="font-mono text-[11px] text-[#737373]">
              {product.specifications ? product.specifications.length : 0} Parameters
            </span>
          </div>

          {product.specifications && product.specifications.length > 0 ? (
            <div className="divide-y divide-[#171717]/08">
              {product.specifications.map((spec) => (
                <div key={spec.id} className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-[13px] hover:bg-[#F9FAFB]/50 transition-colors">
                  <span className="font-medium text-[#737373]">{cleanSpecLabel(spec.label)}</span>
                  <span className="sm:col-span-2 font-mono text-[#171717] mt-1 sm:mt-0 font-medium">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[13px] text-[#737373]">
              Standard technical specifications apply. Detailed chemistry and substrate compatibility available in technical documentation.
            </div>
          )}
        </section>
      )}

      {/* TAB 3: MEDIA & COLLATERALS */}
      {activeTab === 'media' && (
        <div className="space-y-8">
          {/* Images */}
          <section className="bg-white p-6 rounded-[8px] border border-[#171717]/10 shadow-xs space-y-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#171717] m-0">
              Approved Assets & Product Imagery
            </h2>

            {mediaImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mediaImages.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-[6px] border border-[#171717]/10 bg-white p-2.5 text-center text-[12px] hover:border-[#171717]/30 transition-colors shadow-xs"
                  >
                    <div className="h-32 flex items-center justify-center bg-[#F9FAFB] rounded border border-[#171717]/05 mb-2 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.storagePath}
                        alt={img.altText || img.fileName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[#171717] font-medium truncate block text-[11.5px]">{img.fileName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#737373] m-0">
                No high-resolution imagery assets uploaded yet for this product.
              </p>
            )}
          </section>

          {/* Technical Documents */}
          <section className="bg-white p-6 rounded-[8px] border border-[#171717]/10 shadow-xs space-y-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#171717] m-0">
              Technical Documentation & Collateral
            </h2>

            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-[6px] border border-[#171717]/10 bg-white flex items-center justify-between gap-3 text-[13px] shadow-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#171717] truncate m-0">{doc.fileName}</p>
                      <span className="text-[11px] text-[#737373]">Technical Document</span>
                    </div>
                    <a
                      href={doc.storagePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-[4px] bg-[#F26522]/10 text-[#F26522] hover:bg-[#F26522] hover:text-white font-semibold text-[11.5px] transition-colors shrink-0"
                    >
                      Download →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#737373] m-0">
                Technical data sheets (TDS) and safety documentation (SDS) are provided directly via your regional distribution hub.
              </p>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: INQUIRY & DISPATCH */}
      {activeTab === 'inquiry' && (
        <section className="bg-white p-6 rounded-[8px] border border-[#171717]/10 shadow-xs space-y-5">
          <div>
            <h2 className="text-[15px] font-semibold text-[#171717] m-0">
              Stock Replenishment & Inquiries
            </h2>
            <p className="text-[13px] text-[#737373] mt-1 m-0">
              Submit a formal inquiry or stock allocation request for {product.name} ({product.productCode}).
            </p>
          </div>

          <div className="p-4.5 rounded-[6px] bg-[#F9FAFB] border border-[#171717]/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-[#737373]">Current Stock Availability:</span>
              <div>{getAvailabilityBadge(product.availability)}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-[#737373]">Product Code:</span>
              <span className="font-mono text-[12px] font-semibold text-[#171717]">{product.productCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-[#737373]">Category Family:</span>
              <span className="text-[12.5px] font-semibold text-[#171717]">{product.categoryName}</span>
            </div>
          </div>

          <div>
            <Link
              href={`/requests/new?productId=${product.id}&type=AVAILABILITY&subject=Stock+Check:+${encodeURIComponent(
                product.name
              )}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white text-[13.5px] font-semibold transition-colors shadow-xs"
            >
              <span>Submit Stock Allocation Request</span>
              <span>→</span>
            </Link>
          </div>
        </section>
      )}

      {/* 6. Consistent Bottom Banner */}
      <div className="rounded-[8px] border border-[#171717]/10 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#171717] m-0">
            Need allocation or sample stock for this product?
          </h3>
          <p className="text-[13px] text-[#737373] mt-1 m-0">
            Submit a direct stock replenishment or technical support request to Trionyx Operations.
          </p>
        </div>
        <Link
          href={`/requests/new?productId=${product.id}&type=AVAILABILITY&subject=Stock+Check:+${encodeURIComponent(
            product.name
          )}`}
          className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] text-white text-[13px] font-semibold transition-colors shrink-0 shadow-xs"
        >
          <span>Submit Allocation Request</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
