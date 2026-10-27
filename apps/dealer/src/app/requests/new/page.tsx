import React from 'react';
import type { Metadata } from 'next';
import { getDistributorSession } from '@/lib/auth';
import { productsRepository, dealersRepository } from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { NewRequestForm } from './NewRequestForm';

export const metadata: Metadata = {
  title: 'New Request — Trionyx Distributor Workspace',
  description: 'Submit an inquiry or stock allocation request',
};

export const dynamic = 'force-dynamic';

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; subject?: string; type?: string }>;
}) {
  const { user, distributor } = await getDistributorSession();
  const resolvedParams = await searchParams;

  const [products, dealersResult] = await Promise.all([
    productsRepository.listDealerProducts(),
    dealersRepository.list({ distributorId: distributor.id, limit: 100 }),
  ]);

  return (
    <DistributorShell user={user} distributor={distributor}>
      <NewRequestForm
        products={products.map((p) => ({ id: p.id, name: p.name, code: p.productCode }))}
        dealers={dealersResult.items.map((d) => ({ id: d.id, name: d.businessName, code: d.dealerCode }))}
        initialProductId={resolvedParams.productId || ''}
        initialSubject={resolvedParams.subject || ''}
        initialType={resolvedParams.type || ''}
      />
    </DistributorShell>
  );
}
