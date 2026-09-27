import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canManageDealers, AUTH_CONFIG, inviteDealerUser } from '@trionyx/auth';
import { dealersRepository } from '@trionyx/database';
import { inviteDealerUserSchema } from '@trionyx/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDealers(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to invite dealer users.' },
        { status: 403 }
      );
    }

    const { id: dealerId } = await params;
    const dealer = await dealersRepository.findById(dealerId);
    if (!dealer) {
      return NextResponse.json({ success: false, error: 'Dealer not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = inviteDealerUserSchema.safeParse({
      ...body,
      dealerId,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid user data' },
        { status: 400 }
      );
    }

    const { name, email } = parseResult.data;

    const { user: createdUser, rawToken, activationPath } = await inviteDealerUser(
      dealerId,
      name,
      email,
      user.id
    );

    const dealerPortalBaseUrl =
      process.env.NEXT_PUBLIC_DEALER_PORTAL_URL || 'http://localhost:3001';
    const invitationLink = `${dealerPortalBaseUrl}${activationPath}`;

    return NextResponse.json(
      {
        success: true,
        user: createdUser,
        token: rawToken,
        invitationLink,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 400 }
    );
  }
}
