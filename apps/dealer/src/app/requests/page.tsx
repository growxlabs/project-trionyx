import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { RequestsView } from './RequestsView';

export const metadata: Metadata = {
  title: 'My Requests — Trionyx Dealer Portal',
  description: 'Track and manage your requests and queries with Trionyx',
};

export default async function RequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;

  const result = await dealerRequestsRepository.list({
    dealerId: dealer.id,
    limit: 100,
  });

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <RequestsView initialRequests={result.items} />
    </DealerShell>
  );
}
