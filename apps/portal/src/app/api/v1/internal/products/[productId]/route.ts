import { cookies } from 'next/headers';
import {
  requireInternalUser,
  requireProductWritePermission,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { productsService, apiSuccess, apiError } from '@trionyx/api';
import { updateProductSchema } from '@trionyx/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { productId } = await params;
    const product = await productsService.getProductById(productId);
    if (!product) {
      return apiError('NOT_FOUND', 'Product not found', 404);
    }

    return apiSuccess(product, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Server error', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireProductWritePermission(token);

    const { productId } = await params;
    const body = await request.json().catch(() => ({}));
    const parse = updateProductSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid product data', 422);
    }

    const updated = await productsService.updateProduct(productId, parse.data, user.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    if (err.statusCode === 404 || err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Product not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update product', 500);
  }
}
