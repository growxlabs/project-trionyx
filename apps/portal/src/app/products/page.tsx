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
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
              CATALOG MANAGEMENT
            </span>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
              Products
            </h1>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
              Canonical registry of Trionyx automotive formulas, variants, and product specifications.
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-[12px] font-medium text-[var(--text-secondary)]">
              {products.length} registered item{products.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table & Filters */}
      <ProductsTable initialProducts={products} categories={categories} user={user} />
    </InternalShell>
  );
}
