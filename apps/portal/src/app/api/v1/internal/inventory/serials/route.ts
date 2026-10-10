import { getServerActiveOrg } from '@/lib/serverOrg';
import { inventoryService, apiCollection, apiError } from '@trionyx/api';

export async function GET(request: Request) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;
    const productId = searchParams.get('productId') || undefined;
    const locationId = searchParams.get('locationId') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await inventoryService.listSerials({
      page,
      pageSize,
      productId,
      locationId,
      status,
      search,
      organizationId: activeOrg.id,
    });

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to list serials', status);
  }
}
