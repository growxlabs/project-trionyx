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
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
              NETWORK OPERATIONS
            </span>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
              Dealers
            </h1>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
              Automotive detailing studios, certified service workshops, and authorized dealers.
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-[12px] font-medium text-[var(--text-secondary)]">
              {dealersRes.total} registered dealer{dealersRes.total === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table & Filters */}
      <DealersTable
        initialDealers={dealersRes.items}
        distributors={distributorsList}
        user={user}
      />
    </InternalShell>
  );
}
