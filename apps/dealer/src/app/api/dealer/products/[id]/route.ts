import { NextResponse } from 'next/server';
import { getWorkspaceSession } from '@/lib/auth';
import { productsRepository } from '@trionyx/database';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getWorkspaceSession();

    const { id } = await params;
    const product = await productsRepository.getDealerProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHENTICATED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dealer product detail API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
