import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsRepository, dealerRequestMessagesRepository } from '@trionyx/database';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealer } = await requireDealerSession(token);

    const { id } = await params;
    const item = await dealerRequestsRepository.findById(id);

    // Multi-tenant check: if request does not exist or belongs to another dealer, return 404
    if (!item || item.dealerId !== dealer.id) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
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
