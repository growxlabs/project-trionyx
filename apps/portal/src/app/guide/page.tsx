import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { PortalGuideView } from './PortalGuideView';

export const metadata: Metadata = {
  title: 'Operations Guide — Trionyx Operations',
  description: 'Step-by-step handbook for Managing Directors, Operations, and Administrators',
};

export const dynamic = 'force-dynamic';

export default async function GuidePage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  return (
    <InternalShell user={user}>
      <PortalGuideView user={user} />
    </InternalShell>
  );
}
