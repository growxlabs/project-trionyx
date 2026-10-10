import { getServerActiveOrg } from '@/lib/serverOrg';
import { productsService, apiSuccess, apiError } from '@trionyx/api';
import { createCategorySchema } from '@trionyx/validation';

export async function GET(request: Request) {
  try {
    const { activeOrg } = await getServerActiveOrg(request);
    const categories = await productsService.listCategories(activeOrg.id);
    return apiSuccess(categories, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Server error', status);
  }
}

export async function POST(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Insufficient permissions', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = createCategorySchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid category data', 422);
    }

    const created = await productsService.createCategory({
      ...parse.data,
      organizationId: activeOrg.id,
    });
    return apiSuccess(created, 201);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to create category', status);
  }
}
