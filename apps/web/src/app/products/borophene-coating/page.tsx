import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { ProductPageTemplate } from '@/components/product/ProductPageTemplate';
import { COATING_PRODUCTS } from '@/data/productCatalog';

export const metadata: Metadata = {
  title: 'Borophene Coating — Trionyx Automotive Formulations',
  description:
    'Next-generation atomic-grade surface coating engineered for crystalline hardness, extreme chemical resilience, and lasting vehicle protection.',
};

export default function BoropheneCoatingPage() {
  const product = COATING_PRODUCTS['borophene-coating'];
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
