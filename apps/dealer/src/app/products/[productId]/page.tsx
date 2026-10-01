import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDistributorSession } from '@/lib/auth';
import { productsRepository } from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { ProductDetailView } from './ProductDetailView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await productsRepository.getDealerProductById(productId);
  return {
    title: product ? `${product.name} — Trionyx Distributor Workspace` : 'Product Details — Trionyx',
  };
}

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { user, distributor } = await getDistributorSession();
  const { productId } = await params;

  const product = await productsRepository.getDealerProductById(productId);
  if (!product) {
    notFound();
  }

  return (
    <DistributorShell user={user} distributor={distributor}>
      <ProductDetailView product={product} />
    </DistributorShell>
  );
}
