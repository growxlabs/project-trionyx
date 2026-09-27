import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsRepository, dealerRequestMessagesRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { RequestDetailView } from './RequestDetailView';

export const metadata: Metadata = {
  title: 'Request Details — Trionyx Dealer Portal',
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
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
  const { requestId } = await params;

  const item = await dealerRequestsRepository.findById(requestId);

  // Multi-tenant check: Request must exist and belong strictly to current dealer
  if (!item || item.dealerId !== dealer.id) {
    notFound();
  }

  const messages = await dealerRequestMessagesRepository.listByRequest(requestId);

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <RequestDetailView
        request={item}
        initialMessages={messages}
        currentUserId={dealerUser.id}
      />
    </DealerShell>
  );
}
