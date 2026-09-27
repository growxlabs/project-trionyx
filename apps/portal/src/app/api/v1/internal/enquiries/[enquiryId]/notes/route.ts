import { cookies } from 'next/headers';
import {
  requireEnquiryReadPermission,
  requireEnquiryWritePermission,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { contactEnquiriesService, apiSuccess, apiError } from '@trionyx/api';
import { createEnquiryNoteSchema } from '@trionyx/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const { enquiryId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireEnquiryReadPermission(token);

    const notes = await contactEnquiriesService.listNotes(enquiryId);
    return apiSuccess(notes, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list enquiry notes', 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const { enquiryId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireEnquiryWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = createEnquiryNoteSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid note content', 422);
    }

    const note = await contactEnquiriesService.addNote(enquiryId, parse.data.body, user.id);
    return apiSuccess(note, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.message === 'Enquiry not found') return apiError('NOT_FOUND', 'Enquiry not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to add enquiry note', 500);
  }
}
