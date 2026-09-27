import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { serialNumber } = await params;
    const serial = await inventoryService.getSerialByNumber(serialNumber);
    if (!serial) {
      return apiError('NOT_FOUND', `Serial number "${serialNumber}" not found`, 404);
    }

    return apiSuccess(serial, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Server error', 500);
  }
}
