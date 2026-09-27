import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';
import { voidWarrantySchema } from '@trionyx/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ warrantyId: string }> }
) {
  try {
    const { warrantyId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

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
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', err.message, 404);
    if (err.code === 'CONFLICT') return apiError('CONFLICT', err.message, 409);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to void warranty', 500);
  }
}
