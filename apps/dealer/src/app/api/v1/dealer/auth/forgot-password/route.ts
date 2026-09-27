import { dealerAuthService, apiSuccess, apiError } from '@trionyx/api';
import { dealerForgotPasswordSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = dealerForgotPasswordSchema.safeParse(body);
    if (!parse.success) {
      return apiSuccess(
        {
          message: 'If an authorized account matches this email, reset instructions have been initiated.',
        },
        200
      );
    }

    const result = await dealerAuthService.forgotPassword(parse.data.email);

    return apiSuccess(
      {
        message: 'If an authorized account matches this email, reset instructions have been initiated.',
        ...(process.env.NODE_ENV !== 'production' && result.rawToken ? { devResetToken: result.rawToken } : {}),
      },
      200
    );
  } catch (err: any) {
    return apiSuccess(
      {
        message: 'If an authorized account matches this email, reset instructions have been initiated.',
      },
      200
    );
  }
}
