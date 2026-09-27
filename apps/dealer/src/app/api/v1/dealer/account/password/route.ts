import { cookies } from 'next/headers';
import { dealerAuthService, dealerPortalService, apiSuccess, apiError } from '@trionyx/api';
import { changeDealerPasswordSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser } = await dealerAuthService.getSession(token);

    const body = await request.json().catch(() => ({}));
    const parse = changeDealerPasswordSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid password data', 422);
    }

    await dealerPortalService.changePassword(dealerUser.id, parse.data.currentPassword, parse.data.newPassword);
    return apiSuccess({ success: true, message: 'Password updated successfully' }, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('BAD_REQUEST', err.message || 'Failed to change password', 400);
  }
}
