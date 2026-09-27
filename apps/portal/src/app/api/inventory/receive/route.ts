import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canMutateInventory, AUTH_CONFIG } from '@trionyx/auth';
import { serialsRepository } from '@trionyx/database';
import { receiveSerialsSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canMutateInventory(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to receive inventory serial units.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = receiveSerialsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid serial receipt data' },
        { status: 400 }
      );
    }

    const records = await serialsRepository.receiveBatch({
      productId: parseResult.data.productId,
      locationId: parseResult.data.locationId,
      serialNumbers: parseResult.data.serialNumbers,
      reference: parseResult.data.reference,
      notes: parseResult.data.notes,
      actorId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        count: records.length,
        records,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to receive serial units';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
