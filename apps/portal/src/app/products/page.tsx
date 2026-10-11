import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  productsRepository,
  categoriesRepository,
  serialsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { ProductsTable } from './ProductsTable';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;

  await ensureDatabaseReady();

  const [rawProducts, categories] = await Promise.all([
    productsRepository.list({ limit: 100, organizationId: activeOrg.id }),
    categoriesRepository.list({ status: 'ACTIVE', organizationId: activeOrg.id }),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Attach category names and available unit counts
  const products = await Promise.all(
    rawProducts.map(async (p) => {
      const availableUnits = await serialsRepository.countAvailableForProduct(p.id);
      return {
        ...p,
        categoryName: categoryMap.get(p.categoryId),
        availableUnits,
      };
    })
  );

  return (
    <InternalShell user={user}>
      <ProductsTable initialProducts={products} categories={categories} user={user} />
    </InternalShell>
  );
}
