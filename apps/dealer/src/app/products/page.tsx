import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { productsRepository, categoriesRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { ProductsView } from './ProductsView';

export const metadata: Metadata = {
  title: 'Products — Trionyx Dealer Portal',
  description: 'Approved Dealer Products & Formulations',
};

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;

  const [products, categories] = await Promise.all([
    productsRepository.listDealerProducts(),
    categoriesRepository.listAllActive(),
  ]);

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <ProductsView
        initialProducts={products}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </DealerShell>
  );
}
