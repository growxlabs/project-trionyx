import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  dealersRepository,
  dealerRequestsRepository,
  dealerUsersRepository,
  internalNotesRepository,
  distributorsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../../components/shell/InternalShell';
import { DealerDetailView } from './DealerDetailView';

export const dynamic = 'force-dynamic';

export default async function DealerDetailPage({
  params,
}: {
  params: Promise<{ dealerId: string }>;
}) {
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

  const { dealerId } = await params;
  const dealer = await dealersRepository.findById(dealerId);

  if (!dealer) {
    notFound();
  }

  // Security Scoping: If user is DISTRIBUTOR role, they can only view dealers assigned to them
  if (user.role === 'DISTRIBUTOR' && dealer.distributorId !== user.distributorId) {
    redirect('/dealers');
  }

  const [history, requestsRes, notes, distributors, portalUsers] = await Promise.all([
    dealersRepository.getDistributorHistory(dealerId),
    dealerRequestsRepository.list({ dealerId, limit: 100 }),
    internalNotesRepository.listForEntity('DEALER', dealerId),
    user.role === 'DISTRIBUTOR'
      ? Promise.resolve([])
      : distributorsRepository.listAllActive(),
    dealerUsersRepository.listByDealer(dealerId),
  ]);

  return (
    <InternalShell user={user}>
      <DealerDetailView
        dealer={dealer}
        history={history}
        requests={requestsRes.items}
        initialNotes={notes}
        distributors={distributors}
        initialPortalUsers={portalUsers}
        user={user}
      />
    </InternalShell>
  );
}
