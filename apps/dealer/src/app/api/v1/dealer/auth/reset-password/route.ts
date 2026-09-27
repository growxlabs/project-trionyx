import { dealerAuthService, apiSuccess, apiError } from '@trionyx/api';
import { dealerResetPasswordSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = dealerResetPasswordSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid password reset data', 422);
    }

    await dealerAuthService.resetPassword(parse.data.token, parse.data.newPassword);

    return apiSuccess(
      {
        message: 'Password reset successfully. Please sign in with your new credentials.',
      },
      200
    );
  } catch (err: any) {
    return apiError('BAD_REQUEST', err.message || 'Password reset failed', 400);
  }
}
