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
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
              NETWORK OPERATIONS
            </span>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
              Distributors
            </h1>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
              Authorized regional distributors managing dealers and inventory distribution.
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-[12px] font-medium text-[var(--text-secondary)]">
              {totalCount} registered distributor{totalCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table & Filters */}
      <DistributorsTable initialDistributors={initialDistributors} initialTotal={totalCount} user={user} />
    </InternalShell>
  );
}
