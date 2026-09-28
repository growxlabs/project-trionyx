import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, distributorsRepository, ensureDatabaseReady } from '@trionyx/database';
import { InternalShell } from '../../components/shell/InternalShell';
import { DealersTable } from './DealersTable';

export const dynamic = 'force-dynamic';

export default async function DealersPage() {
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

  // If user is DISTRIBUTOR role, server forces filtering by their distributorId
  let distributorIdScope: string | undefined = undefined;
  if (user.role === 'DISTRIBUTOR') {
    distributorIdScope = user.distributorId || 'UNASSIGNED';
  }

  const [dealersRes, distributorsList] = await Promise.all([
    dealersRepository.list({
      distributorId: distributorIdScope,
      limit: 100,
    }),
    user.role === 'DISTRIBUTOR'
      ? Promise.resolve([])
      : distributorsRepository.listAllActive(),
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
