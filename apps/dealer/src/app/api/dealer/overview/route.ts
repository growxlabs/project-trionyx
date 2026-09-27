import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsRepository, auditLogsRepository } from '@trionyx/database';
import type { DealerActivityItem } from '@trionyx/types';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealerUser, dealer } = await requireDealerSession(token);

    // 1. Get open requests count for this dealer
    const requestsResult = await dealerRequestsRepository.list({
      dealerId: dealer.id,
      limit: 100,
    });
    const openRequestsCount = requestsResult.items.filter(
      (r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS'
    ).length;

    // 2. Derive Dealer-Safe Recent Activity
    // Fetch recent dealer-relevant audit logs without leaking internal fields
    const rawAudit = await auditLogsRepository.list({
      limit: 20,
    });

    const recentActivity: DealerActivityItem[] = [];
    for (const log of rawAudit) {
      // Filter logs related to this dealer or this dealer's user
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
          // ignore parsing error
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

    return NextResponse.json({
      success: true,
      data: {
        dealerUser,
        dealer: {
          id: dealer.id,
          dealerCode: dealer.dealerCode,
          businessName: dealer.businessName,
          status: dealer.status,
          city: dealer.city,
          state: dealer.state,
          contactPerson: dealer.contactPerson,
          phone: dealer.phone,
          email: dealer.email,
        },
        assignedDistributor: dealer.distributor
          ? {
              id: dealer.distributor.id,
              distributorCode: dealer.distributor.distributorCode,
              businessName: dealer.distributor.businessName,
              city: dealer.distributor.city,
              state: dealer.distributor.state,
              contactPerson: dealer.distributor.contactPerson,
              phone: dealer.distributor.phone,
            }
          : null,
        openRequestsCount,
        recentActivity,
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer overview API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
