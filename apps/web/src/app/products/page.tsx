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
import { PageIntro } from '@/components/ui/PageIntro';

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
      <main className="flex flex-1 flex-col">
        <div className="site-container">
          <PageIntro title="Our formulations." />
        </div>

        <section aria-label="Products" className="pb-[var(--section-space)]">
          <div className="site-container">
            {activeProducts.length > 0 ? (
              <ProductsCatalogueView products={activeProducts} categories={activeCategories} />
            ) : (
              <div className="flex flex-col items-start gap-6 border-t border-[var(--color-hairline)] py-16">
                <h2 className="m-0 text-[clamp(1.75rem,3vw,2.5rem)] tracking-[-0.025em]">The catalogue is being updated.</h2>
                <Link href="/contact?type=PRODUCT_ENQUIRY" className="pill-button">
                  Enquire about products
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
