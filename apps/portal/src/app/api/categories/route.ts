import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canWriteProducts, AUTH_CONFIG } from '@trionyx/auth';
import { categoriesRepository } from '@trionyx/database';
import { createCategorySchema } from '@trionyx/validation';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as 'ACTIVE' | 'INACTIVE') || undefined;

    const categories = await categoriesRepository.list({ search, status });
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canWriteProducts(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage categories.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createCategorySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const existingSlug = await categoriesRepository.findBySlug(parseResult.data.slug);
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: `Category slug "${parseResult.data.slug}" is already in use.` },
        { status: 400 }
      );
    }

    const category = await categoriesRepository.create(parseResult.data);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}
