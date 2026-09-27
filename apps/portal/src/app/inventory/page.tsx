import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  serialsRepository,
  locationsRepository,
  categoriesRepository,
  productsRepository,
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
    cookieStore.delete(AUTH_CONFIG.cookieName);
    redirect('/login');
  }

  const { user } = authData;

  await ensureDatabaseReady();

  const [summaries, locations, categories, products] = await Promise.all([
    serialsRepository.listProductInventorySummaries(),
    locationsRepository.list(),
    categoriesRepository.list({ status: 'ACTIVE' }),
    productsRepository.list({ limit: 500 }),
  ]);

  return (
    <InternalShell user={user}>
      <InventoryTable
        initialSummaries={summaries}
        locations={locations}
        categories={categories}
        products={products}
        user={user}
      />
    </InternalShell>
  );
}
