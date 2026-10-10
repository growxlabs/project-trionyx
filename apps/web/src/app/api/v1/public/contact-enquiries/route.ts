import { NextRequest } from 'next/server';
import { apiSuccess, apiError, contactEnquiriesService } from '@trionyx/api';
import { createContactEnquirySchema } from '@trionyx/validation';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Simple in-memory rate limiter (5 submissions per IP per hour)
const rateStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      return apiError('RATE_LIMITED', 'Too many requests. Please try again later.', 429, undefined, corsHeaders);
    }

    const rawBody = await request.json().catch(() => ({}));

    // Honeypot check — if hidden "website" field is filled, it's an automated bot
    if (rawBody.website) {
      return apiSuccess({ enquiryCode: 'TRX-ENQ-000000' }, 201, corsHeaders);
    }

    // Explicitly pick only public-submittable fields to prevent any prototype pollution
    // or injection of internal fields (status, assignedTo, internalNotes, createdBy, etc.)
    const publicPayload = {
      type: rawBody.type,
      fullName: rawBody.fullName,
      phone: rawBody.phone,
      email: rawBody.email,
      companyName: rawBody.companyName,
      businessAddress: rawBody.businessAddress,
      businessType: rawBody.businessType,
      city: rawBody.city,
      state: rawBody.state,
      pincode: rawBody.pincode,
      territory: rawBody.territory,
      productId: rawBody.productId,
      purchaseDealerDetails: rawBody.purchaseDealerDetails,
      message: rawBody.message,
    };

    // Validate using Zod schema
    const parsed = createContactEnquirySchema.safeParse(publicPayload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiError(
        'VALIDATION_ERROR',
        firstIssue?.message || 'Invalid request data',
        400,
        parsed.error.flatten().fieldErrors,
        corsHeaders
      );
    }

    // Create enquiry with server-controlled status (NEW) and assignedTo (null)
    const enquiry = await contactEnquiriesService.create(
      {
        type: parsed.data.type,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        companyName: parsed.data.companyName || null,
        businessAddress: parsed.data.businessAddress || null,
        businessType: parsed.data.businessType || null,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        territory: parsed.data.territory || null,
        productId: parsed.data.productId || null,
        purchaseDealerDetails: parsed.data.purchaseDealerDetails || null,
        message: parsed.data.message,
      },
      { ipAddress: clientIp, userAgent }
    );

    return apiSuccess({ enquiryCode: enquiry.enquiryCode }, 201, corsHeaders);
  } catch (err) {
    console.error('[Contact Enquiry] Error:', err);
    return apiError('INTERNAL_ERROR', 'Something went wrong. Please try again.', 500, undefined, corsHeaders);
  }
}
