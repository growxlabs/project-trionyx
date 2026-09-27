import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, dealerUsersRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { AccountView } from './AccountView';

export const metadata: Metadata = {
  title: 'My Account — Trionyx Dealer Portal',
  description: 'Manage dealership details, contacts, authorized users and security',
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;

  const [dealerFull, users] = await Promise.all([
    dealersRepository.findById(dealer.id),
    dealerUsersRepository.listByDealer(dealer.id),
  ]);

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <AccountView
        dealer={dealerFull || dealer}
        currentUser={dealerUser}
        initialUsers={users}
      />
    </DealerShell>
  );
}
