import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { inventoryService, apiCollection, apiError } from '@trionyx/api';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const serialRecordId = searchParams.get('serialRecordId') || undefined;
    const type = (searchParams.get('type') as 'RECEIVED' | 'TRANSFERRED' | 'ADJUSTED') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;

    const result = await inventoryService.listMovements({
      productId,
      serialRecordId,
      type,
      page,
      pageSize,
    });

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list inventory movements', 500);
  }
}
