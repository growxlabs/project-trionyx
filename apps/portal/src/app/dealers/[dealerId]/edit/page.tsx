import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireInternalUser, canManageDealers, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, distributorsRepository, ensureDatabaseReady } from '@trionyx/database';
import { InternalShell } from '../../../../components/shell/InternalShell';
import { DealerForm } from '../../DealerForm';

export const dynamic = 'force-dynamic';

export default async function EditDealerPage({
  params,
}: {
  params: Promise<{ dealerId: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  if (!canManageDealers(user.role)) {
    redirect('/dealers');
  }

  await ensureDatabaseReady();

  const { dealerId } = await params;
  const dealer = await dealersRepository.findById(dealerId);

  if (!dealer) {
    notFound();
  }

  const distributors = await distributorsRepository.listAllActive();

  return (
    <InternalShell user={user}>
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <span className="font-mono text-[12px] font-medium text-[var(--text-secondary)] block mb-1">
          {dealer.dealerCode}
        </span>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight m-0">
          Edit {dealer.businessName}
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 m-0">
          Modify contact details, studio specifications, and operational status.
        </p>
      </div>

      <DealerForm initialData={dealer} distributors={distributors} isEditing />
    </InternalShell>
  );
}
