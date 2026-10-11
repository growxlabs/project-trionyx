import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  warrantiesRepository,
  dealersRepository,
  productsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { WarrantyListView } from './WarrantyListView';

export const dynamic = 'force-dynamic';

export default async function WarrantyPage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;

  // Distributors should not manage warranties
  if (user.role === 'DISTRIBUTOR') {
    redirect('/overview');
  }

  // Warranty is strictly Trionyx-only
  if (activeOrg.slug !== 'trionyx') {
    redirect('/overview');
  }

  await ensureDatabaseReady();

  const [warrantiesResult, dealersResult, productsResult] = await Promise.all([
    warrantiesRepository.list({ limit: 100 }),
    dealersRepository.list({ limit: 200, organizationId: activeOrg.id }),
    productsRepository.list({ limit: 200, organizationId: activeOrg.id }),
  ]);

  return (
    <InternalShell user={user}>
      <WarrantyListView
        initialWarranties={warrantiesResult.items}
        totalCount={warrantiesResult.total}
        dealers={dealersResult.items}
        products={productsResult}
        user={user}
      />
    </InternalShell>
  );
}
