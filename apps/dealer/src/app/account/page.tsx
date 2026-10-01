import React from 'react';
import type { Metadata } from 'next';
import { getDistributorSession } from '@/lib/auth';
import { DistributorShell } from '@/components/shell/DealerShell';
import { DistributorAccountView } from './DistributorAccountView';

export const metadata: Metadata = {
  title: 'My Account — Trionyx Distributor Workspace',
  description: 'Manage distributor details, regional profile, and security settings',
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { user, distributor } = await getDistributorSession();

  return (
    <DistributorShell user={user} distributor={distributor}>
      <DistributorAccountView
        user={user}
        distributor={distributor}
      />
    </DistributorShell>
  );
}
