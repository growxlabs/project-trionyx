/**
 * TRIONYX CANONICAL DOMAIN TYPES
 * Corresponds to /docs/14-DATA-MODEL.md
 */

export type Role = 'DEALER' | 'DISTRIBUTOR' | 'MANAGING_DIRECTOR' | 'ADMIN' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  status: UserStatus;
  lastLoginAt?: string | null;
  failedLoginCount: number;
  lockedUntil?: string | null;
  distributorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  lastSeenAt: string;
}

export type AuditEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'ACCOUNT_LOCKED'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'USER_BOOTSTRAPPED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_ARCHIVED'
  | 'SERIAL_RECEIVED'
  | 'SERIAL_ADDED'
  | 'SERIAL_STATUS_CHANGED'
  | 'SERIAL_TRANSFERRED'
  | 'INVENTORY_LOCATION_CREATED'
  | 'INVENTORY_LOCATION_UPDATED'
  | 'DEALER_CREATED'
  | 'DEALER_UPDATED'
  | 'DEALER_STATUS_CHANGED'
  | 'DEALER_DISTRIBUTOR_ASSIGNED'
  | 'DEALER_DISTRIBUTOR_REASSIGNED'
  | 'DISTRIBUTOR_CREATED'
  | 'DISTRIBUTOR_UPDATED'
  | 'DISTRIBUTOR_STATUS_CHANGED'
  | 'DEALER_REQUEST_CREATED'
  | 'DEALER_REQUEST_UPDATED'
  | 'DEALER_REQUEST_RESOLVED'
  | 'INTERNAL_NOTE_CREATED'
  | 'DEALER_USER_INVITED'
  | 'DEALER_USER_ACTIVATED'
  | 'DEALER_USER_DISABLED'
  | 'DEALER_USER_ENABLED'
  | 'DEALER_LOGIN_SUCCESS'
  | 'DEALER_LOGIN_FAILURE'
  | 'DEALER_LOGOUT'
  | 'DEALER_ACCOUNT_UPDATED'
  | 'DEALER_PASSWORD_CHANGED'
  | 'DEALER_PASSWORD_RESET_REQUESTED'
  | 'DEALER_PASSWORD_RESET_COMPLETED'
  | 'DEALER_REQUEST_MESSAGE_CREATED'
  | 'CONTACT_ENQUIRY_CREATED'
  | 'CONTACT_ENQUIRY_STATUS_CHANGED'
  | 'CONTACT_ENQUIRY_ASSIGNED'
  | 'CONTACT_ENQUIRY_NOTE_ADDED'
  | 'WARRANTY_ACTIVATED'
  | 'WARRANTY_VOIDED'
  | 'WARRANTY_POLICY_CREATED'
  | 'WARRANTY_POLICY_UPDATED'
  | 'ORGANIZATION_SWITCHED'
  | 'ORGANIZATION_MEMBER_ADDED';

export interface AuditLog {
  id: string;
  organizationId?: string | null;
  userId?: string | null;
  event: AuditEvent;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface DealerApplication {
  id: string;
  studioName: string;
  ownerName: string;
  city: string;
  state: string;
  phone: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
}

/**
 * BRANDS, PRODUCTS & SPECIFICATIONS DOMAIN
 */

export interface Brand {
  id: string;
  organizationId?: string | null;
  businessCode: 'TRIONYX' | 'LAKSHMI' | string;
  name: string;
  slug: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  organizationId?: string | null;
  businessCode?: 'TRIONYX' | 'LAKSHMI' | string;
  brandId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type PublicVisibility = 'PRIVATE' | 'PUBLIC';

export interface Product {
  id: string;
  organizationId?: string | null;
  productCode: string; // e.g. TRX-PROD-000001 or LAK-PROD-000001
  businessCode?: 'TRIONYX' | 'LAKSHMI' | string;
  brandId?: string | null;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription?: string | null;
  description?: string | null;
  status: ProductStatus;
  publicVisibility: PublicVisibility;
  dealerVisibility: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  id: string;
  productId: string;
  label: string;
  value: string;
  sortOrder: number;
}

export type MediaType = 'IMAGE' | 'DOCUMENT';

export interface ProductMedia {
  id: string;
  productId: string;
  type: MediaType;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  altText?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ProductWithRelations extends Product {
  brand?: Brand;
  category?: ProductCategory;
  specifications: ProductSpecification[];
  media: ProductMedia[];
}

export interface PublicProductSummary {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  brandName?: string | null;
  brandSlug?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  shortDescription?: string | null;
  primaryImage?: {
    url: string;
    altText?: string | null;
  } | null;
  keySpecification?: {
    label: string;
    value: string;
  } | null;
}

export interface PublicProductDetail extends PublicProductSummary {
  description?: string | null;
  specifications: Array<{
    id: string;
    label: string;
    value: string;
    sortOrder: number;
  }>;
  galleryImages: Array<{
    id: string;
    url: string;
    altText?: string | null;
    sortOrder: number;
  }>;
  brand?: {
    name: string;
    slug: string;
    description?: string | null;
  } | null;
  category?: {
    name: string;
    slug: string;
    description?: string | null;
  } | null;
}

/**
 * INVENTORY & SERIAL NUMBER DOMAIN
 */

export interface InventoryLocation {
  id: string;
  organizationId?: string | null;
  code: string; // e.g. LOC-MAIN
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type SerialStatus = 'AVAILABLE' | 'TRANSFERRED' | 'INACTIVE';

export interface SerialNumberRecord {
  id: string;
  productId: string;
  serialNumber: string;
  locationId: string;
  status: SerialStatus;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerialNumberWithDetails extends SerialNumberRecord {
  product?: {
    id: string;
    productCode: string;
    name: string;
    slug: string;
    categoryId: string;
  };
  location?: {
    id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
  };
  movements?: SerialMovementWithDetails[];
  lastMovementAt?: string | null;
}

export type SerialMovementType = 'RECEIVED' | 'TRANSFERRED' | 'ADJUSTED';

export interface SerialMovement {
  id: string;
  serialRecordId: string;
  productId: string;
  type: SerialMovementType;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  reference?: string | null;
  reason?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface SerialMovementWithDetails extends SerialMovement {
  serialNumber?: string;
  productName?: string;
  productCode?: string;
  fromLocationName?: string;
  fromLocationCode?: string;
  toLocationName?: string;
  toLocationCode?: string;
  actorName?: string;
}

export interface ProductInventorySummary {
  productId: string;
  productCode: string;
  productName: string;
  productSlug: string;
  categoryId: string;
  categoryName?: string;
  locationId?: string;
  locationName?: string;
  locationCode?: string;
  availableCount: number;
  totalCount: number;
  status: ProductStatus;
  lastUpdated: string;
}

export interface CustomerReview {
  id: string;
  authorName: string;
  authorRole: string;
  studioName?: string;
  city?: string;
  rating: number;
  quote: string;
  isApproved: boolean;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: 'GENERAL' | 'STUDIO_PARTNERSHIP' | 'PRODUCT_INQUIRY' | 'WARRANTY';
  message: string;
}

/**
 * INTERNAL OVERVIEW DOMAIN CONTRACT
 */

export interface OverviewSummary {
  activeDealers: number | null;
  orders: number | null;
  lowStock: number | null;
  pendingActions: number | null;
}

export interface OverviewActivity {
  id: string;
  type: string;
  label: string;
  actorName?: string;
  actorEmail?: string;
  createdAt: string;
}

export interface AttentionItem {
  id: string;
  type: string;
  label: string;
  href?: string;
}

export interface InternalOverview {
  user: SafeUser;
  summary: OverviewSummary;
  recentActivity: OverviewActivity[];
  attentionItems: AttentionItem[];
}

/**
 * Formats canonical uppercase database role into human-readable label.
 */
export function formatRoleLabel(role: Role): string {
  switch (role) {
    case 'DISTRIBUTOR':
      return 'Distributor';
    case 'MANAGING_DIRECTOR':
      return 'Managing Director';
    case 'ADMIN':
      return 'Administrator';
    case 'STAFF':
      return 'Staff';
    case 'DEALER':
      return 'Dealer';
    default:
      return role;
  }
}

/**
 * DISTRIBUTOR & DEALER MANAGEMENT DOMAIN
 */

export type DistributorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Distributor {
  id: string;
  organizationId?: string | null;
  distributorCode: string; // e.g. TRX-DST-000001
  businessName: string;
  legalName?: string | null;
  contactPerson: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string;
  district?: string | null;
  state: string;
  postalCode?: string | null;
  country: string;
  territory?: string | null;
  status: DistributorStatus;
  gstin?: string | null;
  notes?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributorWithRelations extends Distributor {
  dealerCount?: number;
  activeDealerCount?: number;
  creatorName?: string;
  updaterName?: string;
}

export type DealerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Dealer {
  id: string;
  organizationId?: string | null;
  dealerCode: string; // e.g. TRX-DLR-000001
  businessName: string;
  legalName?: string | null;
  contactPerson: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string;
  district?: string | null;
  state: string;
  postalCode?: string | null;
  country: string;
  distributorId?: string | null;
  status: DealerStatus;
  gstin?: string | null;
  notes?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealerWithRelations extends Dealer {
  distributor?: {
    id: string;
    distributorCode: string;
    businessName: string;
    contactPerson: string;
    phone: string;
    city: string;
    state: string;
  } | null;
  creatorName?: string;
  updaterName?: string;
}

export interface DealerDistributorHistory {
  id: string;
  dealerId: string;
  previousDistributorId?: string | null;
  newDistributorId?: string | null;
  reason?: string | null;
  changedBy: string;
  changedAt: string;
  previousDistributorName?: string | null;
  newDistributorName?: string | null;
  changedByName?: string | null;
}

export type DealerRequestType = 'PRODUCT_ENQUIRY' | 'AVAILABILITY' | 'GENERAL_SUPPORT' | 'OTHER';
export type DealerRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type DealerRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface DealerRequest {
  id: string;
  requestCode: string; // e.g. TRX-REQ-000001
  dealerId: string;
  productId?: string | null;
  productName?: string | null;
  type: DealerRequestType;
  subject: string;
  description: string;
  status: DealerRequestStatus;
  priority: DealerRequestPriority;
  assignedTo?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  dealerName?: string;
  dealerCode?: string;
  assignedToName?: string | null;
  createdByName?: string;
}

export interface InternalNote {
  id: string;
  entityType: 'DEALER' | 'DISTRIBUTOR';
  entityId: string;
  body: string;
  createdBy: string;
  createdAt: string;
  authorName?: string;
}

/**
 * STEP 4: DEALER PORTAL DOMAIN TYPES
 */

export type DealerUserStatus = 'INVITED' | 'ACTIVE' | 'DISABLED';

export interface DealerUser {
  id: string;
  dealerId: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  status: DealerUserStatus;
  invitationTokenHash?: string | null;
  invitationExpiresAt?: string | null;
  resetTokenHash?: string | null;
  resetExpiresAt?: string | null;
  failedLoginCount: number;
  lockedUntil?: string | null;
  lastLoginAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  dealerBusinessName?: string;
  dealerCode?: string;
}

export type SafeDealerUser = Omit<DealerUser, 'passwordHash' | 'invitationTokenHash' | 'resetTokenHash'>;

export interface DealerSession {
  id: string;
  dealerUserId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface DealerUserWithDealer {
  dealerUser: SafeDealerUser;
  dealer: DealerWithRelations;
}

export type DealerProductAvailability = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';

export interface DealerProduct {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  shortDescription?: string | null;
  description?: string | null;
  availability: DealerProductAvailability;
  specifications?: Array<{ id: string; label: string; value: string; sortOrder: number }>;
  media?: Array<{ id: string; type: 'IMAGE' | 'DOCUMENT'; storagePath: string; fileName: string; altText?: string | null }>;
  lastUpdated: string;
}

export interface DealerRequestMessage {
  id: string;
  requestId: string;
  senderType: 'DEALER' | 'INTERNAL';
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface DealerActivityItem {
  id: string;
  type: 'LOGIN' | 'REQUEST_CREATED' | 'REQUEST_UPDATED' | 'ACCOUNT_UPDATED' | 'PASSWORD_CHANGED';
  description: string;
  timestamp: string;
}

/**
 * CANONICAL /api/v1 RESPONSE AND ENVELOPE TYPES
 */

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiCollectionResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR';

export interface ApiErrorDetail {
  code: ApiErrorCode | string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export type ApiResponseEnvelope<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * CONTACT ENQUIRY DOMAIN
 */

export type ContactEnquiryType =
  | 'PRODUCT_ENQUIRY'
  | 'DEALER_ENQUIRY'
  | 'DISTRIBUTION_ENQUIRY'
  | 'PRODUCT_SUPPORT'
  | 'GENERAL_ENQUIRY';

export type ContactEnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED';

export interface ContactEnquiry {
  id: string;
  organizationId?: string | null;
  enquiryCode: string; // e.g. TRX-ENQ-000001
  type: ContactEnquiryType;
  fullName: string;
  phone: string;
  email?: string | null;
  companyName?: string | null;
  businessAddress?: string | null;
  businessType?: string | null;
  city: string;
  state: string;
  pincode: string;
  territory?: string | null;
  productId?: string | null;
  productName?: string | null;
  purchaseDealerDetails?: string | null;
  message: string;
  status: ContactEnquiryStatus;
  assignedTo?: string | null;
  assignedUserName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryNote {
  id: string;
  enquiryId: string;
  body: string;
  createdBy: string;
  authorName?: string | null;
  createdAt: string;
}

/**
 * WARRANTY DOMAIN
 */

export interface WarrantyPolicy {
  id: string;
  productId: string;
  durationMonths: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type WarrantyStatus = 'ACTIVE' | 'VOID';
export type DerivedWarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'VOID';

export interface Warranty {
  id: string;
  serialRecordId: string;
  serialNumber: string;
  productId: string;
  productName?: string | null;
  productCode?: string | null;
  dealerId?: string | null;
  dealerName?: string | null;
  installationDate: string; // YYYY-MM-DD
  warrantyStartDate: string; // YYYY-MM-DD
  warrantyEndDate: string; // YYYY-MM-DD
  status: WarrantyStatus;
  derivedStatus?: DerivedWarrantyStatus;
  activatedBy: string;
  activatedByType: 'INTERNAL' | 'DEALER';
  activatedByName?: string | null;
  activatedAt: string;
  voidedAt?: string | null;
  voidedBy?: string | null;
  voidReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PublicWarrantyCheckStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'NOT_ACTIVATED'
  | 'NOT_FOUND';

export interface PublicWarrantyCheckResult {
  status: PublicWarrantyCheckStatus;
  productName?: string | null;
  serialNumber: string;
  installationDate?: string | null;
  activatedAt?: string | null;
  warrantyEndDate?: string | null;
  dealerName?: string | null;
  message?: string | null;
}

/**
 * ORGANIZATION & MULTI-TENANCY DOMAIN
 */

export type OrganizationSlug = 'trionyx' | 'lakshmi' | string;

export interface Organization {
  id: string;
  slug: OrganizationSlug;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveOrganization {
  id: string;
  slug: OrganizationSlug;
  name: string;
  role: Role;
}


