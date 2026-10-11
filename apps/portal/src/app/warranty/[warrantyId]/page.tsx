import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { warrantiesService } from '@trionyx/api';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../../components/shell/InternalShell';
import { WarrantyDetailView } from './WarrantyDetailView';

export const dynamic = 'force-dynamic';

export default async function WarrantyDetailPage({
  params,
}: {
  params: Promise<{ warrantyId: string }>;
}) {
  const { warrantyId } = await params;

  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;

  // Distributors should not view warranties
  if (user.role === 'DISTRIBUTOR') {
    redirect('/overview');
  }

  // Warranty is strictly Trionyx-only
  if (activeOrg.slug !== 'trionyx') {
    redirect('/overview');
  }

  const record = await warrantiesService.getWarrantyById(warrantyId);
  if (!record) {
    notFound();
  }

  return (
    <InternalShell user={user} activeOrg={activeOrg} memberships={authData.memberships}>
      <WarrantyDetailView
        warranty={record.warranty}
        auditLogs={record.auditLogs}
        user={user}
      />
    </InternalShell>
  );
}

