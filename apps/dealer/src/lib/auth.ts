import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  requireDistributorSession,
  DISTRIBUTOR_AUTH_CONFIG,
  AUTH_CONFIG,
} from '@trionyx/auth';
import type { SafeUser, DistributorWithRelations } from '@trionyx/types';

export interface DistributorSessionData {
  user: SafeUser;
  distributor: DistributorWithRelations;
}

export async function getDistributorSession(): Promise<DistributorSessionData> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
    cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const sessionData = await requireDistributorSession(token);
    return {
      user: sessionData.user,
      distributor: sessionData.distributor,
    };
  } catch {
    redirect('/login');
  }
}
