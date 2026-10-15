'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductWithRelations } from '@trionyx/types';

export interface ProductPageTemplateProps {
  product: ProductWithRelations;
}

export function ProductPageTemplate({ product }: ProductPageTemplateProps) {
  // Collect all images (media from DB, or clean fallback)
  const mediaImages = (product.media || [])
    .filter((m) => m.type === 'IMAGE')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const fallbackImage = product.slug.includes('graphene')
    ? '/images/hero/graphene-protected-vehicle.png'
    : product.slug.includes('borophene')
      ? '/images/borophene/borophene-surface.jpg'
      : '/images/about/ceramic-coating-surface.jpg';

  const allImages =
    mediaImages.length > 0
      ? mediaImages.map((m) => ({
          src: m.storagePath,
          alt: m.altText || `${product.name} surface formulation`,
        }))
      : [
          {
            src: fallbackImage,
            alt: `${product.name} surface formulation`,
          },
        ];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const activeImage = allImages[selectedImageIndex] || allImages[0];

  const enquireHref = `/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(product.name)}&code=${encodeURIComponent(product.productCode || '')}`;

  // Sort specifications
  const sortedSpecs = [...(product.specifications || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const summary = product.shortDescription?.trim() || product.description?.trim();
  const hasDetailedDescription =
    Boolean(product.description?.trim()) && product.description?.trim() !== summary;

  return (
    <article className="w-full text-[var(--color-text)]">
      <div className="site-container py-8 sm:py-12 lg:py-16">
        {/* Back Link */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span aria-hidden="true">←</span> All products
          </Link>
        </div>

        {/* 2-Column Product Detail Layout (Matching Lakshmi Structure) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* ─── Left Column: Product Gallery ─── */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Image Box */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-hairline)] flex items-center justify-center p-6 shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
              {activeImage?.src ? (
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority
                  sizes="(max-width: 64rem) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                    Studio image coming soon
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails (if multiple images) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={img.src + idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 transition-all ${
                      idx === selectedImageIndex
                        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                        : 'border-[var(--color-hairline)] hover:border-[rgba(236,231,222,0.3)]'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Right Column: Product Information ─── */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Meta kicker (Category / Brand) */}
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-primary)] mb-2">
              {product.category?.name || 'Automotive Formulations'}
              <span className="text-[var(--color-text-muted)] mx-1.5">·</span>
              <span className="text-[var(--color-text-muted)]">Trionyx</span>
            </p>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--color-text)] leading-tight">
              {product.name}
            </h1>

            {/* Ref Code Badge */}
            {product.productCode && (
              <div className="mt-3">
                <span className="text-[11px] font-mono text-[var(--color-text-muted)] px-2.5 py-1 rounded border border-[var(--color-hairline)] bg-[rgba(236,231,222,0.03)] inline-block">
                  Ref. {product.productCode}
                </span>
              </div>
            )}

            {/* Lead Summary */}
            {summary && (
              <p className="mt-5 text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed">
                {summary}
              </p>
            )}

            {/* Primary Action Box */}
            <div className="mt-8 p-5 sm:p-6 rounded-2xl border border-[var(--color-hairline)] bg-[rgba(236,231,222,0.03)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text)]">
                    Direct Technical Enquiry
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Studio allocations, technical data, and professional supply.
                  </p>
                </div>
                <Link
                  href={enquireHref}
                  className="pill-button !min-h-[42px] !h-[42px] !py-0 !px-7 text-xs sm:text-sm font-medium shrink-0 inline-flex items-center justify-center text-center"
                >
                  Enquire about this product
                </Link>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-hairline)]">
                Your enquiry automatically includes {product.name} ({product.productCode || 'Ref Code'}).
              </p>
            </div>

            {/* Technical Specifications Section */}
            <div className="mt-10 pt-8 border-t border-[var(--color-hairline)]">
              <h2 className="text-lg font-medium tracking-tight text-[var(--color-text)] mb-4">
                Specifications
              </h2>
              {sortedSpecs.length > 0 ? (
                <dl className="divide-y divide-[var(--color-hairline)] border-b border-[var(--color-hairline)]">
                  {sortedSpecs.map((spec) => (
                    <div
                      key={spec.id || spec.label}
                      className="py-3.5 flex items-baseline justify-between gap-4"
                    >
                      <dt className="text-sm text-[var(--color-text-muted)] font-normal">
                        {spec.label}
                      </dt>
                      <dd className="text-sm font-mono text-[var(--color-text)] text-right">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] py-4">
                  Laboratory certification metrics available upon direct enquiry.
                </p>
              )}
            </div>

            {/* In-Depth Description / About This Product */}
            {hasDetailedDescription && (
              <div className="mt-8 pt-8 border-t border-[var(--color-hairline)]">
                <h2 className="text-lg font-medium tracking-tight text-[var(--color-text)] mb-3">
                  About this formulation
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Studio Application Methodology ─── */}
        <section className="mt-20 pt-16 border-t border-[var(--color-hairline)]">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-primary)] block mb-2">
              Studio Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text)]">
              Application & Usage Protocol
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Authorized studio parameters for maximum bond strength and optical longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(236,231,222,0.06)] border border-[var(--color-hairline)] text-[var(--color-text-muted)] w-fit mb-4">
                Step 01
              </span>
              <h3 className="text-base font-medium tracking-tight text-[var(--color-text)] mb-2">
                Surface Decontamination & Prep
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                Thoroughly wash, clay bar, and compound paintwork to remove swirls, oxidation, and contaminants. Wipe clean with isopropyl alcohol solution.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(236,231,222,0.06)] border border-[var(--color-hairline)] text-[var(--color-text-muted)] w-fit mb-4">
                Step 02
              </span>
              <h3 className="text-base font-medium tracking-tight text-[var(--color-text)] mb-2">
                Precision Leveling & Wipe
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                Apply in overlapping cross-hatch sections with applicator block. Observe rainbow flash window before smooth leveling wipe with low-pile microfiber.
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(236,231,222,0.06)] border border-[var(--color-hairline)] text-[var(--color-text-muted)] w-fit mb-4">
                Step 03
              </span>
              <h3 className="text-base font-medium tracking-tight text-[var(--color-text)] mb-2">
                Controlled Curing
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                Allow initial ambient stabilization indoors for 12–24 hours, or accelerate with infrared curing lamps prior to exterior moisture exposure.
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
