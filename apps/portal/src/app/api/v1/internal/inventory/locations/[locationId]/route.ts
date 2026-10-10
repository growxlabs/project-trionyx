import { getServerActiveOrg } from '@/lib/serverOrg';
import { canManageLocations } from '@trionyx/auth';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (!canManageLocations(user.role)) {
      return apiError('FORBIDDEN', 'You do not have permission to manage inventory locations', 403);
    }

    const body = await request.json().catch(() => ({}));
    const updated = await inventoryService.updateLocation(locationId, body, activeOrg.id);
    if (!updated) {
      return apiError('NOT_FOUND', 'Location not found', 404);
    }

    return apiSuccess(updated, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to update location', status);
  }
}
