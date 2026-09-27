import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  distributorsRepository,
  dealersRepository,
  internalNotesRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../../components/shell/InternalShell';
import { DistributorDetailView } from './DistributorDetailView';

export const dynamic = 'force-dynamic';

export default async function DistributorDetailPage({
  params,
}: {
  params: Promise<{ distributorId: string }>;
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

  const { distributorId } = await params;

  // Security Scoping: Distributor users can only view their own distributor
  if (user.role === 'DISTRIBUTOR' && user.distributorId !== distributorId) {
    redirect('/distributors');
  }

  const distributor = await distributorsRepository.findById(distributorId);
  if (!distributor) {
    notFound();
  }

  const [dealersRes, notes] = await Promise.all([
    dealersRepository.list({ distributorId, limit: 100 }),
    internalNotesRepository.listForEntity('DISTRIBUTOR', distributorId),
  ]);

  return (
    <InternalShell user={user}>
      <DistributorDetailView
        distributor={distributor}
        dealers={dealersRes.items}
        initialNotes={notes}
        user={user}
      />
    </InternalShell>
  );
}
