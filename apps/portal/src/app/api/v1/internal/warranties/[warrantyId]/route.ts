import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ warrantyId: string }> }
) {
  try {
    const { warrantyId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const record = await warrantiesService.getWarrantyById(warrantyId);
    if (!record) {
      return apiError('NOT_FOUND', 'Warranty record not found', 404);
    }

    return apiSuccess(record, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch warranty record', 500);
  }
}
