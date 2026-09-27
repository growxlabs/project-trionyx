import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { productsRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { ProductDetailView } from './ProductDetailView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await productsRepository.getDealerProductById(productId);
  return {
    title: product ? `${product.name} — Trionyx Dealer Portal` : 'Product Details — Trionyx',
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;
  const { productId } = await params;

  const product = await productsRepository.getDealerProductById(productId);
  if (!product) {
    notFound();
  }

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <ProductDetailView product={product} />
    </DealerShell>
  );
}
