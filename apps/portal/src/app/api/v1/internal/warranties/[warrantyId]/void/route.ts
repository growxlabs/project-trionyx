import { NextRequest } from 'next/server';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';
import { voidWarrantySchema } from '@trionyx/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ warrantyId: string }> }
) {
  try {
    const { warrantyId } = await params;
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (activeOrg.slug !== 'trionyx') {
      return apiError('FORBIDDEN', 'Warranty void is only available for Trionyx', 403);
    }

    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Only Managing Director and Admin can void warranties', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = voidWarrantySchema.safeParse(body);

    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid void reason', 400);
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const voided = await warrantiesService.voidWarranty(warrantyId, parse.data.reason, user, {
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent'),
    });

    return apiSuccess(voided, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', err.message, 404);
    if (err.code === 'CONFLICT') return apiError('CONFLICT', err.message, 409);
    return apiError(code, err.message || 'Failed to void warranty', status);
  }
}
