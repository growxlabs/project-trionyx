import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { ProductPageTemplate } from '@/components/product/ProductPageTemplate';
import { ensureDatabaseReady, productsRepository } from '@trionyx/database';
import type { ProductWithRelations } from '@trionyx/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function resolveProduct(slug: string): Promise<ProductWithRelations | null> {
  await ensureDatabaseReady();

  // 1. Exact slug lookup
  let product = await productsRepository.findBySlugWithRelations(slug, 'TRIONYX');
  if (product && product.status === 'ACTIVE' && product.publicVisibility === 'PUBLIC') {
    return product;
  }

  // 2. Fallback / alias matching for category or shorthand slugs
  const allProducts = await productsRepository.list({
    status: 'ACTIVE',
    publicVisibility: 'PUBLIC',
    businessCode: 'TRIONYX',
  });

  const normalized = slug.toLowerCase();
  const matched = allProducts.find((p) => {
    const ps = p.slug.toLowerCase();
    const pn = p.name.toLowerCase();
    if (normalized.includes('graphene') && (ps.includes('graphene') || pn.includes('graphene'))) return true;
    if (normalized.includes('ceramic') && (ps.includes('ceramic') || pn.includes('ceramic'))) return true;
    if (normalized.includes('borophene') && (ps.includes('borophene') || pn.includes('borophene'))) return true;
    if (normalized.includes('hydro') && (ps.includes('hydro') || pn.includes('hydro'))) return true;
    return ps === normalized || ps.includes(normalized) || normalized.includes(ps);
  });

  if (matched) {
    product = await productsRepository.findWithRelations(matched.id);
    if (product && product.status === 'ACTIVE' && product.publicVisibility === 'PUBLIC') {
      return product;
    }
  }

  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  if (!product) {
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
  const product = await resolveProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageFrame>
      <HeaderShell appearance="default" />
      <main className="flex flex-1 flex-col">
        <ProductPageTemplate product={product} />
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
