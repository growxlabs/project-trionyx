import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { ProductPageTemplate } from '@/components/product/ProductPageTemplate';
import { COATING_PRODUCTS } from '@/data/productCatalog';

export const metadata: Metadata = {
  title: 'Ceramic Coating — Trionyx Automotive Formulations',
  description:
    'High-clarity protective clearcoat formulation engineered for molecular surface bonding, deep gloss retention, and hydrophobic water-beading performance.',
};

export default function CeramicCoatingPage() {
  const product = COATING_PRODUCTS['ceramic-coating'];
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
