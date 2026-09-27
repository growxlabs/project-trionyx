import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDealers, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, auditLogsRepository } from '@trionyx/database';
import { dealerStatusSchema } from '@trionyx/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDealers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to change dealer status.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parseResult = dealerStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid status' },
        { status: 400 }
      );
    }

    const updated = await dealersRepository.updateStatus(id, parseResult.data.status, user.id);

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DEALER_STATUS_CHANGED',
      metadata: JSON.stringify({
        dealerId: updated.id,
        dealerCode: updated.dealerCode,
        newStatus: updated.status,
      }),
    });

    return NextResponse.json({ success: true, dealer: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Dealer status update error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
