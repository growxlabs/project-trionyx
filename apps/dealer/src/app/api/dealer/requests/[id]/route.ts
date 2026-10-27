import { NextResponse } from 'next/server';
import { getWorkspaceSession } from '@/lib/auth';
import {
  dealerRequestsRepository,
  dealerRequestMessagesRepository,
  dealersRepository,
} from '@trionyx/database';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getWorkspaceSession();

    const { id } = await params;
    const item = await dealerRequestsRepository.findById(id);

    if (!item) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Tenancy isolation check
    if (session.type === 'DEALER') {
      if (item.dealerId !== session.dealer.id) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }
    } else {
      const itemDealer = await dealersRepository.findById(item.dealerId);
      if (!itemDealer || itemDealer.distributorId !== session.distributor.id) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }
    }

    const messages = await dealerRequestMessagesRepository.listByRequest(id);

    return NextResponse.json({
      success: true,
      request: item,
      messages,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer request detail GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
