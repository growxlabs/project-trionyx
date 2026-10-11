import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireEnquiryReadPermission, AUTH_CONFIG } from '@trionyx/auth';
import {
  contactEnquiriesRepository,
  usersRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { EnquiriesTable } from './EnquiriesTable';

export const dynamic = 'force-dynamic';

export default async function EnquiriesPage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
    if (authData.user.role !== 'MANAGING_DIRECTOR' && authData.user.role !== 'ADMIN' && authData.user.role !== 'STAFF') {
      redirect('/overview');
    }
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;

  await ensureDatabaseReady();

  const [enquiriesRes, internalUsers] = await Promise.all([
    contactEnquiriesRepository.list({ limit: 100, organizationId: activeOrg.id }),
    usersRepository.listInternalUsers(),
  ]);

  return (
    <InternalShell user={user}>
      <EnquiriesTable
        initialEnquiries={enquiriesRes.items}
        internalUsers={internalUsers}
        user={user}
      />
    </InternalShell>
  );
}
