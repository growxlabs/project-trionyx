import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  requireDistributorSession,
  DISTRIBUTOR_AUTH_CONFIG,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value ||
      cookieStore.get(AUTH_CONFIG.cookieName)?.value;

    const { distributor } = await requireDistributorSession(token);

    const body = await request.json().catch(() => ({}));
    const serialNumber = typeof body.serialNumber === 'string' ? body.serialNumber.trim() : '';

    if (!serialNumber) {
      return apiError('VALIDATION_ERROR', 'Please provide a serial number', 400);
    }

    const validation = await warrantiesService.validateSerialForActivation(serialNumber);
    return apiSuccess(validation, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Validation failed', 500);
  }
}
