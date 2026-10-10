import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, distributorsRepository, ensureDatabaseReady } from '@trionyx/database';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { DealersTable } from './DealersTable';

export const dynamic = 'force-dynamic';

export default async function DealersPage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;

  await ensureDatabaseReady();

  // If user is DISTRIBUTOR role, server forces filtering by their distributorId
  let distributorIdScope: string | undefined = undefined;
  if (user.role === 'DISTRIBUTOR') {
    distributorIdScope = user.distributorId || 'UNASSIGNED';
  }

  const [dealersRes, distributorsList] = await Promise.all([
    dealersRepository.list({
      organizationId: activeOrg.id,
      distributorId: distributorIdScope,
      limit: 100,
    }),
    user.role === 'DISTRIBUTOR'
      ? Promise.resolve([])
      : distributorsRepository.listAllActive(activeOrg.id),
  ]);

  return (
    <InternalShell user={user}>
      <DealersTable
        initialDealers={dealersRes.items}
        totalCount={dealersRes.total}
        distributors={distributorsList}
        user={user}
      />
    </InternalShell>
  );
}
