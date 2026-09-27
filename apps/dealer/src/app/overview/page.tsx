import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsRepository, auditLogsRepository } from '@trionyx/database';
import { DealerShell } from '@/components/shell/DealerShell';
import { OverviewView } from './OverviewView';
import type { DealerActivityItem } from '@trionyx/types';

export const metadata: Metadata = {
  title: 'Overview — Trionyx Dealer Portal',
  description: 'Authorized Dealer Dashboard',
};

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  let sessionData;
  try {
    sessionData = await requireDealerSession(token);
  } catch {
    cookieStore.delete(DEALER_AUTH_CONFIG.cookieName);
    redirect('/login');
  }

  const { dealerUser, dealer } = sessionData;

  // 1. Fetch live open requests count
  const requestsResult = await dealerRequestsRepository.list({
    dealerId: dealer.id,
    limit: 100,
  });
  const openRequestsCount = requestsResult.items.filter(
    (r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS'
  ).length;

  // 2. Fetch recent activity from audit logs
  const rawAudit = await auditLogsRepository.list({ limit: 20 });
  const recentActivity: DealerActivityItem[] = [];

  for (const log of rawAudit) {
    let isDealerEvent = false;
    let type: DealerActivityItem['type'] = 'LOGIN';
    let description = '';

    if (log.userId === dealerUser.id) {
      if (log.event === 'DEALER_LOGIN_SUCCESS') {
        type = 'LOGIN';
        description = 'Signed in to Dealer Portal';
        isDealerEvent = true;
      } else if (log.event === 'DEALER_PASSWORD_CHANGED') {
        type = 'PASSWORD_CHANGED';
        description = 'Account password updated';
        isDealerEvent = true;
      }
    }

    if (!isDealerEvent && log.metadata) {
      try {
        const meta = JSON.parse(log.metadata);
        if (meta.dealerId === dealer.id) {
          if (log.event === 'DEALER_REQUEST_CREATED') {
            type = 'REQUEST_CREATED';
            description = `Product request created (${meta.requestCode || 'TRX-REQ'})`;
            isDealerEvent = true;
          } else if (log.event === 'DEALER_REQUEST_UPDATED' || log.event === 'DEALER_REQUEST_RESOLVED') {
            type = 'REQUEST_UPDATED';
            description = `Request status updated to ${meta.newStatus || 'UPDATED'}`;
            isDealerEvent = true;
          } else if (log.event === 'DEALER_ACCOUNT_UPDATED' || log.event === 'DEALER_UPDATED') {
            type = 'ACCOUNT_UPDATED';
            description = 'Dealer account details updated';
            isDealerEvent = true;
          }
        }
      } catch {
        // ignore
      }
    }

    if (isDealerEvent) {
      recentActivity.push({
        id: log.id,
        type,
        description,
        timestamp: log.createdAt,
      });
      if (recentActivity.length >= 6) break;
    }
  }

  return (
    <DealerShell user={dealerUser} dealer={dealer}>
      <OverviewView
        user={dealerUser}
        dealer={dealer}
        distributor={dealer.distributor || null}
        openRequestsCount={openRequestsCount}
        recentActivity={recentActivity}
      />
    </DealerShell>
  );
}
