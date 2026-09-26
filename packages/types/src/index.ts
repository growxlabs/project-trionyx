/**
 * TRIONYX CANONICAL DOMAIN TYPES
 * Corresponds to /docs/14-DATA-MODEL.md
 */

export type Role = 'DEALER' | 'DISTRIBUTOR' | 'MANAGING_DIRECTOR' | 'ADMIN' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
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

export type ProductCategory = 'COATINGS' | 'FILMS' | 'CARE' | 'ACCESSORIES';

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: ProductCategory;
  specifications: Record<string, string | number>;
  isFeatured: boolean;
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
