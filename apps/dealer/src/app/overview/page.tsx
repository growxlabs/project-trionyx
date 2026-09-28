import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsRepository, productsRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { OverviewView } from './OverviewView';

export const metadata: Metadata = {
  title: 'Overview — Trionyx Dealer Portal',
  description: 'Dealer requests, product availability, and distributor contact',
};

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;
  const [openRequests, inProgressRequests, products] = await Promise.all([
    dealerRequestsRepository.list({ dealerId: dealer.id, status: 'OPEN', limit: 100 }),
    dealerRequestsRepository.list({ dealerId: dealer.id, status: 'IN_PROGRESS', limit: 100 }),
    productsRepository.listDealerProducts(),
  ]);

  const currentRequests = [...openRequests.items, ...inProgressRequests.items]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const productCounts = {
    available: products.filter((product) => product.availability === 'AVAILABLE').length,
    limited: products.filter((product) => product.availability === 'LIMITED').length,
    unavailable: products.filter((product) => product.availability === 'UNAVAILABLE').length,
  };

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <OverviewView
        dealer={dealer}
        distributor={dealer.distributor || null}
        openCount={openRequests.total}
        inProgressCount={inProgressRequests.total}
        currentRequests={currentRequests}
        productCounts={productCounts}
      />
    </DealerShell>
  );
}
