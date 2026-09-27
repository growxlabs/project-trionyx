import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { warrantiesService } from '@trionyx/api';
import { InternalShell } from '../../../components/shell/InternalShell';
import { WarrantyDetailView } from './WarrantyDetailView';

export const dynamic = 'force-dynamic';

export default async function WarrantyDetailPage({
  params,
}: {
  params: Promise<{ warrantyId: string }>;
}) {
  const { warrantyId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  if (user.role === 'DISTRIBUTOR') {
    redirect('/overview');
  }

  const record = await warrantiesService.getWarrantyById(warrantyId);
  if (!record) {
    notFound();
  }

  return (
    <InternalShell user={user}>
      <WarrantyDetailView
        warranty={record.warranty}
        auditLogs={record.auditLogs}
        user={user}
      />
    </InternalShell>
  );
}
