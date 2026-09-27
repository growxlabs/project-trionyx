import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDistributors, AUTH_CONFIG } from '@trionyx/auth';
import { distributorsRepository, auditLogsRepository } from '@trionyx/database';
import { distributorStatusSchema } from '@trionyx/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDistributors(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to change distributor status.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parseResult = distributorStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid status' },
        { status: 400 }
      );
    }

    const updated = await distributorsRepository.updateStatus(id, parseResult.data.status, user.id);

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DISTRIBUTOR_STATUS_CHANGED',
      metadata: JSON.stringify({
        distributorId: updated.id,
        distributorCode: updated.distributorCode,
        newStatus: updated.status,
      }),
    });

    return NextResponse.json({ success: true, distributor: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Distributor status update error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
