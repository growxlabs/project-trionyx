import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canWriteProducts, AUTH_CONFIG } from '@trionyx/auth';
import {
  productsRepository,
  specificationsRepository,
  auditLogsRepository,
  getDbClient,
} from '@trionyx/database';
import { createProductSchema } from '@trionyx/validation';
import type { ProductStatus, PublicVisibility } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = (searchParams.get('status') as ProductStatus) || undefined;
    const publicVisibility = (searchParams.get('publicVisibility') as PublicVisibility) || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const [products, total] = await Promise.all([
      productsRepository.list({ categoryId, status, publicVisibility, search, limit, offset }),
      productsRepository.count({ categoryId, status, publicVisibility, search }),
    ]);

    return NextResponse.json({ success: true, products, total });
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
        { success: false, error: 'You do not have permission to create products.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createProductSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid product data' },
        { status: 400 }
      );
    }

    const { name, slug, categoryId, shortDescription, description, status, publicVisibility, specifications } =
      parseResult.data;

    // Check slug uniqueness
    const existingSlug = await productsRepository.findBySlug(slug);
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: `Product slug "${slug}" is already in use.` },
        { status: 400 }
      );
    }

    const client = getDbClient();

    // 1. Create product
    const product = await productsRepository.create(
      {
        name,
        slug,
        categoryId,
        shortDescription,
        description,
        status,
        publicVisibility,
        createdBy: user.id,
      },
      client
    );

    // 2. Create specifications
    if (specifications && specifications.length > 0) {
      await specificationsRepository.replaceForProduct(product.id, specifications, client);
    }

    // 3. Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: user.id,
        event: 'PRODUCT_CREATED',
        metadata: {
          productId: product.id,
          productCode: product.productCode,
          name: product.name,
          slug: product.slug,
        },
      },
      client
    );

    const fullProduct = await productsRepository.findWithRelations(product.id, client);
    return NextResponse.json({ success: true, product: fullProduct }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
