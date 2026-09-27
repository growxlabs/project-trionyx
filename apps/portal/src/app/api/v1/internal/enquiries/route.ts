import { cookies } from 'next/headers';
import { requireEnquiryReadPermission, AUTH_CONFIG } from '@trionyx/auth';
import { contactEnquiriesService, apiCollection, apiError } from '@trionyx/api';
import type { ContactEnquiryStatus, ContactEnquiryType } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireEnquiryReadPermission(token);

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
    });

    const meta = {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    };

    return apiCollection(result.items, meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list enquiries', 500);
  }
}
