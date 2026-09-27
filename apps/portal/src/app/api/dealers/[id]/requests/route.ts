import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, dealerRequestsRepository, auditLogsRepository } from '@trionyx/database';
import { createDealerRequestSchema } from '@trionyx/validation';

export async function GET(
  request: Request,
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

    if (user.role === 'DISTRIBUTOR' && dealer.distributorId !== user.distributorId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    const { items, total } = await dealerRequestsRepository.list({
      dealerId: id,
      page,
      limit,
    });

    return NextResponse.json({ success: true, requests: items, total, page, limit });
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

export async function POST(
  request: Request,
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

    if (user.role === 'DISTRIBUTOR' && dealer.distributorId !== user.distributorId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createDealerRequestSchema.safeParse({
      ...body,
      dealerId: id,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid request data' },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const dealerRequest = await dealerRequestsRepository.create({
      dealerId: id,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      assignedTo: data.assignedTo || null,
      createdBy: user.id,
    });

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'DEALER_REQUEST_CREATED',
      metadata: JSON.stringify({
        dealerId: id,
        requestId: dealerRequest.id,
        requestCode: dealerRequest.requestCode,
        subject: dealerRequest.subject,
      }),
    });

    return NextResponse.json({ success: true, request: dealerRequest }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Dealer request creation error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
