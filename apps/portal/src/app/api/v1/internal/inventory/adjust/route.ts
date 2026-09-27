import { cookies } from 'next/headers';
import { requireInventoryMutationPermission, AUTH_CONFIG } from '@trionyx/auth';
import { inventoryService, apiSuccess, apiError } from '@trionyx/api';
import { adjustSerialStatusSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInventoryMutationPermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = adjustSerialStatusSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid adjustment payload', 422);
    }

    const adjusted = await inventoryService.adjustSerial(parse.data, user.id);
    return apiSuccess(adjusted, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Insufficient permissions to mutate inventory', 403);
    return apiError('BAD_REQUEST', err.message || 'Failed to adjust serial status', 400);
  }
}
