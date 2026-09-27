import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { serialsRepository } from '@trionyx/database';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get('serialNumber');

    if (!serialNumber || !serialNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'serialNumber query parameter is required.' },
        { status: 400 }
      );
    }

    const serial = await serialsRepository.findBySerialNumber(serialNumber.trim());
    if (!serial) {
      return NextResponse.json(
        { success: false, error: `Serial number "${serialNumber.trim().toUpperCase()}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, serial }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Lookup failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
