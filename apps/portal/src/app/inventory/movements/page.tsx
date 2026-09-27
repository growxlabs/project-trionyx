import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  serialMovementsRepository,
  locationsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../../components/shell/InternalShell';
import { MovementsTable } from './MovementsTable';

export const dynamic = 'force-dynamic';

export default async function MovementsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  await ensureDatabaseReady();

  const [movements, locations] = await Promise.all([
    serialMovementsRepository.listWithDetails({ limit: 200 }),
    locationsRepository.list(),
  ]);

  return (
    <InternalShell user={user}>
      <MovementsTable initialMovements={movements} locations={locations} />
    </InternalShell>
  );
}
