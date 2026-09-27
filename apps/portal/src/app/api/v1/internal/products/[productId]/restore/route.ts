import { cookies } from 'next/headers';
import { requireProductWritePermission, AUTH_CONFIG } from '@trionyx/auth';
import { productsService, apiSuccess, apiError } from '@trionyx/api';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireProductWritePermission(token);

    const { productId } = await params;
    const restored = await productsService.restoreProduct(productId, user.id);
    return apiSuccess(restored, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    if (err.statusCode === 404 || err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Product not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to restore product', 500);
  }
}
