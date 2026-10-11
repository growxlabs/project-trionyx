import { getServerActiveOrg } from '@/lib/serverOrg';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(request: Request) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);
    const overview = await inventoryService.getOverview(activeOrg.id);
    return apiSuccess(overview, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to get inventory overview', status);
  }
}
