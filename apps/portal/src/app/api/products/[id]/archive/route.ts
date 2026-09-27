import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireInternalUser, canWriteProducts, AUTH_CONFIG } from '@trionyx/auth';
import { productsRepository, auditLogsRepository } from '@trionyx/database';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canWriteProducts(user.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to archive products.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const product = await productsRepository.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const archived = await productsRepository.archive(id, user.id);

    // Record audit event
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'PRODUCT_ARCHIVED',
      metadata: {
        productId: product.id,
        productCode: product.productCode,
        name: product.name,
      },
    });

    return NextResponse.json({ success: true, product: archived });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to archive product' }, { status: 500 });
  }
}
