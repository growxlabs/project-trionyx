import React from 'react';
import type { Metadata } from 'next';
import { getDistributorSession } from '@/lib/auth';
import { dealersRepository } from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { DealersView } from './DealersView';

export const metadata: Metadata = {
  title: 'My Dealers — Trionyx Distributor Workspace',
  description: 'Regional dealer network and authorized detailing studios',
};

export const dynamic = 'force-dynamic';

export default async function DealersPage() {
  const { user, distributor } = await getDistributorSession();

  const dealersResult = await dealersRepository.list({
    distributorId: distributor.id,
    limit: 100,
  });

  return (
    <DistributorShell user={user} distributor={distributor}>
      <DealersView initialDealers={dealersResult.items} />
    </DistributorShell>
  );
}
