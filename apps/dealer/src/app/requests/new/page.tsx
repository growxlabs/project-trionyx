import React from 'react';
import type { Metadata } from 'next';
import { getDistributorSession } from '@/lib/auth';
import { productsRepository } from '@trionyx/database';
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
  searchParams: Promise<{ productId?: string; subject?: string }>;
}) {
  const { user, distributor } = await getDistributorSession();
  const resolvedParams = await searchParams;

  const products = await productsRepository.listDealerProducts();

  return (
    <DistributorShell user={user} distributor={distributor}>
      <NewRequestForm
        products={products.map((p) => ({ id: p.id, name: p.name, code: p.productCode }))}
        initialProductId={resolvedParams.productId || ''}
        initialSubject={resolvedParams.subject || ''}
      />
    </DistributorShell>
  );
}
