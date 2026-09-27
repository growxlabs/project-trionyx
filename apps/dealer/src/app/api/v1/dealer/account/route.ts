import { cookies } from 'next/headers';
import { dealerAuthService, dealerPortalService, apiSuccess, apiError } from '@trionyx/api';
import { updateDealerProfileByDealerSchema } from '@trionyx/validation';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser, dealer } = await dealerAuthService.getSession(token);

    const account = await dealerPortalService.getAccount(dealer, dealerUser);
    return apiSuccess(account, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch account', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser, dealer } = await dealerAuthService.getSession(token);

    const body = await request.json().catch(() => ({}));
    const parse = updateDealerProfileByDealerSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid account data', 422);
    }

    const updated = await dealerPortalService.updateAccount(dealer, parse.data, dealerUser);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    if (err.code === 'CONFLICT' || err.statusCode === 409) {
      return apiError('CONFLICT', err.message, 409);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update account', 500);
  }
}
