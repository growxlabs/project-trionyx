import { cookies } from 'next/headers';
import { requireEnquiryReadPermission, AUTH_CONFIG } from '@trionyx/auth';
import { contactEnquiriesService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const { enquiryId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireEnquiryReadPermission(token);

    const enquiry = await contactEnquiriesService.getById(enquiryId);
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
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch enquiry', 500);
  }
}
