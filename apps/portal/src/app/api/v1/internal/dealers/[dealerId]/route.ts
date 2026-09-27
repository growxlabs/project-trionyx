import { cookies } from 'next/headers';
import {
  requireInternalUser,
  requireDealerWritePermission,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { dealersService, apiSuccess, apiError } from '@trionyx/api';
import { updateDealerSchema } from '@trionyx/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const distributorScope = getDistributorScope(user);
    const dealer = await dealersService.getDealerById(dealerId, distributorScope);
    if (!dealer) {
      return apiError('NOT_FOUND', 'Dealer not found', 404);
    }

    return apiSuccess(dealer, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch dealer', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireDealerWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = updateDealerSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid dealer data', 422);
    }

    const distributorScope = getDistributorScope(user);
    const updated = await dealersService.updateDealer(dealerId, parse.data, user.id, distributorScope);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Dealer not found', 404);
    if (err.code === 'CONFLICT' || err.statusCode === 409) return apiError('CONFLICT', err.message, 409);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update dealer', 500);
  }
}
