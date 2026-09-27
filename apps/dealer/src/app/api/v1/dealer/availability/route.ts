import { cookies } from 'next/headers';
import { dealerAuthService, dealerPortalService, apiSuccess, apiError } from '@trionyx/api';
import type { DealerProductAvailability } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    await dealerAuthService.getSession(token);

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const availability = (searchParams.get('availability') as DealerProductAvailability) || undefined;

    const data = await dealerPortalService.getAvailability({
      categoryId,
      search,
      availability,
    });

    return apiSuccess(data, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch product availability', 500);
  }
}
