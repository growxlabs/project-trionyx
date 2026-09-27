import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { productsRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { NewRequestForm } from './NewRequestForm';

export const metadata: Metadata = {
  title: 'New Request — Trionyx Dealer Portal',
  description: 'Submit an inquiry or stock allocation request',
};

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; subject?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;
  const resolvedParams = await searchParams;

  const products = await productsRepository.listDealerProducts();

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <NewRequestForm
        products={products.map((p) => ({ id: p.id, name: p.name, code: p.productCode }))}
        initialProductId={resolvedParams.productId || ''}
        initialSubject={resolvedParams.subject || ''}
      />
    </DealerShell>
  );
}
