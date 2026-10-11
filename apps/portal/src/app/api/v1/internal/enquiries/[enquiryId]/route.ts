import { getServerActiveOrg } from '@/lib/serverOrg';
import { contactEnquiriesService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const { enquiryId } = await params;
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Access denied', 403);
    }

    const enquiry = await contactEnquiriesService.getById(enquiryId, activeOrg.id);
    if (!enquiry) {
      return apiError('NOT_FOUND', 'Enquiry not found', 404);
    }

    // Check for previous enquiries with matching phone or email
    const duplicates = await contactEnquiriesService.getDuplicates(
      enquiry.phone,
      enquiry.email || '',
      enquiry.id
    );

    return apiSuccess({ enquiry, duplicates }, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to fetch enquiry', status);
  }
}
