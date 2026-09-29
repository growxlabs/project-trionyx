import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  requireDistributorSession,
  DISTRIBUTOR_AUTH_CONFIG,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';
import { dealersRepository } from '@trionyx/database';
import { activateWarrantySchema } from '@trionyx/validation';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
      cookieStore.get(AUTH_CONFIG.cookieName)?.value;

    const { distributor } = await requireDistributorSession(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const dealerId = searchParams.get('dealerId') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const result = await warrantiesService.listWarranties({
      distributorId: distributor.id,
      dealerId,
      status: status && status !== 'ALL' ? status : undefined,
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
    const token =
      cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
      cookieStore.get(AUTH_CONFIG.cookieName)?.value;

    const { user, distributor } = await requireDistributorSession(token);

    const body = await request.json().catch(() => ({}));
    const parse = activateWarrantySchema.safeParse(body);

    if (!parse.success) {
      return apiError(
        'VALIDATION_ERROR',
        parse.error.issues[0]?.message || 'Invalid activation data',
        400
      );
    }

    // Verify dealer assignment belongs to this distributor if provided
    let targetDealerId: string | null = null;
    if (parse.data.dealerId) {
      const assignedDealer = await dealersRepository.findById(parse.data.dealerId);
      if (!assignedDealer || assignedDealer.distributorId !== distributor.id) {
        return apiError(
          'FORBIDDEN',
          'Selected dealer is not assigned to your regional distribution territory',
          403
        );
      }
      targetDealerId = assignedDealer.id;
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
        actorType: 'DEALER',
        dealerId: targetDealerId,
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
