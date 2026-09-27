import { cookies } from 'next/headers';
import { internalAuthService, apiSuccess } from '@trionyx/api';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(internalAuthService.cookieConfig.cookieName)?.value;

  if (token) {
    await internalAuthService.logout(token);
    cookieStore.delete(internalAuthService.cookieConfig.cookieName);
  }

  return apiSuccess({ success: true }, 200);
}
