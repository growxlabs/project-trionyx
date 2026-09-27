import { cookies } from 'next/headers';
import { requireInternalUser, canManageLocations, AUTH_CONFIG } from '@trionyx/auth';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageLocations(user.role)) {
      return apiError('FORBIDDEN', 'You do not have permission to manage inventory locations', 403);
    }

    const body = await request.json().catch(() => ({}));
    const updated = await inventoryService.updateLocation(locationId, body);
    if (!updated) {
      return apiError('NOT_FOUND', 'Location not found', 404);
    }

    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update location', 500);
  }
}
