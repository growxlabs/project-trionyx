import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

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
    if (err.message === 'FORBIDDEN') {
      return apiError('FORBIDDEN', 'Access denied', 403);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Validation failed', 500);
  }
}
