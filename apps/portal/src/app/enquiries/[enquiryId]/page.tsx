import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireEnquiryReadPermission, AUTH_CONFIG } from '@trionyx/auth';
import {
  contactEnquiriesRepository,
  enquiryNotesRepository,
  usersRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../../components/shell/InternalShell';
import { EnquiryDetailView } from './EnquiryDetailView';

export const dynamic = 'force-dynamic';

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ enquiryId: string }>;
}) {
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

  const { enquiryId } = await params;
  const enquiry = await contactEnquiriesRepository.findById(enquiryId);

  if (!enquiry) {
    notFound();
  }

  const [notes, internalUsers, duplicates] = await Promise.all([
    enquiryNotesRepository.listForEnquiry(enquiryId),
    usersRepository.listInternalUsers(),
    contactEnquiriesRepository.findDuplicates(enquiry.phone, enquiry.email || '', enquiry.id),
  ]);

  return (
    <InternalShell user={user}>
      <EnquiryDetailView
        enquiry={enquiry}
        initialNotes={notes}
        internalUsers={internalUsers}
        duplicates={duplicates}
        user={user}
      />
    </InternalShell>
  );
}
