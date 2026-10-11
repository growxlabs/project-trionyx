import { NextRequest } from 'next/server';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';
import { activateWarrantySchema } from '@trionyx/validation';
import type { WarrantyStatus } from '@trionyx/types';

export async function GET(request: NextRequest) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);
    if (activeOrg.slug !== 'trionyx') {
      return apiError('FORBIDDEN', 'Warranty management is only available for Trionyx', 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const productId = searchParams.get('productId') || undefined;
    const dealerId = searchParams.get('dealerId') || undefined;
    const status = (searchParams.get('status') as WarrantyStatus | 'EXPIRED') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const result = await warrantiesService.listWarranties({
      search,
      productId,
      dealerId,
      status,
      page,
      limit,
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to list warranties', status);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (activeOrg.slug !== 'trionyx') {
      return apiError('FORBIDDEN', 'Warranty management is only available for Trionyx', 403);
    }

    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Only Managing Director and Admin can activate warranties internally', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = activateWarrantySchema.safeParse(body);

    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid activation data', 400);
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const warranty = await warrantiesService.activateWarranty(
      {
        serialNumber: parse.data.serialNumber,
        installationDate: parse.data.installationDate,
        actorId: user.id,
        actorType: 'INTERNAL',
        dealerId: body.dealerId || null,
      },
      {
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
      }
    );

    return apiSuccess(warranty, 201);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    if (err.code === 'WARRANTY_ALREADY_ACTIVATED') {
      return apiError('CONFLICT', err.message, 409, err.details);
    }
    if (err.code === 'POLICY_NOT_CONFIGURED') {
      return apiError(
        'BAD_REQUEST',
        'Warranty policy not configured for this product. Please configure a policy first in Product Details.',
        400
      );
    }
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', err.message, 404);
    return apiError(code, err.message || 'Failed to activate warranty', status);
  }
}
