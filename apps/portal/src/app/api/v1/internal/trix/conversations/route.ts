import { cookies } from 'next/headers';
import { AUTH_CONFIG, requireRole } from '@trionyx/auth';
import { apiError, apiSuccess } from '@trionyx/api';
import { trixConversationsRepository } from '@trionyx/database';

export const runtime = 'nodejs';

export async function GET() {
  const token = (await cookies()).get(AUTH_CONFIG.cookieName)?.value;
  let auth;
  try {
    auth = await requireRole(['MANAGING_DIRECTOR'], token);
  } catch {
    return apiError('FORBIDDEN', 'Access denied', 403);
  }

  try {
    const conversations = await trixConversationsRepository.listConversations(auth.user.id, 50);
    return apiSuccess({ conversations }, 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list conversations';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
