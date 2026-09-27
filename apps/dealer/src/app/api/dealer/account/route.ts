import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, dealerUsersRepository, auditLogsRepository } from '@trionyx/database';
import { updateDealerProfileByDealerSchema } from '@trionyx/validation';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealerUser, dealer } = await requireDealerSession(token);

    // Get authorized portal users for this dealer business
    const users = await dealerUsersRepository.listByDealer(dealer.id);

    return NextResponse.json({
      success: true,
      dealer,
      currentUser: dealerUser,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer account GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealerUser, dealer } = await requireDealerSession(token);

    const body = await request.json().catch(() => ({}));
    const parseResult = updateDealerProfileByDealerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid profile data',
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check duplicate phone/email excluding this dealer
    if (data.phone || data.email) {
      const dup = await dealersRepository.checkDuplicates({
        phone: data.phone || '',
        email: data.email,
        excludeId: dealer.id,
      });

      if (dup) {
        return NextResponse.json(
          {
            success: false,
            error: `${dup.duplicateField} is already registered to another dealer business.`,
          },
          { status: 409 }
        );
      }
    }

    // Update only permitted fields (strictly ignoring dealerCode, status, distributorId, gstin, legalName)
    const updated = await dealersRepository.update(dealer.id, {
      contactPerson: data.contactPerson,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      email: data.email,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      updatedBy: dealer.updatedBy || dealer.createdBy,
    });

    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_ACCOUNT_UPDATED',
      metadata: {
        dealerUserId: dealerUser.id,
        dealerId: dealer.id,
        dealerCode: dealer.dealerCode,
        updatedFields: Object.keys(data),
      },
    });

    return NextResponse.json({
      success: true,
      dealer: updated,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer account PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
