'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductWithRelations, ProductCategory } from '@trionyx/types';

export interface ProductsCatalogueViewProps {
  products: ProductWithRelations[];
  categories: ProductCategory[];
}

function getProductImage(product: ProductWithRelations): { src: string; alt: string } | null {
  const media = product.media?.find((m) => m.type === 'IMAGE');
  if (media?.storagePath) {
    return {
      src: media.storagePath,
      alt: media.altText || `${product.name} surface formulation`,
    };
  }

  // Fallback visual
  const fallback = product.slug.includes('graphene')
    ? '/images/hero/graphene-protected-vehicle.png'
    : product.slug.includes('borophene')
      ? '/images/borophene/borophene-surface.jpg'
      : product.slug.includes('ceramic')
        ? '/images/about/ceramic-coating-surface.jpg'
        : null;

  if (fallback) {
    return {
      src: fallback,
      alt: `${product.name} surface formulation`,
    };
  }

  return null;
}

export function ProductsCatalogueView({ products, categories }: ProductsCatalogueViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  // Available categories that have products
  const activeCategories = categories.filter((c) =>
    products.some((p) => p.categoryId === c.id)
  );

  return (
    <div className="w-full">
      {/* ─── Catalogue Toolbar (Matching Lakshmi Style) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 sm:mb-12 border-b border-[var(--color-hairline)]">
        {/* Category Pill Tabs */}
        <div
          className="inline-flex flex-wrap gap-1.5 p-1 rounded-full bg-[rgba(236,231,222,0.04)] border border-[var(--color-hairline)]"
          role="tablist"
          aria-label="Filter products by category"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[36px] px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-text)] text-[#0E0D0B] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            All Formulations ({products.length})
          </button>
          {activeCategories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[36px] px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[var(--color-text)] text-[#0E0D0B] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <span className="text-xs font-mono text-[var(--color-text-muted)]">
          Showing {filteredProducts.length} of {products.length} products
        </span>
      </div>

      {/* ─── Products Grid (Matching Lakshmi ProductCard Grid) ─── */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const img = getProductImage(product);
            const itemHref = `/products/${product.slug}`;
            const enquireHref = `/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(product.name)}&code=${encodeURIComponent(product.productCode || '')}`;

            return (
              <article
                key={product.id}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 sm:p-6 transition-all duration-300 hover:border-[rgba(236,231,222,0.22)] hover:bg-[#1A1916] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
              >
                <div>
                  {/* Square Product Image Frame */}
                  <Link
                    href={itemHref}
                    className="relative block w-full aspect-square rounded-xl overflow-hidden bg-[rgba(236,231,222,0.02)] border border-[var(--color-hairline)] mb-5"
                  >
                    {img ? (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                          Image coming soon
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Category Kicker */}
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-primary)] mb-1">
                    {product.category?.name || 'Surface Formulation'}
                  </p>

                  {/* Title & Ref Code */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-medium tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      <Link href={itemHref}>{product.name}</Link>
                    </h3>
                  </div>

                  {product.productCode && (
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] px-2 py-0.5 rounded border border-[var(--color-hairline)] bg-[rgba(236,231,222,0.03)] inline-block mb-3">
                      Ref. {product.productCode}
                    </span>
                  )}

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
                    {product.shortDescription || product.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-[var(--color-hairline)] flex items-center justify-between gap-3">
                  <Link
                    href={itemHref}
                    className="text-xs font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1"
                  >
                    View details <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href={enquireHref}
                    className="pill-button !min-h-[32px] !h-[32px] !py-0 !px-4 !text-xs font-medium"
                  >
                    Enquire
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)]">
          <p className="text-base font-medium text-[var(--color-text)]">
            No products in this category yet.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Try selecting another category or view all formulations.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className="mt-5 pill-button-ghost !min-h-[36px] !h-[36px] !py-0 !px-5 text-xs font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
