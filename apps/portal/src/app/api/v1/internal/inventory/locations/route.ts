import { getServerActiveOrg } from '@/lib/serverOrg';
import { canManageLocations } from '@trionyx/auth';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';
import { createLocationSchema } from '@trionyx/validation';

export async function GET(request: Request) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);
    const locations = await inventoryService.listLocations({ organizationId: activeOrg.id });
    return apiSuccess(locations, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to list locations', status);
  }
}

export async function POST(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (!canManageLocations(user.role)) {
      return apiError('FORBIDDEN', 'You do not have permission to manage inventory locations', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = createLocationSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid location data', 422);
    }

    const location = await inventoryService.createLocation({
      ...parse.data,
      organizationId: activeOrg.id,
    });
    return apiSuccess(location, 201);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    if (err.message?.includes('already in use')) {
      return apiError('CONFLICT', err.message, 409);
    }
    return apiError(code, err.message || 'Failed to create location', status);
  }
}
