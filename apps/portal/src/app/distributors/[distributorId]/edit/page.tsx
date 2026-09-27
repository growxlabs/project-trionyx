import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { requireInternalUser, canManageDistributors, AUTH_CONFIG } from '@trionyx/auth';
import { distributorsRepository, ensureDatabaseReady } from '@trionyx/database';
import { InternalShell } from '../../../../components/shell/InternalShell';
import { DistributorForm } from '../../DistributorForm';

export const dynamic = 'force-dynamic';

export default async function EditDistributorPage({
  params,
}: {
  params: Promise<{ distributorId: string }>;
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

  if (!canManageDistributors(user.role)) {
    redirect('/distributors');
  }

  await ensureDatabaseReady();

  const { distributorId } = await params;
  const distributor = await distributorsRepository.findById(distributorId);

  if (!distributor) {
    notFound();
  }

  return (
    <InternalShell user={user}>
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
          {distributor.distributorCode}
        </span>
        <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
          Edit {distributor.businessName}
        </h1>
        <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
          Modify contact details, territorial assignments, and operating status.
        </p>
      </div>

      <DistributorForm initialData={distributor} isEditing />
    </InternalShell>
  );
}
