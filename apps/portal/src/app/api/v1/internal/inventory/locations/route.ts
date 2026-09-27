import { cookies } from 'next/headers';
import { requireInternalUser, canManageLocations, AUTH_CONFIG } from '@trionyx/auth';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';
import { createLocationSchema } from '@trionyx/validation';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const locations = await inventoryService.listLocations();
    return apiSuccess(locations, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list locations', 500);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageLocations(user.role)) {
      return apiError('FORBIDDEN', 'You do not have permission to manage inventory locations', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = createLocationSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid location data', 422);
    }

    const location = await inventoryService.createLocation(parse.data);
    return apiSuccess(location, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.message?.includes('already in use')) {
      return apiError('CONFLICT', err.message, 409);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create location', 500);
  }
}
