import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  productsRepository,
  categoriesRepository,
  serialsRepository,
  serialMovementsRepository,
  warrantyPoliciesRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../../components/shell/InternalShell';
import { ProductDetailView } from './ProductDetailView';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  await ensureDatabaseReady();

  let product = await productsRepository.findWithRelations(productId);
  if (!product) {
    const byCode = await productsRepository.findByCode(productId.toUpperCase());
    if (byCode) {
      product = await productsRepository.findWithRelations(byCode.id);
    }
  }
  if (!product) {
    const bySlug = await productsRepository.findBySlug(productId.toLowerCase());
    if (bySlug) {
      product = await productsRepository.findWithRelations(bySlug.id);
    }
  }
  if (!product) {
    notFound();
  }

  const [category, serials, movements, warrantyPolicy] = await Promise.all([
    categoriesRepository.findById(product.categoryId),
    serialsRepository.listByProduct(product.id),
    serialMovementsRepository.listWithDetails({ productId: product.id, limit: 100 }),
    warrantyPoliciesRepository.findByProductId(product.id),
  ]);

  return (
    <InternalShell user={user}>
      <ProductDetailView
        product={product}
        category={category}
        serials={serials}
        movements={movements}
        warrantyPolicy={warrantyPolicy}
        user={user}
      />
    </InternalShell>
  );
}
