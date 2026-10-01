import React from 'react';
import type { Metadata } from 'next';
import { getDistributorSession } from '@/lib/auth';
import { productsRepository, categoriesRepository } from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { AvailabilityView } from './AvailabilityView';

export const metadata: Metadata = {
  title: 'Availability — Trionyx Distributor Workspace',
  description: 'Real-time Stock Availability for Regional Territory',
};

export const dynamic = 'force-dynamic';

export default async function AvailabilityPage() {
  const { user, distributor } = await getDistributorSession();

  const [products, categories] = await Promise.all([
    productsRepository.listDealerProducts(),
    categoriesRepository.listAllActive(),
  ]);

  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    productCode: p.productCode,
    categoryName: p.categoryName || 'General',
    availability: p.availability,
    lastUpdated: p.lastUpdated,
  }));

  return (
    <DistributorShell user={user} distributor={distributor}>
      <AvailabilityView
        initialItems={items}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </DistributorShell>
  );
}
