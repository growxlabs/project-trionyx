import { cookies } from 'next/headers';
import { AUTH_CONFIG, requireRole } from '@trionyx/auth';
import { apiError, apiSuccess } from '@trionyx/api';
import { getDatabaseUrl, isPostgresUrl, consumeTrixRateLimit } from '@trionyx/database';
import { requestSchema, runTrix, readBoundedTrixBody } from '@trionyx/ai';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const token = (await cookies()).get(AUTH_CONFIG.cookieName)?.value;
    const auth = await requireRole(['MANAGING_DIRECTOR'], token);
    if (request.headers.get('origin') !== new URL(request.url).origin) return apiError('FORBIDDEN', 'Access denied', 403);
    const text = await readBoundedTrixBody(request,10000);
    let body;
    try { body = requestSchema.safeParse(JSON.parse(text)); } catch { return apiError('INVALID_INPUT', 'Enter an inventory, dealer network or enquiry question', 400); }
    if (!body.success) return apiError('INVALID_INPUT', 'Enter an inventory, dealer network or enquiry question', 400);
    if (!isPostgresUrl(getDatabaseUrl())) return apiError('DATABASE_NOT_CONFIGURED', 'TRIX requires the configured Trionyx database', 503);
    if(!await consumeTrixRateLimit(auth.user.id,'chat'))return apiError('TRIX_RATE_LIMITED','Too many TRIX requests. Try again in a minute.',429);
    const data = await runTrix(body.data, { user: auth.user, sessionId: auth.session.id,
      authorize: async () => (await requireRole(['MANAGING_DIRECTOR'], token)).user });
    return apiSuccess(data, 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if(code==='TRIX_REQUEST_TOO_LARGE')return apiError('INVALID_INPUT','Request is too large',413);
    if (code === 'UNAUTHENTICATED') return apiError(code, 'Not authenticated', 401);
    if (code === 'FORBIDDEN') return apiError(code, 'Access denied', 403);
    if (code === 'TRIX_LOGGING_FAILED') return apiError(code, 'TRIX could not safely record this execution. Try again.', 503);
    return apiError('INTERNAL_ERROR', 'TRIX could not complete the request. Try again.', 503);
  }
}
