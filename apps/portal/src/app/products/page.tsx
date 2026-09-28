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
import { InternalShell } from '../../components/shell/InternalShell';
import { ProductsTable } from './ProductsTable';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
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

  const [rawProducts, categories] = await Promise.all([
    productsRepository.list({ limit: 100 }),
    categoriesRepository.list({ status: 'ACTIVE' }),
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
