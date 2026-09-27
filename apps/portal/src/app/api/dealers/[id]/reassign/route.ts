import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canReassignDistributor, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, auditLogsRepository } from '@trionyx/database';
import { reassignDealerDistributorSchema } from '@trionyx/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canReassignDistributor(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only Managing Directors and Administrators can reassign dealer distributors.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parseResult = reassignDealerDistributorSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid reassignment data' },
        { status: 400 }
      );
    }

    const newDistributorId = parseResult.data.newDistributorId || null;
    const reason = parseResult.data.reason;

    const { dealer, history } = await dealersRepository.reassignDistributor(
      id,
      newDistributorId,
      reason,
      user.id
    );

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DEALER_DISTRIBUTOR_REASSIGNED',
      metadata: JSON.stringify({
        dealerId: dealer.id,
        dealerCode: dealer.dealerCode,
        previousDistributorId: history.previousDistributorId,
        newDistributorId: history.newDistributorId,
        reason,
      }),
    });

    return NextResponse.json({ success: true, dealer, history });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Dealer reassignment error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
