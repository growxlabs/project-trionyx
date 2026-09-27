import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { productsRepository, categoriesRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { AvailabilityView } from './AvailabilityView';

export const metadata: Metadata = {
  title: 'Availability — Trionyx Dealer Portal',
  description: 'Real-time Stock Availability for Dealers',
};

export default async function AvailabilityPage() {
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

  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    productCode: p.productCode,
    categoryName: p.categoryName || 'General',
    availability: p.availability,
    lastUpdated: p.lastUpdated,
  }));

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <AvailabilityView
        initialItems={items}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </DealerShell>
  );
}
