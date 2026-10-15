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
        <section className="pt-14 pb-10 sm:pt-20 sm:pb-14">
          <div className="site-container">
            <p className="mb-5 text-xs uppercase tracking-[0.16em] text-[var(--color-primary)]">Trionyx / Surface protection</p>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h1 className="text-5xl font-normal leading-[1.05] tracking-[-0.045em] sm:text-6xl">Our formulations.</h1>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">Advanced coatings. Lasting protection.<br />Find the right finish for every surface.</p>
            </div>
          </div>
        </section>

        {/* ─── Main Catalogue Section ─── */}
        <section className="pb-16 sm:pb-24">
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

        <section className="border-t border-[var(--color-hairline)] py-10 sm:py-14">
          <div className="site-container flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <h2 className="text-xl font-normal tracking-tight sm:text-2xl">Find the right coating for your project.</h2>
            <Link href="/contact?type=PRODUCT_ENQUIRY" className="inline-flex min-h-11 items-center gap-4 text-sm text-[var(--color-text)]">Talk to our team <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
