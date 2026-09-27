import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDealers, AUTH_CONFIG } from '@trionyx/auth';
import {
  dealersRepository,
  dealerUsersRepository,
  dealerSessionsRepository,
  auditLogsRepository,
} from '@trionyx/database';
import type { DealerUserStatus } from '@trionyx/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { id: dealerId } = await params;
    const dealer = await dealersRepository.findById(dealerId);
    if (!dealer) {
      return NextResponse.json({ success: false, error: 'Dealer not found' }, { status: 404 });
    }

    if (user.role === 'DISTRIBUTOR' && dealer.distributorId !== user.distributorId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const users = await dealerUsersRepository.listByDealer(dealerId);

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        failedLoginCount: u.failedLoginCount,
        lockedUntil: u.lockedUntil,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('List dealer users error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDealers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage dealer users.' },
        { status: 403 }
      );
    }

    const { id: dealerId } = await params;
    const dealer = await dealersRepository.findById(dealerId);
    if (!dealer) {
      return NextResponse.json({ success: false, error: 'Dealer not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { userId, status } = body as { userId: string; status: DealerUserStatus };

    if (!userId || !['ACTIVE', 'DISABLED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID or status. Status must be ACTIVE or DISABLED.' },
        { status: 400 }
      );
    }

    const targetUser = await dealerUsersRepository.findById(userId);
    if (!targetUser || targetUser.dealerId !== dealerId) {
      return NextResponse.json({ success: false, error: 'Dealer user not found' }, { status: 404 });
    }

    const updated = await dealerUsersRepository.updateStatus(userId, status);

    // If disabled or unlocked, clear sessions or reset locks
    if (status === 'DISABLED') {
      await dealerSessionsRepository.deleteByUserId(userId);
      await auditLogsRepository.recordEvent({
        userId: user.id,
        event: 'DEALER_USER_DISABLED',
        metadata: {
          dealerId,
          dealerUserId: userId,
          email: targetUser.email,
        },
      });
    } else if (status === 'ACTIVE') {
      await dealerUsersRepository.resetLockout(userId);
      await auditLogsRepository.recordEvent({
        userId: user.id,
        event: 'DEALER_USER_ACTIVATED',
        metadata: {
          dealerId,
          dealerUserId: userId,
          email: targetUser.email,
          reenabledBy: user.id,
        },
      });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update dealer user status error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
