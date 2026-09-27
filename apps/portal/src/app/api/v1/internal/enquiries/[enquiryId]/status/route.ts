import { cookies } from 'next/headers';
import { requireEnquiryWritePermission, AUTH_CONFIG } from '@trionyx/auth';
import { contactEnquiriesService, apiSuccess, apiError } from '@trionyx/api';
import { updateEnquiryStatusSchema } from '@trionyx/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const { enquiryId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireEnquiryWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = updateEnquiryStatusSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid status data', 422);
    }

    const updated = await contactEnquiriesService.updateStatus(enquiryId, parse.data.status, user.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.message === 'Enquiry not found') return apiError('NOT_FOUND', 'Enquiry not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update enquiry status', 500);
  }
}
