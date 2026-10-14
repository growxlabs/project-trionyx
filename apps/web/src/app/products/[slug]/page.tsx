import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { ProductPageTemplate } from '@/components/product/ProductPageTemplate';
import { ensureDatabaseReady, productsRepository } from '@trionyx/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  await ensureDatabaseReady();
  const product = await productsRepository.findBySlug(slug, 'TRIONYX');
  if (!product || product.status !== 'ACTIVE' || product.publicVisibility !== 'PUBLIC') {
    return {
      title: 'Product — Trionyx Automotive Formulations',
    };
  }

  return {
    title: `${product.name} — Trionyx Automotive Formulations`,
    description:
      product.shortDescription ||
      product.description ||
      `Official formulation specifications and technical data for ${product.name}.`,
  };
}

export default async function DynamicProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  await ensureDatabaseReady();
  const product = await productsRepository.findBySlugWithRelations(slug, 'TRIONYX');

  if (!product || product.status !== 'ACTIVE' || product.publicVisibility !== 'PUBLIC') {
    notFound();
  }

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
