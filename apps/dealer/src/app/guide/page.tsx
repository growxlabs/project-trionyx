import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  requireDistributorSession,
  DISTRIBUTOR_AUTH_CONFIG,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { DistributorShell } from '@/components/shell/DealerShell';
import { DistributorGuideView } from './DistributorGuideView';

export const metadata: Metadata = {
  title: 'Distributor Guide — Trionyx Operations',
  description: 'Operations handbook for regional distributors and authorized studios',
};

export const dynamic = 'force-dynamic';

export default async function DistributorGuidePage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
    cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDistributorSession(token);
  } catch {
    redirect('/login');
  }

  const { user, distributor } = sessionData;

  return (
    <DistributorShell user={user} distributor={distributor}>
      <DistributorGuideView user={user} distributor={distributor} />
    </DistributorShell>
  );
}
