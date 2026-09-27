import { NextResponse } from 'next/server';
import { dealerResetPasswordSchema } from '@trionyx/validation';
import { resetDealerPassword } from '@trionyx/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = dealerResetPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid password reset data',
        },
        { status: 400 }
      );
    }

    const { token, newPassword } = parseResult.data;
    await resetDealerPassword(token, newPassword);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully. Please sign in with your new credentials.',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Dealer reset-password error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Password reset failed',
      },
      { status: 400 }
    );
  }
}
