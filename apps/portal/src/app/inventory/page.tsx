import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  serialsRepository,
  locationsRepository,
  categoriesRepository,
  productsRepository,
  serialMovementsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../components/shell/InternalShell';
import { InventoryTable } from './InventoryTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
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

  const [summaries, locations, categories, products, movements] = await Promise.all([
    serialsRepository.listProductInventorySummaries(),
    locationsRepository.list(),
    categoriesRepository.list({ status: 'ACTIVE' }),
    productsRepository.list({ limit: 500 }),
    serialMovementsRepository.listWithDetails({ limit: 8 }).catch(() => []),
  ]);

  return (
    <InternalShell user={user}>
      <InventoryTable
        initialSummaries={summaries}
        locations={locations}
        categories={categories}
        products={products}
        movements={movements}
        user={user}
      />
    </InternalShell>
  );
}
