import { cookies } from 'next/headers';
import { dealerAuthService, dealerRequestsService, apiSuccess, apiError } from '@trionyx/api';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser, dealer } = await dealerAuthService.getSession(token);

    const body = await request.json().catch(() => ({}));
    if (!body.body || typeof body.body !== 'string' || !body.body.trim()) {
      return apiError('VALIDATION_ERROR', 'Message body cannot be empty', 422);
    }

    const message = await dealerRequestsService.addMessage(
      requestId,
      body.body.trim(),
      'DEALER',
      dealerUser.id,
      dealerUser.name,
      dealer.id // Verify multi-tenant ownership
    );

    return apiSuccess(message, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    if (err.code === 'NOT_FOUND' || err.statusCode === 404) {
      return apiError('NOT_FOUND', 'Request not found', 404);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to send message', 500);
  }
}
