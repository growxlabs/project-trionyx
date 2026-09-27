import { cookies } from 'next/headers';
import { internalAuthService, internalOverviewService, apiSuccess, apiError } from '@trionyx/api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(internalAuthService.cookieConfig.cookieName)?.value;
    const { user } = await internalAuthService.getSession(token);

    const overview = await internalOverviewService.getOverview(user);
    return apiSuccess(overview, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to retrieve overview', 500);
  }
}
