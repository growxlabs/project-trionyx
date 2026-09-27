import { cookies } from 'next/headers';
import { dealerAuthService, dealerPortalService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    await dealerAuthService.getSession(token);

    const product = await dealerPortalService.getProductById(productId);
    return apiSuccess(product, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    if (err.code === 'NOT_FOUND' || err.statusCode === 404) {
      return apiError('NOT_FOUND', 'Product not found or not available', 404);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch product', 500);
  }
}
