export * from './response';
export * from './services/internalAuth';
export * from './services/internalOverview';
export * from './services/products';
export * from './services/inventory';
export * from './services/dealers';
export * from './services/distributors';
export * from './services/dealerNetwork';
export * from './services/dealerRequests';
export * from './services/dealerAuth';
export * from './services/dealerPortal';
export * from './services/contactEnquiries';
export * from './services/warranties';
export * from './client';

// Retain legacy public stubs for consumer web
import type { ContactRequest, DealerApplication } from '@trionyx/types';

export interface LegacyApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type SubmitContactResult = LegacyApiResponse<{ referenceId: string }>;
export type SubmitDealerApplicationResult = LegacyApiResponse<{ applicationId: string }>;

export { enquiryIntelligenceService, createEnquiryIntelligenceService, EnquiryReadError } from './services/enquiryIntelligence';

export * from './services/warrantyExecutive';

export { preparedActionsService, createPreparedActionsService, PreparedActionError, type PreparedActionContext } from './services/preparedActions';
export { prepareDealerDistributorInputSchema, prepareEnquiryAssignmentInputSchema, prepareEnquiryStatusInputSchema, prepareInventoryTransferInputSchema } from '@trionyx/validation';
