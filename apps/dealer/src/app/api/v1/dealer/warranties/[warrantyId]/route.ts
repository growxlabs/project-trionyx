import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { dealerAuthService, warrantiesService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ warrantyId: string }> }
) {
  try {
    const { warrantyId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealer } = await dealerAuthService.getSession(token);

    const record = await warrantiesService.getWarrantyById(warrantyId, dealer.id);
    if (!record) {
      return apiError('NOT_FOUND', 'Warranty record not found', 404);
    }

    return apiSuccess(record.warranty, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    if (err.code === 'FORBIDDEN') {
      return apiError('FORBIDDEN', 'Access denied to this warranty record', 403);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch warranty', 500);
  }
}
