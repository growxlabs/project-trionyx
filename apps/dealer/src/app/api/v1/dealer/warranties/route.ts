import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { dealerAuthService, warrantiesService, apiSuccess, apiError } from '@trionyx/api';
import { activateWarrantySchema } from '@trionyx/validation';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealer } = await dealerAuthService.getSession(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const result = await warrantiesService.listWarranties({
      dealerId: dealer.id,
      search,
      page,
      limit,
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list warranties', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser, dealer } = await dealerAuthService.getSession(token);

    const body = await request.json().catch(() => ({}));
    const parse = activateWarrantySchema.safeParse(body);

    if (!parse.success) {
      return apiError(
        'VALIDATION_ERROR',
        parse.error.issues[0]?.message || 'Invalid activation data',
        400
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const warranty = await warrantiesService.activateWarranty(
      {
        serialNumber: parse.data.serialNumber,
        installationDate: parse.data.installationDate,
        actorId: dealerUser.id,
        actorType: 'DEALER',
        dealerId: dealer.id,
      },
      {
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
      }
    );

    return apiSuccess(warranty, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    if (err.code === 'WARRANTY_ALREADY_ACTIVATED') {
      return apiError('CONFLICT', err.message, 409, err.details);
    }
    if (err.code === 'POLICY_NOT_CONFIGURED') {
      return apiError(
        'BAD_REQUEST',
        'Warranty policy not configured for this product. Please contact Trionyx administrator.',
        400
      );
    }
    if (err.code === 'NOT_FOUND') {
      return apiError('NOT_FOUND', err.message, 404);
    }
    if (err.code === 'INVALID_SERIAL') {
      return apiError('BAD_REQUEST', err.message, 400);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to activate warranty', 500);
  }
}
