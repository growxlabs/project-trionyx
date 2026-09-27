import { cookies } from 'next/headers';
import {
  requireInternalUser,
  requireProductWritePermission,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { productsService, apiSuccess, apiCollection, apiError } from '@trionyx/api';
import { createProductSchema } from '@trionyx/validation';
import type { ProductStatus, PublicVisibility } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

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
    });

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list products', 500);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireProductWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = createProductSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid product data', 422);
    }

    const created = await productsService.createProduct(parse.data, user.id);
    return apiSuccess(created, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create product', 500);
  }
}
