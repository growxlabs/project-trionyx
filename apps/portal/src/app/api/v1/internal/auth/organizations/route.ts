import { getServerActiveOrg } from '@/lib/serverOrg';
import { apiSuccess, apiError } from '@trionyx/api';

export async function GET(request: Request) {
  try {
    const { activeOrg, membership, memberships } = await getServerActiveOrg(request);

    return apiSuccess(
      {
        activeOrg,
        membership,
        memberships,
      },
      200
    );
  } catch (err: any) {
    const status = err.statusCode || 500;
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to retrieve organizations', status);
  }
}
