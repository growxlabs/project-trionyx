import { cookies } from 'next/headers';
import {
  requireInternalUser,
  canManageDealers,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { dealersService, apiSuccess, apiError } from '@trionyx/api';
import { dealerUsersRepository, dealerSessionsRepository, auditLogsRepository } from '@trionyx/database';
import type { DealerUserStatus } from '@trionyx/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const distributorScope = getDistributorScope(user);
    const users = await dealersService.listDealerUsers(dealerId, distributorScope);

    return apiSuccess(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        failedLoginCount: u.failedLoginCount,
        lockedUntil: u.lockedUntil,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
      200
    );
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list dealer users', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDealers(user.role)) {
      return apiError('FORBIDDEN', 'You do not have permission to manage dealer users', 403);
    }

    const distributorScope = getDistributorScope(user);
    const dealer = await dealersService.getDealerById(dealerId, distributorScope);
    if (!dealer) {
      return apiError('NOT_FOUND', 'Dealer not found', 404);
    }

    const body = await request.json().catch(() => ({}));
    const { userId, status } = body as { userId: string; status: DealerUserStatus };

    if (!userId || !['ACTIVE', 'DISABLED'].includes(status)) {
      return apiError('VALIDATION_ERROR', 'Invalid user ID or status. Status must be ACTIVE or DISABLED.', 422);
    }

    const targetUser = await dealerUsersRepository.findById(userId);
    if (!targetUser || targetUser.dealerId !== dealerId) {
      return apiError('NOT_FOUND', 'Dealer user not found', 404);
    }

    const updated = await dealerUsersRepository.updateStatus(userId, status);

    if (status === 'DISABLED') {
      await dealerSessionsRepository.deleteByUserId(userId);
      await auditLogsRepository.recordEvent({
        userId: user.id,
        event: 'DEALER_USER_DISABLED',
        metadata: { dealerId, dealerUserId: userId, email: targetUser.email },
      });
    } else if (status === 'ACTIVE') {
      await dealerUsersRepository.resetLockout(userId);
      await auditLogsRepository.recordEvent({
        userId: user.id,
        event: 'DEALER_USER_ACTIVATED',
        metadata: { dealerId, dealerUserId: userId, email: targetUser.email, reenabledBy: user.id },
      });
    }

    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update dealer user', 500);
  }
}
