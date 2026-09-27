import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG, changeDealerPassword } from '@trionyx/auth';
import { changeDealerPasswordSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    const { dealerUser } = await requireDealerSession(token);

    const body = await request.json().catch(() => ({}));
    const parseResult = changeDealerPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid password data',
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;
    await changeDealerPassword(dealerUser.id, currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to change password',
      },
      { status: 400 }
    );
  }
}
