import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDealers, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, auditLogsRepository } from '@trionyx/database';
import { createDealerSchema } from '@trionyx/validation';
import type { DealerStatus } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as DealerStatus) || undefined;
    const state = searchParams.get('state') || undefined;
    const unassignedOnly = searchParams.get('unassignedOnly') === 'true';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    // Security Scoping: If user is DISTRIBUTOR role, server forces filtering by their distributorId
    let distributorId: string | null | undefined = searchParams.get('distributorId') || undefined;
    if (user.role === 'DISTRIBUTOR') {
      distributorId = user.distributorId || 'UNASSIGNED';
    }

    const { items, total } = await dealersRepository.list({
      search,
      status,
      state,
      distributorId,
      unassignedOnly: user.role === 'DISTRIBUTOR' ? false : unassignedOnly,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      dealers: items,
      total,
      page,
      limit,
    });
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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDealers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to create dealers.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createDealerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid dealer data' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Duplicate check for phone, email, GSTIN
    const dupCheck = await dealersRepository.checkDuplicates({
      phone: data.phone,
      email: data.email,
      gstin: data.gstin,
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

    const dealer = await dealersRepository.create({
      businessName: data.businessName,
      legalName: data.legalName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      email: data.email || null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      district: data.district,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      distributorId: data.distributorId || null,
      status: data.status,
      gstin: data.gstin,
      notes: data.notes,
      createdBy: user.id,
    });

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DEALER_CREATED',
      metadata: JSON.stringify({
        dealerId: dealer.id,
        dealerCode: dealer.dealerCode,
        businessName: dealer.businessName,
      }),
    });

    if (dealer.distributorId) {
      await auditLogsRepository.recordEvent({
        userId: user.id,
        event: 'DEALER_DISTRIBUTOR_ASSIGNED',
        metadata: JSON.stringify({
          dealerId: dealer.id,
          distributorId: dealer.distributorId,
          reason: 'Initial assignment',
        }),
      });
    }

    return NextResponse.json({ success: true, dealer }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Dealer creation error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
