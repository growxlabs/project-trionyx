import { NextRequest } from 'next/server';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { warrantiesService, apiSuccess, apiError } from '@trionyx/api';

export async function POST(request: NextRequest) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);
    if (activeOrg.slug !== 'trionyx') {
      return apiError('FORBIDDEN', 'Warranty validation is only available for Trionyx', 403);
    }

    const body = await request.json().catch(() => ({}));
    const serialNumber = typeof body.serialNumber === 'string' ? body.serialNumber.trim() : '';

    if (!serialNumber) {
      return apiError('VALIDATION_ERROR', 'Please provide a serial number', 400);
    }

    const validation = await warrantiesService.validateSerialForActivation(serialNumber);
    return apiSuccess(validation, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Validation failed', status);
  }
}
