import type { Metadata } from 'next';
import Link from 'next/link';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import {
  ensureDatabaseReady,
  productsRepository,
  categoriesRepository,
} from '@trionyx/database';
import type { ProductWithRelations } from '@trionyx/types';
import { ProductsCatalogueView } from '@/components/product/ProductsCatalogueView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Products — Trionyx Automotive Formulations',
  description:
    'Complete catalogue of Trionyx surface protection systems across advanced ceramic, graphene, and borophene matrices.',
};

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

  // 3. Fetch active categories for filter toolbar
  const activeCategories = await categoriesRepository.list({
    status: 'ACTIVE',
    businessCode: 'TRIONYX',
  });

  return (
    <PageFrame>
      <HeaderShell appearance="default" />
      <main className="flex flex-1 flex-col text-[var(--color-text)]">
        {/* ─── Hero / Header ─── */}
        <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 border-b border-[var(--color-hairline)] bg-[rgba(23,22,19,0.3)]">
          <div className="site-container max-w-4xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-primary)] block mb-3">
              Catalogue
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--color-text)]">
              Products
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              Engineered surface protection systems across advanced ceramic, graphene, and borophene matrices.
            </p>
          </div>
        </section>

        {/* ─── Main Catalogue Section ─── */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="site-container">
            {activeProducts.length > 0 ? (
              <ProductsCatalogueView
                products={activeProducts}
                categories={activeCategories}
              />
            ) : (
              <div className="py-24 text-center max-w-md mx-auto">
                <h2 className="text-2xl font-normal tracking-tight text-[var(--color-text)]">
                  Catalogue Updating
                </h2>
                <p className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Trionyx surface protection formulations are currently being scheduled for studio release. Please enquire directly for upcoming product allocations.
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
            )}
          </div>
        </section>

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
