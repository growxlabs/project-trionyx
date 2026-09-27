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

    // Availability view maps to lean availability summaries without leaking any internal data
    const availabilityList = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      productCode: p.productCode,
      categoryName: p.categoryName || 'General',
      availability: p.availability,
      lastUpdated: p.lastUpdated,
    }));

    return NextResponse.json({
      success: true,
      items: availabilityList,
      categories: categories.map((c: any) => ({ id: c.id, name: c.name })),
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer availability API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
