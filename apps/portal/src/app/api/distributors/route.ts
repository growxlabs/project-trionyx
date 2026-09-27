import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDistributors, AUTH_CONFIG } from '@trionyx/auth';
import { distributorsRepository, auditLogsRepository } from '@trionyx/database';
import { createDistributorSchema } from '@trionyx/validation';
import type { DistributorStatus } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as DistributorStatus) || undefined;
    const state = searchParams.get('state') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    // Security Scoping: If user is DISTRIBUTOR role, they can only see their own distributor record
    if (user.role === 'DISTRIBUTOR') {
      if (!user.distributorId) {
        return NextResponse.json({ success: true, distributors: [], total: 0, page: 1, limit });
      }
      const myDistributor = await distributorsRepository.findById(user.distributorId);
      const items = myDistributor ? [myDistributor] : [];
      return NextResponse.json({ success: true, distributors: items, total: items.length, page: 1, limit });
    }

    // Dropdown list optimization if param `allActive=true`
    if (searchParams.get('allActive') === 'true') {
      const activeList = await distributorsRepository.listAllActive();
      return NextResponse.json({ success: true, distributors: activeList });
    }

    const { items, total } = await distributorsRepository.list({
      search,
      status,
      state,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      distributors: items,
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

    if (!canManageDistributors(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to create distributors.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createDistributorSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid distributor data' },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const distributor = await distributorsRepository.create({
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
      territory: data.territory,
      status: data.status,
      gstin: data.gstin,
      notes: data.notes,
      createdBy: user.id,
    });

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DISTRIBUTOR_CREATED',
      metadata: JSON.stringify({
        distributorId: distributor.id,
        distributorCode: distributor.distributorCode,
        businessName: distributor.businessName,
      }),
    });

    return NextResponse.json({ success: true, distributor }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Distributor creation error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
