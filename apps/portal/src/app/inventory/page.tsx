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
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { InventoryTable } from './InventoryTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;

  await ensureDatabaseReady();

  const [summaries, locations, categories, products, movements] = await Promise.all([
    serialsRepository.listProductInventorySummaries({ organizationId: activeOrg.id }),
    locationsRepository.list({ organizationId: activeOrg.id }),
    categoriesRepository.list({ status: 'ACTIVE', organizationId: activeOrg.id }),
    productsRepository.list({ limit: 500, organizationId: activeOrg.id }),
    serialMovementsRepository.listWithDetails({ limit: 8, organizationId: activeOrg.id }).catch(() => []),
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
