import { cookies } from 'next/headers';
import { internalAuthService, apiSuccess, apiError } from '@trionyx/api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(internalAuthService.cookieConfig.cookieName)?.value;
    const session = await internalAuthService.getSession(token);

    return apiSuccess({ user: session.user }, 200);
  } catch (err: any) {
    return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
  }
}
