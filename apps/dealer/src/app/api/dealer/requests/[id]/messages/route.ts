import { NextResponse } from 'next/server';
import { getWorkspaceSession } from '@/lib/auth';
import {
  dealerRequestsRepository,
  dealerRequestMessagesRepository,
  dealersRepository,
  auditLogsRepository,
} from '@trionyx/database';
import { createDealerRequestMessageSchema } from '@trionyx/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getWorkspaceSession();

    const { id } = await params;
    const reqItem = await dealerRequestsRepository.findById(id);

    if (!reqItem) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Tenancy isolation check
    if (session.type === 'DEALER') {
      if (reqItem.dealerId !== session.dealer.id) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }
    } else {
      const itemDealer = await dealersRepository.findById(reqItem.dealerId);
      if (!itemDealer || itemDealer.distributorId !== session.distributor.id) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createDealerRequestMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid message' },
        { status: 400 }
      );
    }

    const isDealerSession = session.type === 'DEALER';
    const senderType = isDealerSession ? 'DEALER' : 'INTERNAL';
    const senderId = isDealerSession ? session.dealerUser.id : session.user.id;
    const senderName = isDealerSession
      ? session.dealerUser.name
      : session.user.name || session.distributor.businessName;

    const message = await dealerRequestMessagesRepository.create({
      requestId: id,
      senderType,
      senderId,
      senderName,
      body: parseResult.data.body,
    });

    await auditLogsRepository.recordEvent({
      userId: isDealerSession ? null : session.user.id,
      event: 'DEALER_REQUEST_MESSAGE_CREATED',
      metadata: {
        senderType,
        senderId,
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
