import { getServerActiveOrg } from '@/lib/serverOrg';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);
    const { serialNumber } = await params;
    const serial = await inventoryService.getSerialByNumber(serialNumber, activeOrg.id);
    if (!serial) {
      return apiError('NOT_FOUND', `Serial number "${serialNumber}" not found`, 404);
    }

    return apiSuccess(serial, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Server error', status);
  }
}
