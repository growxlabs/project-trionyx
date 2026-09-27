import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { warrantiesRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { WarrantyView } from './WarrantyView';

export const metadata: Metadata = {
  title: 'Warranty Registrations — Trionyx Dealer Portal',
  description: 'Manage and register customer warranties for installed Trionyx products',
};

export default async function DealerWarrantyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;

  // Fetch warranties activated by this dealer
  const result = await warrantiesRepository.list({
    dealerId: dealer.id,
    limit: 100,
  });

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <WarrantyView initialWarranties={result.items} />
    </DealerShell>
  );
}
