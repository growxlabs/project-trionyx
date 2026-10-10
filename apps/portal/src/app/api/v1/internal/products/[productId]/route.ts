import { getServerActiveOrg } from '@/lib/serverOrg';
import { productsService, apiSuccess, apiError } from '@trionyx/api';
import { updateProductSchema } from '@trionyx/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);
    const { productId } = await params;
    const product = await productsService.getProductById(productId, activeOrg.id);
    if (!product) {
      return apiError('NOT_FOUND', 'Product not found', 404);
    }

    return apiSuccess(product, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Server error', status);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    }

    const { productId } = await params;
    const body = await request.json().catch(() => ({}));
    const parse = updateProductSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid product data', 422);
    }

    const updated = await productsService.updateProduct(productId, parse.data, user.id, activeOrg.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to update product', status);
  }
}
