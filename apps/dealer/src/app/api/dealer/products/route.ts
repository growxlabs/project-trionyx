import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';
import { productsRepository, categoriesRepository } from '@trionyx/database';
import type { DealerProductAvailability } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;
    await requireDealerSession(token);

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const availability = (searchParams.get('availability') as DealerProductAvailability) || undefined;

    const [products, categories] = await Promise.all([
      productsRepository.listDealerProducts({
        categoryId,
        search,
        availability,
      }),
      categoriesRepository.listAllActive(),
    ]);

    return NextResponse.json({
      success: true,
      products,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer products API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
