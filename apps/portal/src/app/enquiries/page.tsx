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
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
              INBOUND PIPELINE
            </span>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
              Enquiries
            </h1>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
              Inbound website product enquiries, dealer and distribution applications, and support requests.
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-[12px] font-medium text-[var(--text-secondary)]">
              {enquiriesRes.total} total enquir{enquiriesRes.total === 1 ? 'y' : 'ies'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table & Filters */}
      <EnquiriesTable
        initialEnquiries={enquiriesRes.items}
        internalUsers={internalUsers}
        user={user}
      />
    </InternalShell>
  );
}
