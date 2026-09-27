import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canWriteProducts, AUTH_CONFIG } from '@trionyx/auth';
import {
  productsRepository,
  specificationsRepository,
  auditLogsRepository,
  getDbClient,
} from '@trionyx/database';
import { updateProductSchema } from '@trionyx/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const { id } = await params;
    const product = await productsRepository.findWithRelations(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canWriteProducts(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update products.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await productsRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateProductSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid product data' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const duplicateSlug = await productsRepository.findBySlug(data.slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        return NextResponse.json(
          { success: false, error: `Product slug "${data.slug}" is already in use.` },
          { status: 400 }
        );
      }
    }

    const client = getDbClient();

    // 1. Update product
    const updated = await productsRepository.update(
      id,
      {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        shortDescription: data.shortDescription,
        description: data.description,
        status: data.status,
        publicVisibility: data.publicVisibility,
        updatedBy: user.id,
      },
      client
    );

    // 2. Update specifications if supplied
    if (data.specifications !== undefined) {
      await specificationsRepository.replaceForProduct(id, data.specifications, client);
    }

    // 4. Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: user.id,
        event: 'PRODUCT_UPDATED',
        metadata: {
          productId: id,
          productCode: existing.productCode,
          name: updated?.name,
        },
      },
      client
    );

    const fullProduct = await productsRepository.findWithRelations(id, client);
    return NextResponse.json({ success: true, product: fullProduct });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
