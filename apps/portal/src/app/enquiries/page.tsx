import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireEnquiryReadPermission, AUTH_CONFIG } from '@trionyx/auth';
import {
  contactEnquiriesRepository,
  usersRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../components/shell/InternalShell';
import { EnquiriesTable } from './EnquiriesTable';

export const dynamic = 'force-dynamic';

export default async function EnquiriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireEnquiryReadPermission(token);
  } catch {
    redirect('/overview');
  }

  const { user } = authData;

  await ensureDatabaseReady();

  const [enquiriesRes, internalUsers] = await Promise.all([
    contactEnquiriesRepository.list({ limit: 100 }),
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
