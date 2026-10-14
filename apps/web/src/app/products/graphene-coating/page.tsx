import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { ProductPageTemplate } from '@/components/product/ProductPageTemplate';
import { COATING_PRODUCTS } from '@/data/productCatalog';

export const metadata: Metadata = {
  title: 'Graphene Coating — Trionyx Automotive Formulations',
  description:
    'Reinforced carbon-matrix surface formulation with extreme hydrophobic tension, thermal dissipation, and 10H certified protection.',
};

export default function GrapheneCoatingPage() {
  const product = COATING_PRODUCTS['graphene-coating'];
  if (!product) notFound();

  return (
    <PageFrame>
      <HeaderShell appearance="overlay" />
      <main className="flex flex-1 flex-col">
        <ProductPageTemplate product={product} />
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
