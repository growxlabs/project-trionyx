import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsRepository, auditLogsRepository } from '@trionyx/database';
import { createDealerPortalRequestSchema } from '@trionyx/validation';
import type { DealerRequestStatus, DealerRequestType } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealer } = await requireDealerSession(token);

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as DealerRequestStatus) || undefined;
    const type = (searchParams.get('type') as DealerRequestType) || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    // Strict multi-tenant isolation: always force dealerId = dealer.id
    const { items, total } = await dealerRequestsRepository.list({
      dealerId: dealer.id,
      status: status !== ('ALL' as any) ? status : undefined,
      type: type !== ('ALL' as any) ? type : undefined,
      page,
      limit,
    });

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
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealerUser, dealer } = await requireDealerSession(token);

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

    // Create request strictly bound to the authenticated session's dealer
    const created = await dealerRequestsRepository.create({
      dealerId: dealer.id,
      productId: data.productId || null,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      createdBy: dealerUser.id,
    });

    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_REQUEST_CREATED',
      metadata: {
        dealerUserId: dealerUser.id,
        dealerId: dealer.id,
        dealerCode: dealer.dealerCode,
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
