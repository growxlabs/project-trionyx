import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { distributorsRepository, ensureDatabaseReady } from '@trionyx/database';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { DistributorsTable } from './DistributorsTable';

export const dynamic = 'force-dynamic';

export default async function DistributorsPage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;

  await ensureDatabaseReady();

  // If user is DISTRIBUTOR role, they only see their assigned distributor
  let initialDistributors: import('@trionyx/types').DistributorWithRelations[] = [];

  if (user.role === 'DISTRIBUTOR') {
    if (user.distributorId) {
      const myDistributor = await distributorsRepository.findById(user.distributorId, activeOrg.id);
      initialDistributors = myDistributor ? [myDistributor] : [];
    } else {
      initialDistributors = [];
    }
  } else {
    const listRes = await distributorsRepository.list({ limit: 50, organizationId: activeOrg.id });
    initialDistributors = listRes.items;
  }

  return (
    <InternalShell user={user}>
      <DistributorsTable initialDistributors={initialDistributors} user={user} />
    </InternalShell>
  );
}
