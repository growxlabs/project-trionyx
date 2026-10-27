import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  requireDistributorSession,
  DISTRIBUTOR_AUTH_CONFIG,
  AUTH_CONFIG,
  requireDealerSession,
  DEALER_AUTH_CONFIG,
} from '@trionyx/auth';
import type {
  SafeUser,
  DistributorWithRelations,
  SafeDealerUser,
  DealerWithRelations,
} from '@trionyx/types';

export interface DistributorSessionData {
  user: SafeUser;
  distributor: DistributorWithRelations;
}

export type WorkspaceSession =
  | {
      type: 'DISTRIBUTOR';
      user: SafeUser;
      distributor: DistributorWithRelations;
    }
  | {
      type: 'DEALER';
      dealerUser: SafeDealerUser;
      dealer: DealerWithRelations;
    };

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

export async function getWorkspaceSession(): Promise<WorkspaceSession> {
  const cookieStore = await cookies();

  // 1. Check for distributor or portal session
  const distToken =
    cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
    cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  if (distToken) {
    try {
      const sessionData = await requireDistributorSession(distToken);
      return {
        type: 'DISTRIBUTOR',
        user: sessionData.user,
        distributor: sessionData.distributor,
      };
    } catch {
      // Continue to check dealer token
    }
  }

  // 2. Check for dealer session
  const dealerToken = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
  if (dealerToken) {
    try {
      const sessionData = await requireDealerSession(dealerToken);
      return {
        type: 'DEALER',
        dealerUser: sessionData.dealerUser,
        dealer: sessionData.dealer,
      };
    } catch {
      // Unauthenticated
    }
  }

  throw new Error('UNAUTHENTICATED');
}
