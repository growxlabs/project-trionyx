import { NextResponse } from 'next/server';
import { dealerForgotPasswordSchema } from '@trionyx/validation';
import { requestDealerPasswordReset } from '@trionyx/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = dealerForgotPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      // Return neutral response even for invalid email format to prevent enumeration
      return NextResponse.json(
        {
          success: true,
          message: 'If an authorized account matches this email, reset instructions have been initiated.',
        },
        { status: 200 }
      );
    }

    const result = await requestDealerPasswordReset(parseResult.data.email);

    return NextResponse.json(
      {
        success: true,
        message: 'If an authorized account matches this email, reset instructions have been initiated.',
        // In local development / pending transactional email, include rawToken for easy testing
        ...(process.env.NODE_ENV !== 'production' && result.rawToken ? { devResetToken: result.rawToken } : {}),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Dealer forgot-password error:', err);
    return NextResponse.json(
      {
        success: true,
        message: 'If an authorized account matches this email, reset instructions have been initiated.',
      },
      { status: 200 }
    );
  }
}
