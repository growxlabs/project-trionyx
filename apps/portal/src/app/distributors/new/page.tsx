import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, canManageDistributors, AUTH_CONFIG } from '@trionyx/auth';
import { InternalShell } from '../../../components/shell/InternalShell';
import { DistributorForm } from '../DistributorForm';

export const dynamic = 'force-dynamic';

export default async function NewDistributorPage() {
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

  return (
    <InternalShell user={user}>
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <span className="text-[12px] font-medium text-[var(--text-muted)] block mb-1">
          Network Operations
        </span>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight m-0">
          Register New Distributor
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 m-0">
          Add an authorized regional distributor partner to the Trionyx distribution network.
        </p>
      </div>

      <DistributorForm />
    </InternalShell>
  );
}
