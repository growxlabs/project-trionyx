import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDistributors, AUTH_CONFIG } from '@trionyx/auth';
import { distributorsRepository, auditLogsRepository } from '@trionyx/database';
import { updateDistributorSchema } from '@trionyx/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { id } = await params;

    // Security Scoping: Distributor users can only view their own distributor record
    if (user.role === 'DISTRIBUTOR' && user.distributorId !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const distributor = await distributorsRepository.findById(id);
    if (!distributor) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, distributor });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

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
        { success: false, error: 'You do not have permission to edit distributors.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parseResult = updateDistributorSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid distributor data' },
        { status: 400 }
      );
    }

    const updated = await distributorsRepository.update(id, {
      ...parseResult.data,
      updatedBy: user.id,
    });

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DISTRIBUTOR_UPDATED',
      metadata: JSON.stringify({
        distributorId: updated.id,
        distributorCode: updated.distributorCode,
        businessName: updated.businessName,
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
    console.error('Distributor update error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
