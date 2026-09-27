import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealerUser, dealer } = await requireDealerSession(token);

    return NextResponse.json({
      success: true,
      user: dealerUser,
      dealer,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
