import { cookies } from 'next/headers';
import {
  requireInternalUser,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { distributorsService, apiCollection, apiError } from '@trionyx/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ distributorId: string }> }
) {
  try {
    const { distributorId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;

    const distributorScope = getDistributorScope(user);
    const result = await distributorsService.listDistributorDealers(
      distributorId,
      { page, pageSize, search },
      distributorScope
    );

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list distributor dealers', 500);
  }
}
