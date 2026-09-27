import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { internalNotesRepository, auditLogsRepository } from '@trionyx/database';
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

    // Security Scoping: Distributor users can only view notes for their own distributor record
    if (user.role === 'DISTRIBUTOR' && user.distributorId !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const notes = await internalNotesRepository.listForEntity('DISTRIBUTOR', id);
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

    // Security Scoping: Distributor users can only add notes to their own distributor record
    if (user.role === 'DISTRIBUTOR' && user.distributorId !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createInternalNoteSchema.safeParse({
      ...body,
      entityType: 'DISTRIBUTOR',
      entityId: id,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid note data' },
        { status: 400 }
      );
    }

    const note = await internalNotesRepository.create({
      entityType: 'DISTRIBUTOR',
      entityId: id,
      body: parseResult.data.body,
      createdBy: user.id,
    });

    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'INTERNAL_NOTE_CREATED',
      metadata: JSON.stringify({
        entityType: 'DISTRIBUTOR',
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
