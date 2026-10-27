import { NextResponse } from 'next/server';
import { getWorkspaceSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getWorkspaceSession();

    if (session.type === 'DEALER') {
      return NextResponse.json({
        success: true,
        user: session.dealerUser,
        dealer: session.dealer,
        role: 'DEALER',
      });
    }

    return NextResponse.json({
      success: true,
      user: session.user,
      distributor: session.distributor,
      role: session.user.role,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
