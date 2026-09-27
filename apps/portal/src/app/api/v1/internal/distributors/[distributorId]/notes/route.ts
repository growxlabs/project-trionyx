import { cookies } from 'next/headers';
import {
  requireInternalUser,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { distributorsService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ distributorId: string }> }
) {
  try {
    const { distributorId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const distributorScope = getDistributorScope(user);
    const notes = await distributorsService.listDistributorNotes(distributorId, distributorScope);
    return apiSuccess(notes, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list distributor notes', 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ distributorId: string }> }
) {
  try {
    const { distributorId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const body = await request.json().catch(() => ({}));
    if (!body.body || typeof body.body !== 'string' || !body.body.trim()) {
      return apiError('VALIDATION_ERROR', 'Note content cannot be empty', 422);
    }

    const note = await distributorsService.createDistributorNote(distributorId, body.body.trim(), user.id);
    return apiSuccess(note, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create distributor note', 500);
  }
}
