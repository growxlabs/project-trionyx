import { NextResponse } from 'next/server';
import { getWorkspaceSession } from '@/lib/auth';
import { changeDealerPassword, verifyPassword, hashPassword } from '@trionyx/auth';
import { usersRepository } from '@trionyx/database';
import { changeDealerPasswordSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSession();

    const body = await request.json().catch(() => ({}));
    const parseResult = changeDealerPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid password data',
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;

    if (session.type === 'DEALER') {
      await changeDealerPassword(session.dealerUser.id, currentPassword, newPassword);
    } else {
      const user = await usersRepository.findById(session.user.id);
      if (!user || !user.passwordHash) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect.' },
          { status: 400 }
        );
      }

      const newHash = await hashPassword(newPassword);
      await usersRepository.update(user.id, { passwordHash: newHash });
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to change password',
      },
      { status: 400 }
    );
  }
}
