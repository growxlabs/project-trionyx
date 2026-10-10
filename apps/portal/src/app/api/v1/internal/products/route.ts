import { getServerActiveOrg } from '@/lib/serverOrg';
import { requireProductWritePermission } from '@trionyx/auth';
import { productsService, apiSuccess, apiCollection, apiError } from '@trionyx/api';
import { createProductSchema } from '@trionyx/validation';
import type { ProductStatus, PublicVisibility } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = (searchParams.get('status') as ProductStatus) || undefined;
    const visibility = (searchParams.get('visibility') as PublicVisibility) || undefined;

    const result = await productsService.listProducts({
      page,
      pageSize,
      search,
      categoryId,
      status,
      visibility,
      organizationId: activeOrg.id,
    });

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to list products', status);
  }
}

export async function POST(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = createProductSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid product data', 422);
    }

    const created = await productsService.createProduct(
      {
        ...parse.data,
        organizationId: activeOrg.id,
      },
      user.id
    );
    return apiSuccess(created, 201);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to create product', status);
  }
}
