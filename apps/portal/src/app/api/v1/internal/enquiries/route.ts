import { getServerActiveOrg } from '@/lib/serverOrg';
import { contactEnquiriesService, apiCollection, apiError } from '@trionyx/api';
import type { ContactEnquiryStatus, ContactEnquiryType } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Access denied', 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const type = (searchParams.get('type') as ContactEnquiryType | 'ALL') || undefined;
    const status = (searchParams.get('status') as ContactEnquiryStatus | 'ALL') || undefined;
    const state = searchParams.get('state') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;

    const result = await contactEnquiriesService.list({
      search,
      type,
      status,
      state,
      assignedTo,
      page,
      limit: pageSize,
      organizationId: activeOrg.id,
    });

    const meta = {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    };

    return apiCollection(result.items, meta, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to list enquiries', status);
  }
}
