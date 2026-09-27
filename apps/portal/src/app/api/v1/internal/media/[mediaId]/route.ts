import { cookies } from 'next/headers';
import { requireProductWritePermission, AUTH_CONFIG } from '@trionyx/auth';
import { productsService, apiSuccess, apiError } from '@trionyx/api';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireProductWritePermission(token);

    await productsService.deleteMedia(mediaId, user.id);
    return apiSuccess({ deleted: true }, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to delete media', 500);
  }
}
