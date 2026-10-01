import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDistributorSession } from '@/lib/auth';
import { dealerRequestsRepository, dealerRequestMessagesRepository } from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { RequestDetailView } from './RequestDetailView';

export const metadata: Metadata = {
  title: 'Request Details — Trionyx Distributor Workspace',
};

export const dynamic = 'force-dynamic';

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { user, distributor } = await getDistributorSession();
  const { requestId } = await params;

  const item = await dealerRequestsRepository.findById(requestId);

  if (!item) {
    notFound();
  }

  const messages = await dealerRequestMessagesRepository.listByRequest(requestId);

  return (
    <DistributorShell user={user} distributor={distributor}>
      <RequestDetailView
        request={item}
        initialMessages={messages}
        currentUserId={user.id}
      />
    </DistributorShell>
  );
}
