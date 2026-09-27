import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, dealerRequestsRepository, auditLogsRepository } from '@trionyx/database';
import { updateDealerRequestStatusSchema } from '@trionyx/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { id, requestId } = await params;
    const dealer = await dealersRepository.findById(id);
    if (!dealer) {
      return NextResponse.json({ success: false, error: 'Dealer not found' }, { status: 404 });
    }

    if (user.role === 'DISTRIBUTOR' && dealer.distributorId !== user.distributorId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateDealerRequestStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid status data' },
        { status: 400 }
      );
    }

    const updated = await dealerRequestsRepository.updateStatus(requestId, {
      status: parseResult.data.status,
      assignedTo: parseResult.data.assignedTo,
    });

    const isResolved = updated.status === 'RESOLVED';
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: isResolved ? 'DEALER_REQUEST_RESOLVED' : 'DEALER_REQUEST_UPDATED',
      metadata: JSON.stringify({
        dealerId: id,
        requestId: updated.id,
        requestCode: updated.requestCode,
        newStatus: updated.status,
      }),
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update request status error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
