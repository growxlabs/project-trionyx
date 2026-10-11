import { NextRequest } from 'next/server';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ warrantyId: string }> }
) {
  try {
    const { warrantyId } = await params;
    const { activeOrg } = await getServerActiveOrg(request);
    if (activeOrg.slug !== 'trionyx') {
      return apiError('FORBIDDEN', 'Warranty records are only available for Trionyx', 403);
    }

    const record = await warrantiesService.getWarrantyById(warrantyId);
    if (!record) {
      return apiError('NOT_FOUND', 'Warranty record not found', 404);
    }

    return apiSuccess(record, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to fetch warranty record', status);
  }
}
