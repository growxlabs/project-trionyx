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
import { InternalShell } from '../../components/shell/InternalShell';
import { WarrantyListView } from './WarrantyListView';

export const dynamic = 'force-dynamic';

export default async function WarrantyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  // Distributors should not manage warranties
  if (user.role === 'DISTRIBUTOR') {
    redirect('/overview');
  }

  await ensureDatabaseReady();

  const [warrantiesResult, dealersResult, productsResult] = await Promise.all([
    warrantiesRepository.list({ limit: 100 }),
    dealersRepository.list({ limit: 200 }),
    productsRepository.list({ limit: 200 }),
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
