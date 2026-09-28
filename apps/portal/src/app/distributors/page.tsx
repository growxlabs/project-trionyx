import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { distributorsRepository, ensureDatabaseReady } from '@trionyx/database';
import { InternalShell } from '../../components/shell/InternalShell';
import { DistributorsTable } from './DistributorsTable';

export const dynamic = 'force-dynamic';

export default async function DistributorsPage() {
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

  // If user is DISTRIBUTOR role, they only see their assigned distributor
  let initialDistributors: import('@trionyx/types').DistributorWithRelations[] = [];
  let totalCount = 0;

  if (user.role === 'DISTRIBUTOR') {
    if (user.distributorId) {
      const myDistributor = await distributorsRepository.findById(user.distributorId);
      initialDistributors = myDistributor ? [myDistributor] : [];
      totalCount = initialDistributors.length;
    } else {
      initialDistributors = [];
      totalCount = 0;
    }
  } else {
    const listRes = await distributorsRepository.list({ limit: 50 });
    initialDistributors = listRes.items;
    totalCount = listRes.total;
  }

  return (
    <InternalShell user={user}>
      <DistributorsTable initialDistributors={initialDistributors} initialTotal={totalCount} user={user} />
    </InternalShell>
  );
}
