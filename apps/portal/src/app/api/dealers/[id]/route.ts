import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDealers, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, auditLogsRepository } from '@trionyx/database';
import { updateDealerSchema } from '@trionyx/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { id } = await params;
    const dealer = await dealersRepository.findById(id);
    if (!dealer) {
      return NextResponse.json({ success: false, error: 'Dealer not found' }, { status: 404 });
    }

    // Security Scoping: If user is DISTRIBUTOR role, verify dealer belongs to them
    if (user.role === 'DISTRIBUTOR' && dealer.distributorId !== user.distributorId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, dealer });
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

    if (!canManageDealers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to edit dealers.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parseResult = updateDealerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid dealer data' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check duplicate phone/email/gstin excluding this dealer
    if (data.phone || data.email || data.gstin) {
      const dupCheck = await dealersRepository.checkDuplicates({
        phone: data.phone || '',
        email: data.email,
        gstin: data.gstin,
        excludeId: id,
      });

      if (dupCheck) {
        return NextResponse.json(
          {
            success: false,
            error: `${dupCheck.duplicateField} is already registered to dealer "${dupCheck.existingDealerName}". Duplicate values are not allowed.`,
          },
          { status: 409 }
        );
      }
    }

    const updated = await dealersRepository.update(id, {
      ...data,
      updatedBy: user.id,
    });

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DEALER_UPDATED',
      metadata: JSON.stringify({
        dealerId: updated.id,
        dealerCode: updated.dealerCode,
        businessName: updated.businessName,
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
    console.error('Dealer update error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
