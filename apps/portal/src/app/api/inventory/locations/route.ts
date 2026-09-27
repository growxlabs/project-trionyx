import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageLocations, AUTH_CONFIG } from '@trionyx/auth';
import { locationsRepository, auditLogsRepository } from '@trionyx/database';
import { createLocationSchema } from '@trionyx/validation';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as 'ACTIVE' | 'INACTIVE') || undefined;

    const locations = await locationsRepository.list({ search, status });
    return NextResponse.json({ success: true, locations });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageLocations(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage inventory locations.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createLocationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid location data' },
        { status: 400 }
      );
    }

    const existingCode = await locationsRepository.findByCode(parseResult.data.code);
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: `Location code "${parseResult.data.code}" is already in use.` },
        { status: 400 }
      );
    }

    const location = await locationsRepository.create(parseResult.data);

    // Record audit event
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'INVENTORY_LOCATION_CREATED',
      metadata: {
        locationId: location.id,
        code: location.code,
        name: location.name,
      },
    });

    return NextResponse.json({ success: true, location }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to create location';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
