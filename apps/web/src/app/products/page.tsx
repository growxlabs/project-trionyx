import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import {
  ensureDatabaseReady,
  productsRepository,
  categoriesRepository,
} from '@trionyx/database';
import type { ProductWithRelations, ProductCategory } from '@trionyx/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Products — Trionyx Automotive Formulations',
  description:
    'Complete catalogue of Trionyx surface protection systems across advanced ceramic, graphene, and borophene matrices.',
};

function getProductImage(product: ProductWithRelations): { src: string; alt: string } {
  const mediaPath = product.media?.find((m) => m.type === 'IMAGE')?.storagePath;
  const fallback = product.slug.includes('graphene')
    ? '/images/hero/graphene-protected-vehicle.png'
    : product.slug.includes('borophene')
      ? '/images/borophene/borophene-surface.jpg'
      : '/images/about/ceramic-coating-surface.jpg';

  return {
    src: mediaPath || fallback,
    alt: product.media?.[0]?.altText || `${product.name} surface finish`,
  };
}

export default async function ProductsCataloguePage() {
  await ensureDatabaseReady();

  // 1. Fetch all active public products for Trionyx
  const rawProducts = await productsRepository.list({
    status: 'ACTIVE',
    publicVisibility: 'PUBLIC',
    businessCode: 'TRIONYX',
  });

  // 2. Fetch relations (specifications, category, media) for each product
  const fullProducts = await Promise.all(
    rawProducts.map(async (p) => {
      return productsRepository.findWithRelations(p.id);
    })
  );

  const activeProducts = fullProducts.filter(
    (p): p is ProductWithRelations => p !== null && p.status === 'ACTIVE' && p.publicVisibility === 'PUBLIC'
  );

  // 3. Fetch active categories for grouping
  const allCategories = await categoriesRepository.list({
    status: 'ACTIVE',
    businessCode: 'TRIONYX',
  });

  // 4. Group products by category
  interface CategoryGroup {
    id: string;
    title: string;
    slug: string;
    tagline?: string | null;
    products: ProductWithRelations[];
  }

  const categoryGroups: CategoryGroup[] = [];
  const processedProductIds = new Set<string>();

  for (const cat of allCategories) {
    const prods = activeProducts.filter((p) => p.categoryId === cat.id);
    if (prods.length > 0) {
      prods.forEach((p) => processedProductIds.add(p.id));
      categoryGroups.push({
        id: cat.id,
        title: cat.name,
        slug: cat.slug,
        tagline: cat.description,
        products: prods,
      });
    }
  }

  // Any products not matched to an active category
  const uncategorized = activeProducts.filter((p) => !processedProductIds.has(p.id));
  if (uncategorized.length > 0) {
    categoryGroups.push({
      id: 'uncategorized',
      title: 'Automotive Formulations',
      slug: 'formulations',
      tagline: 'High-performance molecular surface protection systems.',
      products: uncategorized,
    });
  }

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
        {categoryGroups.length > 0 ? (
          <div className="divide-y divide-[var(--color-hairline)]">
            {categoryGroups.map((category) => (
              <section
                key={category.id}
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
                      {category.tagline && (
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          {category.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div
                    className={`grid gap-6 sm:gap-8 ${
                      category.products.length > 1
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 max-w-xl'
                    }`}
                  >
                    {category.products.map((item) => {
                      const img = getProductImage(item);
                      const itemHref = `/products/${item.slug}`;
                      const itemEnquireHref = `/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(item.name)}`;

                      return (
                        <div
                          key={item.id}
                          className="group rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:border-[rgba(236,231,222,0.22)] hover:bg-[#1A1916]"
                        >
                          <div>
                            {/* Product Image Frame */}
                            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-[var(--color-hairline)] mb-5">
                              <Image
                                src={img.src}
                                alt={img.alt}
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
                              {item.shortDescription || item.description}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="mt-6 pt-4 border-t border-[var(--color-hairline)] flex items-center justify-between gap-4">
                            <Link
                              href={itemHref}
                              className="text-xs font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1"
                            >
                              View Product <span aria-hidden="true">→</span>
                            </Link>
                            <Link
                              href={itemEnquireHref}
                              className="pill-button !min-h-[32px] !h-[32px] !py-0 !px-4 !text-xs font-medium"
                            >
                              Enquire
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="py-24 sm:py-32">
            <div className="site-container max-w-xl text-center">
              <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--color-text)]">
                Catalogue Updating
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                Trionyx formulations are currently being scheduled for studio release. Please enquire directly for upcoming product allocations.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/contact?type=PRODUCT_ENQUIRY"
                  className="pill-button !min-h-[42px] !h-[42px] !py-0 !px-6 text-xs sm:text-sm font-medium"
                >
                  Contact Form
                </Link>
              </div>
            </div>
          </section>
        )}

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
