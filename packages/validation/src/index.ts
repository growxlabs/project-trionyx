import { z } from 'zod';
import type { Role } from '@trionyx/types';

/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 * Directives: Never infer roles or permissions from email address string patterns.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Canonical Login Validation Schema
 * Authoritative on both client (convenience) and server (enforcement).
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((val) => normalizeEmail(val)),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password cannot exceed 128 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Internal User Bootstrap Schema
 * Supported roles for internal portal: DISTRIBUTOR, MANAGING_DIRECTOR, ADMIN.
 */
export const INTERNAL_PORTAL_ROLES = ['DISTRIBUTOR', 'MANAGING_DIRECTOR', 'ADMIN'] as const;
export type InternalPortalRole = (typeof INTERNAL_PORTAL_ROLES)[number];

export const createInternalUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((val) => normalizeEmail(val)),
  role: z.enum(INTERNAL_PORTAL_ROLES, {
    message: 'Role must be DISTRIBUTOR, MANAGING_DIRECTOR, or ADMIN',
  }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

export type CreateInternalUserInput = z.infer<typeof createInternalUserSchema>;

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[0-9+() -]{10,15}$/.test(phone);
}

export function validateRequired(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * PRODUCT & CATEGORY VALIDATION SCHEMAS
 */

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().trim().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  sortOrder: z.number().int().default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const specificationInputSchema = z.object({
  label: z.string().trim().min(1, 'Specification label cannot be empty').max(100),
  value: z.string().trim().min(1, 'Specification value cannot be empty').max(500),
  sortOrder: z.number().int().optional().default(0),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(200),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  categoryId: z.string().min(1, 'Category is required'),
  shortDescription: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).default('DRAFT'),
  publicVisibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  specifications: z.array(specificationInputSchema).optional().default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  specifications: z.array(specificationInputSchema).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/**
 * INVENTORY & SERIAL TRACKING VALIDATION SCHEMAS
 */

export const createLocationSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Location code must be at least 2 characters')
    .max(30)
    .regex(/^[A-Z0-9_-]+$/, 'Location code must only contain uppercase letters, numbers, dashes, and underscores')
    .transform((c) => c.toUpperCase()),
  name: z.string().trim().min(2, 'Location name must be at least 2 characters').max(100),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;

export const receiveSerialsSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  locationId: z.string().min(1, 'Inventory location is required'),
  serialNumbers: z
    .array(z.string().trim().min(2, 'Serial number must be at least 2 characters'))
    .min(1, 'At least one serial number is required'),
  reference: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type ReceiveSerialsInput = z.infer<typeof receiveSerialsSchema>;

export const transferSerialsSchema = z
  .object({
    serialNumbers: z
      .array(z.string().trim().min(2, 'Serial number must be at least 2 characters'))
      .min(1, 'At least one serial number must be selected'),
    sourceLocationId: z.string().min(1, 'Source location is required'),
    destinationLocationId: z.string().min(1, 'Destination location is required'),
    reference: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  })
  .refine((data) => data.sourceLocationId !== data.destinationLocationId, {
    message: 'Source and destination locations cannot be the same',
    path: ['destinationLocationId'],
  });

export type TransferSerialsInput = z.infer<typeof transferSerialsSchema>;

export const adjustSerialStatusSchema = z.object({
  serialRecordId: z.string().min(1, 'Serial record ID is required'),
  newStatus: z.enum(['AVAILABLE', 'TRANSFERRED', 'INACTIVE']),
  reason: z.string().trim().min(3, 'Adjustment reason is mandatory (minimum 3 characters)'),
  notes: z.string().trim().optional().nullable(),
});

export type AdjustSerialStatusInput = z.infer<typeof adjustSerialStatusSchema>;

/**
 * DEALER & DISTRIBUTOR VALIDATION SCHEMAS
 */

export const createDistributorSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(200),
  legalName: z.string().trim().max(200).optional().nullable(),
  contactPerson: z.string().trim().min(2, 'Contact person must be at least 2 characters').max(100),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits').max(20),
  alternatePhone: z.string().trim().max(20).optional().nullable(),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  addressLine1: z.string().trim().max(255).optional().nullable(),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100),
  district: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().min(2, 'State must be at least 2 characters').max(100),
  postalCode: z.string().trim().max(20).optional().nullable(),
  country: z.string().trim().max(100).default('India'),
  territory: z.string().trim().max(100).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  gstin: z.string().trim().max(20).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export type CreateDistributorInput = z.infer<typeof createDistributorSchema>;

export const updateDistributorSchema = createDistributorSchema.partial();
export type UpdateDistributorInput = z.infer<typeof updateDistributorSchema>;

export const distributorStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});
export type DistributorStatusInput = z.infer<typeof distributorStatusSchema>;

export const createDealerSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(200),
  legalName: z.string().trim().max(200).optional().nullable(),
  contactPerson: z.string().trim().min(2, 'Contact person must be at least 2 characters').max(100),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits').max(20),
  alternatePhone: z.string().trim().max(20).optional().nullable(),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  addressLine1: z.string().trim().max(255).optional().nullable(),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100),
  district: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().min(2, 'State must be at least 2 characters').max(100),
  postalCode: z.string().trim().max(20).optional().nullable(),
  country: z.string().trim().max(100).default('India'),
  distributorId: z.string().trim().optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  gstin: z.string().trim().max(20).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export type CreateDealerInput = z.infer<typeof createDealerSchema>;

export const updateDealerSchema = createDealerSchema.partial();
export type UpdateDealerInput = z.infer<typeof updateDealerSchema>;

export const dealerStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});
export type DealerStatusInput = z.infer<typeof dealerStatusSchema>;

export const reassignDealerDistributorSchema = z.object({
  newDistributorId: z.string().trim().optional().nullable().or(z.literal('')),
  reason: z.string().trim().min(3, 'Reassignment reason is mandatory (minimum 3 characters)').max(500),
});
export type ReassignDealerDistributorInput = z.infer<typeof reassignDealerDistributorSchema>;

export const createDealerRequestSchema = z.object({
  dealerId: z.string().min(1, 'Dealer is required'),
  type: z.enum(['PRODUCT_ENQUIRY', 'AVAILABILITY', 'GENERAL_SUPPORT', 'OTHER']),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedTo: z.string().trim().optional().nullable(),
});
export type CreateDealerRequestInput = z.infer<typeof createDealerRequestSchema>;

export const updateDealerRequestStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  assignedTo: z.string().trim().optional().nullable(),
});
export type UpdateDealerRequestStatusInput = z.infer<typeof updateDealerRequestStatusSchema>;

export const createInternalNoteSchema = z.object({
  entityType: z.enum(['DEALER', 'DISTRIBUTOR']),
  entityId: z.string().min(1, 'Entity ID is required'),
  body: z.string().trim().min(1, 'Note content cannot be empty').max(2000),
});
export type CreateInternalNoteInput = z.infer<typeof createInternalNoteSchema>;

/**
 * STEP 4: DEALER PORTAL VALIDATION SCHEMAS
 */

export const inviteDealerUserSchema = z.object({
  dealerId: z.string().min(1, 'Dealer ID is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
});
export type InviteDealerUserInput = z.infer<typeof inviteDealerUserSchema>;

export const activateDealerUserSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});
export type ActivateDealerUserInput = z.infer<typeof activateDealerUserSchema>;

export const dealerLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type DealerLoginInput = z.infer<typeof dealerLoginSchema>;

export const updateDealerProfileByDealerSchema = z.object({
  contactPerson: z.string().trim().min(2, 'Contact person must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits').max(20).optional(),
  alternatePhone: z.string().trim().max(20).optional().nullable(),
  email: z.string().trim().email('Please enter a valid email address').optional().nullable().or(z.literal('')),
  addressLine1: z.string().trim().max(255).optional().nullable(),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100).optional(),
  state: z.string().trim().min(2, 'State must be at least 2 characters').max(100).optional(),
  postalCode: z.string().trim().max(20).optional().nullable(),
});
export type UpdateDealerProfileByDealerInput = z.infer<typeof updateDealerProfileByDealerSchema>;

export const changeDealerPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});
export type ChangeDealerPasswordInput = z.infer<typeof changeDealerPasswordSchema>;

export const dealerForgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});
export type DealerForgotPasswordInput = z.infer<typeof dealerForgotPasswordSchema>;

export const dealerResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});
export type DealerResetPasswordInput = z.infer<typeof dealerResetPasswordSchema>;

export const createDealerPortalRequestSchema = z.object({
  type: z.enum(['PRODUCT_ENQUIRY', 'AVAILABILITY', 'GENERAL_SUPPORT', 'OTHER']),
  productId: z.string().trim().optional().nullable(),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});
export type CreateDealerPortalRequestInput = z.infer<typeof createDealerPortalRequestSchema>;

export const createDealerRequestMessageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(2000),
});
export type CreateDealerRequestMessageInput = z.infer<typeof createDealerRequestMessageSchema>;

/**
 * CANONICAL /api/v1 PAGINATION & QUERY SCHEMAS
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
});
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

/**
 * Contact Enquiry Validation Schema (Public Contact Form)
 */
export const createContactEnquirySchema = z
  .object({
    type: z.enum(
      ['PRODUCT_ENQUIRY', 'DEALER_ENQUIRY', 'DISTRIBUTION_ENQUIRY', 'PRODUCT_SUPPORT', 'GENERAL_ENQUIRY'],
      { message: 'Please select an enquiry type' }
    ),
    fullName: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    phone: z
      .string()
      .trim()
      .min(10, 'Please enter a valid phone number')
      .max(15, 'Phone number is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .transform((val) => normalizeEmail(val)),
    city: z.string().trim().min(1, 'City is required').max(100),
    state: z.string().trim().min(1, 'State is required').max(100),
    pincode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
    companyName: z.string().trim().max(200).optional().or(z.literal('')),
    businessAddress: z.string().trim().max(500).optional().or(z.literal('')),
    businessType: z.string().trim().max(100).optional().or(z.literal('')),
    territory: z.string().trim().max(100).optional().or(z.literal('')),
    productId: z.string().uuid().optional().or(z.literal('')),
    purchaseDealerDetails: z.string().trim().max(500).optional().or(z.literal('')),
    message: z.string().trim().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'DEALER_ENQUIRY') {
      if (!data.companyName || !data.companyName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business / Company Name is required for dealer enquiries',
          path: ['companyName'],
        });
      }
      if (!data.businessAddress || !data.businessAddress.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business Address is required for dealer enquiries',
          path: ['businessAddress'],
        });
      }
    }
    if (data.type === 'DISTRIBUTION_ENQUIRY') {
      if (!data.companyName || !data.companyName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Company Name is required for distribution enquiries',
          path: ['companyName'],
        });
      }
      if (!data.businessAddress || !data.businessAddress.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business Address is required for distribution enquiries',
          path: ['businessAddress'],
        });
      }
      if (!data.territory || !data.territory.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Territory / Area is required for distribution enquiries',
          path: ['territory'],
        });
      }
    }
  });

export type CreateContactEnquiryInput = z.infer<typeof createContactEnquirySchema>;

/**
 * Internal Operations Enquiry Schemas
 */
export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'CLOSED'], {
    message: 'Status must be NEW, IN_PROGRESS, or CLOSED',
  }),
});
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;

export const assignEnquirySchema = z.object({
  assignedTo: z.string().uuid().nullable().optional(),
});
export type AssignEnquiryInput = z.infer<typeof assignEnquirySchema>;

export const createEnquiryNoteSchema = z.object({
  body: z.string().trim().min(1, 'Note content cannot be empty').max(2000, 'Note is too long'),
});
export type CreateEnquiryNoteInput = z.infer<typeof createEnquiryNoteSchema>;

/**
 * Warranty Validation Schemas
 */

export const checkWarrantySchema = z.object({
  serialNumber: z
    .string()
    .trim()
    .min(1, 'Serial number is required')
    .max(100, 'Serial number is too long')
    .transform((val) => val.trim().toUpperCase()),
});
export type CheckWarrantyInput = z.infer<typeof checkWarrantySchema>;

export const activateWarrantySchema = z.object({
  serialNumber: z
    .string()
    .trim()
    .min(1, 'Serial number is required')
    .max(100, 'Serial number is too long')
    .transform((val) => val.trim().toUpperCase()),
  installationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Installation date must be in YYYY-MM-DD format'),
  dealerId: z.string().trim().optional().nullable(),
});
export type ActivateWarrantyInput = z.infer<typeof activateWarrantySchema>;

export const voidWarrantySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});
export type VoidWarrantyInput = z.infer<typeof voidWarrantySchema>;

export const upsertWarrantyPolicySchema = z.object({
  durationMonths: z
    .number()
    .int('Duration must be a whole number of months')
    .min(1, 'Duration must be at least 1 month')
    .max(120, 'Duration cannot exceed 120 months (10 years)'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});
export type UpsertWarrantyPolicyInput = z.infer<typeof upsertWarrantyPolicySchema>;


