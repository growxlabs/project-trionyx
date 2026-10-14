import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { COATING_PRODUCTS } from '@/data/productCatalog';

export const metadata: Metadata = {
  title: 'Products — Trionyx Automotive Formulations',
  description:
    'Complete catalogue of Trionyx surface protection systems across advanced ceramic, graphene, and borophene matrices.',
};

export default function ProductsCataloguePage() {
  const ceramic = COATING_PRODUCTS['ceramic-coating']!;
  const graphene = COATING_PRODUCTS['graphene-coating']!;
  const borophene = COATING_PRODUCTS['borophene-coating']!;

  const categories = [
    {
      title: 'Ceramic Coating',
      slug: 'ceramic-coating',
      href: '/products/ceramic-coating',
      tagline: 'Molecular surface bond and high-clarity optical depth.',
      products: ceramic.variants.map((v) => ({
        ...v,
        href: '/products/ceramic-coating',
      })),
    },
    {
      title: 'Graphene Coating',
      slug: 'graphene-coating',
      href: '/products/graphene-coating',
      tagline: 'Reinforced carbon-matrix formulation with extreme thermal dissipation.',
      products: graphene.variants.map((v) => ({
        ...v,
        href: '/products/graphene-coating',
      })),
    },
    {
      title: 'Borophene Coating',
      slug: 'borophene-coating',
      href: '/products/borophene-coating',
      tagline: 'Atomic-grade protective lattice engineered for extreme resilience.',
      products: borophene.variants.map((v) => ({
        ...v,
        href: '/products/borophene-coating',
      })),
    },
  ];

  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col text-[var(--color-text)]">
        {/* ─── Hero / Header ─── */}
        <section className="pt-24 pb-14 sm:pt-32 sm:pb-20 border-b border-[var(--color-hairline)] bg-[rgba(23,22,19,0.3)]">
          <div className="site-container max-w-4xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-primary)] block mb-3">
              Catalogue
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--color-text)]">
              Products
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              Engineered surface protection systems across advanced ceramic, graphene, and borophene matrices.
            </p>
          </div>
        </section>

        {/* ─── Category Sections ─── */}
        <div className="divide-y divide-[var(--color-hairline)]">
          {categories.map((category) => (
            <section
              key={category.slug}
              id={category.slug}
              className="py-16 sm:py-24"
            >
              <div className="site-container">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10 pb-6 border-b border-[var(--color-hairline)]">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text)]">
                      {category.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {category.tagline}
                    </p>
                  </div>
                  <Link
                    href={category.href}
                    className="text-xs font-mono tracking-wider uppercase text-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors inline-flex items-center gap-1.5 shrink-0"
                  >
                    View Series <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {/* Products Grid */}
                <div
                  className={`grid gap-6 sm:gap-8 ${
                    category.products.length > 1
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1 max-w-xl'
                  }`}
                >
                  {category.products.map((item) => (
                    <div
                      key={item.name}
                      className="group rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:border-[rgba(236,231,222,0.22)] hover:bg-[#1A1916]"
                    >
                      <div>
                        {/* Product Image Frame */}
                        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-[var(--color-hairline)] mb-5">
                          <Image
                            src={item.imageSrc}
                            alt={item.imageAlt}
                            fill
                            sizes="(max-width: 48rem) 100vw, 50vw"
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Title & Code */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-medium tracking-tight text-[var(--color-text)]">
                            {item.name}
                          </h3>
                          {item.productCode && (
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)] px-2 py-0.5 rounded border border-[var(--color-hairline)] shrink-0">
                              {item.productCode}
                            </span>
                          )}
                        </div>

                        {/* Short Description */}
                        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-[var(--color-hairline)] flex items-center justify-between gap-4">
                        <Link
                          href={item.href}
                          className="text-xs font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1"
                        >
                          View Product <span aria-hidden="true">→</span>
                        </Link>
                        <Link
                          href={`/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(item.enquireProduct)}`}
                          className="pill-button !min-h-[32px] !h-[32px] !py-0 !px-4 !text-xs font-medium"
                        >
                          Enquire
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* ─── Bottom CTA ─── */}
        <section className="py-20 sm:py-28 border-t border-[var(--color-hairline)] bg-[rgba(23,22,19,0.3)]">
          <div className="site-container max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--color-text)]">
              Partner with Trionyx
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              Enquire about technical studio supply, distributor territories, or commercial fleet protection.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/distributors"
                className="pill-button-ghost !min-h-[42px] !h-[42px] !py-0 !px-6 text-xs sm:text-sm font-medium rounded-full border border-[var(--color-hairline)] inline-flex items-center justify-center"
              >
                Distributor Opportunities
              </Link>
              <Link
                href="/contact"
                className="pill-button !min-h-[42px] !h-[42px] !py-0 !px-6 text-xs sm:text-sm font-medium"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
