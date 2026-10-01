import React from 'react';
import type { Metadata } from 'next';
import { getDistributorSession } from '@/lib/auth';
import { productsRepository, categoriesRepository } from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { ProductsView } from './ProductsView';

export const metadata: Metadata = {
  title: 'Products — Trionyx Distributor Workspace',
  description: 'Approved Regional Products & Formulations',
};

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { user, distributor } = await getDistributorSession();

  const [products, categories] = await Promise.all([
    productsRepository.listDealerProducts(),
    categoriesRepository.listAllActive(),
  ]);

  return (
    <DistributorShell user={user} distributor={distributor}>
      <ProductsView
        initialProducts={products}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </DistributorShell>
  );
}
