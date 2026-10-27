import { NextResponse } from 'next/server';
import { getWorkspaceSession } from '@/lib/auth';
import {
  dealerRequestsRepository,
  dealersRepository,
  auditLogsRepository,
} from '@trionyx/database';
import { createDealerPortalRequestSchema } from '@trionyx/validation';
import type { DealerRequestStatus, DealerRequestType } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const session = await getWorkspaceSession();

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as DealerRequestStatus) || undefined;
    const type = (searchParams.get('type') as DealerRequestType) || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    const filter: {
      dealerId?: string;
      distributorId?: string;
      status?: DealerRequestStatus;
      type?: DealerRequestType;
      page: number;
      limit: number;
    } = {
      status: status !== ('ALL' as any) ? status : undefined,
      type: type !== ('ALL' as any) ? type : undefined,
      page,
      limit,
    };

    if (session.type === 'DEALER') {
      filter.dealerId = session.dealer.id;
    } else {
      filter.distributorId = session.distributor.id;
    }

    const { items, total } = await dealerRequestsRepository.list(filter);

    return NextResponse.json({
      success: true,
      requests: items,
      total,
      page,
      limit,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer requests GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSession();

    const body = await request.json().catch(() => ({}));
    const parseResult = createDealerPortalRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid request data',
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    let targetDealerId: string;
    let createdByUserId: string;
    let auditMetadata: Record<string, unknown>;

    if (session.type === 'DEALER') {
      targetDealerId = session.dealer.id;
      createdByUserId = session.dealerUser.id;
      auditMetadata = {
        dealerUserId: session.dealerUser.id,
        dealerId: session.dealer.id,
        dealerCode: session.dealer.dealerCode,
      };
    } else {
      // Distributor session
      const distributor = session.distributor;
      createdByUserId = session.user.id;

      if (body.dealerId && typeof body.dealerId === 'string') {
        const assignedDealer = await dealersRepository.findById(body.dealerId);
        if (!assignedDealer || assignedDealer.distributorId !== distributor.id) {
          return NextResponse.json(
            { success: false, error: 'Selected dealer is not in your regional territory' },
            { status: 403 }
          );
        }
        targetDealerId = assignedDealer.id;
      } else {
        const territoryDealers = await dealersRepository.list({
          distributorId: distributor.id,
          limit: 1,
        });

        if (territoryDealers.items.length > 0) {
          targetDealerId = territoryDealers.items[0].id;
        } else {
          // If no dealer exists yet in this territory, resolve/create a primary territory dealership entry
          const directDealer = await dealersRepository.create({
            businessName: `${distributor.businessName} (Direct)`,
            contactPerson: distributor.contactPerson || distributor.businessName,
            phone: distributor.phone || '0000000000',
            email: distributor.email || null,
            city: distributor.city || 'Central',
            state: distributor.state || 'Central',
            distributorId: distributor.id,
            createdBy: session.user.id,
          });
          targetDealerId = directDealer.id;
        }
      }

      auditMetadata = {
        userId: session.user.id,
        distributorId: distributor.id,
        distributorCode: distributor.distributorCode,
        dealerId: targetDealerId,
      };
    }

    const created = await dealerRequestsRepository.create({
      dealerId: targetDealerId,
      productId: data.productId || null,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      createdBy: createdByUserId,
    });

    await auditLogsRepository.recordEvent({
      userId: session.type === 'DISTRIBUTOR' ? session.user.id : null,
      event: 'DEALER_REQUEST_CREATED',
      metadata: {
        ...auditMetadata,
        requestId: created.id,
        requestCode: created.requestCode,
        subject: created.subject,
        type: created.type,
      },
    });

    return NextResponse.json({ success: true, request: created }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer request POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
