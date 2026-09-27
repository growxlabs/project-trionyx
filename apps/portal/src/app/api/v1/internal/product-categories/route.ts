import { cookies } from 'next/headers';
import {
  requireInternalUser,
  requireProductWritePermission,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { productsService, apiSuccess, apiError } from '@trionyx/api';
import { createCategorySchema } from '@trionyx/validation';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const categories = await productsService.listCategories();
    return apiSuccess(categories, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Server error', 500);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireProductWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = createCategorySchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid category data', 422);
    }

    const created = await productsService.createCategory(parse.data);
    return apiSuccess(created, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create category', 500);
  }
}
