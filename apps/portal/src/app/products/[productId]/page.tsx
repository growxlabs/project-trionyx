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

  const product = await productsRepository.findWithRelations(productId);
  if (!product) {
    notFound();
  }

  const [category, serials, movements, warrantyPolicy] = await Promise.all([
    categoriesRepository.findById(product.categoryId),
    serialsRepository.listByProduct(productId),
    serialMovementsRepository.listWithDetails({ productId, limit: 100 }),
    warrantyPoliciesRepository.findByProductId(productId),
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
