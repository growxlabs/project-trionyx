import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import {
  dealerRequestsRepository,
  dealerRequestMessagesRepository,
  auditLogsRepository,
} from '@trionyx/database';
import { createDealerRequestMessageSchema } from '@trionyx/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealerUser, dealer } = await requireDealerSession(token);

    const { id } = await params;
    const reqItem = await dealerRequestsRepository.findById(id);

    // Multi-tenant check
    if (!reqItem || reqItem.dealerId !== dealer.id) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createDealerRequestMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid message' },
        { status: 400 }
      );
    }

    const message = await dealerRequestMessagesRepository.create({
      requestId: id,
      senderType: 'DEALER',
      senderId: dealerUser.id,
      senderName: dealerUser.name,
      body: parseResult.data.body,
    });

    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_REQUEST_MESSAGE_CREATED',
      metadata: {
        dealerUserId: dealerUser.id,
        dealerId: dealer.id,
        requestId: id,
        requestCode: reqItem.requestCode,
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer message creation error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
