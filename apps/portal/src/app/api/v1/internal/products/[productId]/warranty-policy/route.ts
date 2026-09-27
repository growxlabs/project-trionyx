import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';
import { upsertWarrantyPolicySchema } from '@trionyx/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const policy = await warrantiesService.getWarrantyPolicy(productId);
    return apiSuccess({ policy }, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch warranty policy', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Only Managing Director and Admin can configure warranty policies', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = upsertWarrantyPolicySchema.safeParse(body);

    if (!parse.success) {
      return apiError(
        'VALIDATION_ERROR',
        parse.error.issues[0]?.message || 'Invalid warranty policy parameters',
        400
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const policy = await warrantiesService.upsertWarrantyPolicy(
      productId,
      parse.data.durationMonths,
      parse.data.status,
      user,
      {
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
      }
    );

    return apiSuccess(policy, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update warranty policy', 500);
  }
}
