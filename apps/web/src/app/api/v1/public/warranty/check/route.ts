import { NextRequest } from 'next/server';
import { apiSuccess, apiError, warrantiesService, checkPublicRateLimit } from '@trionyx/api';
import { checkWarrantySchema } from '@trionyx/validation';

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Rate limiting to prevent serial number enumeration
    if (!checkPublicRateLimit(clientIp)) {
      return apiError(
        'RATE_LIMITED',
        'Too many lookup requests. Please wait a few minutes before trying again.',
        429
      );
    }

    const body = await request.json().catch(() => ({}));
    const parse = checkWarrantySchema.safeParse(body);

    if (!parse.success) {
      return apiError(
        'VALIDATION_ERROR',
        parse.error.issues[0]?.message || 'Please provide a valid serial number',
        400
      );
    }

    const result = await warrantiesService.checkPublicWarranty(parse.data.serialNumber, {
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent'),
    });

    return apiSuccess(result, 200);
  } catch (err) {
    console.error('[Public Warranty API] Error:', err);
    return apiError(
      'INTERNAL_ERROR',
      'Unable to verify warranty at this moment. Please try again later.',
      500
    );
  }
}
