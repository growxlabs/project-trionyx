import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { dealersRepository, internalNotesRepository, auditLogsRepository } from '@trionyx/database';
import { createInternalNoteSchema } from '@trionyx/validation';

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

    if (user.role === 'DISTRIBUTOR' && dealer.distributorId !== user.distributorId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const notes = await internalNotesRepository.listForEntity('DEALER', id);
    return NextResponse.json({ success: true, notes });
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
    const parseResult = createInternalNoteSchema.safeParse({
      ...body,
      entityType: 'DEALER',
      entityId: id,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid note data' },
        { status: 400 }
      );
    }

    const note = await internalNotesRepository.create({
      entityType: 'DEALER',
      entityId: id,
      body: parseResult.data.body,
      createdBy: user.id,
    });

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'INTERNAL_NOTE_CREATED',
      metadata: JSON.stringify({
        entityType: 'DEALER',
        entityId: id,
        noteId: note.id,
      }),
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Note creation error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
