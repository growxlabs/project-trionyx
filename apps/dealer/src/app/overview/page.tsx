import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  requireDistributorSession,
  DISTRIBUTOR_AUTH_CONFIG,
  AUTH_CONFIG,
} from '@trionyx/auth';
import {
  dealerRequestsRepository,
  dealersRepository,
  productsRepository,
} from '@trionyx/database';
import { DistributorShell } from '@/components/shell/DealerShell';
import { OverviewView } from './OverviewView';

export const metadata: Metadata = {
  title: 'Distributor Overview — Trionyx Operations',
  description: 'Regional dealer network, request queue, and inventory availability',
};

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
    cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDistributorSession(token);
  } catch (err) {
    redirect('/login');
  }

  const { user, distributor } = sessionData;

  // Strictly scoped to the authenticated distributor ID
  const [
    openRequests,
    inProgressRequests,
    recentRequests,
    dealersResult,
    activeDealerCount,
    products,
  ] = await Promise.all([
    dealerRequestsRepository.list({
      distributorId: distributor.id,
      status: 'OPEN',
      limit: 100,
    }),
    dealerRequestsRepository.list({
      distributorId: distributor.id,
      status: 'IN_PROGRESS',
      limit: 100,
    }),
    dealerRequestsRepository.list({
      distributorId: distributor.id,
      limit: 6,
    }),
    dealersRepository.list({
      distributorId: distributor.id,
      limit: 6,
    }),
    dealersRepository.countActive(distributor.id),
    productsRepository.listDealerProducts(),
  ]);

  const productCounts = {
    available: products.filter((product) => product.availability === 'AVAILABLE').length,
    limited: products.filter((product) => product.availability === 'LIMITED').length,
    unavailable: products.filter((product) => product.availability === 'UNAVAILABLE').length,
  };

  return (
    <DistributorShell user={user} distributor={distributor}>
      <OverviewView
        distributor={distributor}
        user={user}
        openCount={openRequests.total}
        inProgressCount={inProgressRequests.total}
        requestQueue={recentRequests.items}
        dealers={dealersResult.items}
        totalDealerCount={dealersResult.total}
        activeDealerCount={activeDealerCount}
        productCounts={productCounts}
      />
    </DistributorShell>
  );
}
