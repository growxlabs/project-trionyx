import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  requireDistributorSession,
  DISTRIBUTOR_AUTH_CONFIG,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { warrantiesRepository, dealersRepository } from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { WarrantyView } from './WarrantyView';

export const metadata: Metadata = {
  title: 'Warranty Registrations — Trionyx Operations',
  description: 'Manage and register customer warranties for installed Trionyx products across regional dealers',
};

export const dynamic = 'force-dynamic';

export default async function DistributorWarrantyPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
    cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDistributorSession(token);
  } catch {
    redirect('/login');
  }

  const { user, distributor } = sessionData;

  // Fetch warranties and assigned dealers for this distributor territory
  const [warrantiesResult, dealersResult] = await Promise.all([
    warrantiesRepository.list({
      distributorId: distributor.id,
      limit: 100,
    }),
    dealersRepository.list({
      distributorId: distributor.id,
      limit: 100,
    }),
  ]);

  return (
    <DistributorShell user={user} distributor={distributor}>
      <WarrantyView
        initialWarranties={warrantiesResult.items}
        dealers={dealersResult.items}
        distributorId={distributor.id}
      />
    </DistributorShell>
  );
}
