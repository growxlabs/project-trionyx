import { cookies } from 'next/headers';
import { requireProductWritePermission, AUTH_CONFIG } from '@trionyx/auth';
import { productsService, apiSuccess, apiError } from '@trionyx/api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireProductWritePermission(token);

    const { categoryId } = await params;
    const body = await request.json().catch(() => ({}));
    const updated = await productsService.updateCategory(categoryId, body);

    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update category', 500);
  }
}
