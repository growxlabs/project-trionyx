import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canWriteProducts, AUTH_CONFIG } from '@trionyx/auth';
import { mediaRepository } from '@trionyx/database';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canWriteProducts(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete product media.' },
        { status: 403 }
      );
    }

    const deleted = await mediaRepository.delete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Media not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to delete media';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
