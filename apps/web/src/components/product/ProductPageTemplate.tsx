import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CoatingProductData } from '@/data/productCatalog';

export interface ProductPageTemplateProps {
  product: CoatingProductData;
}

export function ProductPageTemplate({ product }: ProductPageTemplateProps) {
  const enquireHref = `/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(product.name)}`;

  return (
    <article className="flex flex-col w-full text-[var(--color-text)]">
      {/* ──────────────────────────────────────────────────────────────────
          1. PRODUCT HERO
          Full-width premium automotive hero with dark overlay and Enquire CTA.
         ────────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-end overflow-hidden border-b border-[var(--color-hairline)]">
        {/* Background automotive visual */}
        <div className="absolute inset-0 z-0">
          <Image
            src={product.heroImage}
            alt={product.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.45] transition-transform duration-1000 scale-105"
          />
          {/* Subtle multi-stop gradient for text readability and Trionyx palette continuity */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/70 to-[#0E0D0B]/30" />
        </div>

        <div className="relative z-10 site-container pb-16 sm:pb-20 lg:pb-24 pt-32 w-full">
          <div className="max-w-3xl">
            {/* Breadcrumb kicker */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[var(--color-text-muted)] uppercase mb-4">
              <Link href="/products" className="hover:text-[var(--color-text)] transition-colors">
                Products
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-[var(--color-primary)]">{product.name}</span>
            </div>

            {/* Category / Name */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--color-text)] leading-[1.08]">
              {product.name}
            </h1>

            {/* Short real product statement */}
            <p className="mt-5 text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              {product.heroStatement}
            </p>

            {/* Direct enquiry action */}
            <div className="mt-8 flex items-center gap-4">
              <Link href={enquireHref} className="pill-button !min-h-[44px] !h-[44px] !py-0 !px-7 text-sm font-medium">
                Enquire
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          2. PRODUCT INTRODUCTION
          Clean two-column section: Statement on left, concise explanation on right.
         ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-[var(--color-hairline)]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-primary)] block mb-3">
                Overview
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[var(--color-text)] leading-snug">
                {product.introHeading}
              </h2>
            </div>
            <div className="lg:col-span-7 lg:pt-2">
              <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed">
                {product.introDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. KEY CHARACTERISTICS
          Clean visual layout — not oversized KPI cards.
         ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-[var(--color-hairline)] bg-[rgba(23,22,19,0.4)]">
        <div className="site-container">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">
              Performance Dynamics
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--color-text)]">
              Key Characteristics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {product.characteristics.map((char, idx) => (
              <div key={char.title} className="flex flex-col pt-4 border-t border-[var(--color-hairline)]">
                <span className="text-xs font-mono text-[var(--color-primary)] mb-2">
                  0{idx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-medium text-[var(--color-text)] tracking-tight">
                  {char.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. PRODUCT / VARIANT SECTION
          Real variants under this category with image, description, and Enquire.
         ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-[var(--color-hairline)]">
        <div className="site-container">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">
              Catalogue
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--color-text)]">
              {product.variantsTitle || 'Formulation & Variants'}
            </h2>
          </div>

          <div
            className={`grid gap-8 ${
              product.variants.length > 1
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 max-w-2xl'
            }`}
          >
            {product.variants.map((variant) => (
              <div
                key={variant.name}
                className="group rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:border-[rgba(236,231,222,0.22)] hover:bg-[#1A1916]"
              >
                <div>
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-[var(--color-hairline)] mb-6">
                    <Image
                      src={variant.imageSrc}
                      alt={variant.imageAlt}
                      fill
                      sizes="(max-width: 48rem) 100vw, 50vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[var(--color-text)]">
                      {variant.name}
                    </h3>
                    {variant.productCode && (
                      <span className="text-[11px] font-mono text-[var(--color-text-muted)] px-2 py-0.5 rounded border border-[var(--color-hairline)] shrink-0">
                        {variant.productCode}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mt-2">
                    {variant.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-hairline)] flex items-center justify-between">
                  <Link
                    href={`/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(variant.enquireProduct)}`}
                    className="pill-button !min-h-[34px] !h-[34px] !py-0 !px-5 !text-xs font-medium"
                  >
                    Enquire
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          5. TECHNICAL INFORMATION
          Clean structured table/list instead of random cards.
         ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-[var(--color-hairline)] bg-[rgba(23,22,19,0.3)]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">
                Engineering Metrics
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--color-text)]">
                Technical Information
              </h2>
              <p className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
                Verified surface metrics based on standard laboratory application parameters.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="border-t border-[var(--color-hairline)] divide-y divide-[var(--color-hairline)]">
                {product.specifications.map((spec) => (
                  <div
                    key={spec.label}
                    className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                  >
                    <span className="text-sm text-[var(--color-text-muted)] font-medium">
                      {spec.label}
                    </span>
                    <span className="text-sm sm:text-base font-mono text-[var(--color-text)]">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          6. APPLICATION / USAGE
          Clear, authentic detailing workflow.
         ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-b border-[var(--color-hairline)]">
        <div className="site-container">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">
              Studio Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--color-text)]">
              Application & Usage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {product.applicationSteps.map((step) => (
              <div
                key={step.step}
                className="flex flex-col rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(236,231,222,0.06)] border border-[var(--color-hairline)] text-[var(--color-text-muted)]">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="text-base font-medium tracking-tight text-[var(--color-text)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          7. FINAL CTA
          Simple final section with direct Enquire routing.
         ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 text-center bg-gradient-to-b from-transparent to-[#141310]">
        <div className="site-container max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-text)]">
            Interested in {product.name}?
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-muted)] leading-relaxed">
            Enquire about technical specifications, studio onboarding, or distribution for your region.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={enquireHref}
              className="pill-button !min-h-[46px] !h-[46px] !py-0 !px-8 text-sm font-medium"
            >
              Enquire
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
