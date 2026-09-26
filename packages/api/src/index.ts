import type { ContactRequest, DealerApplication } from '@trionyx/types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type SubmitContactResult = ApiResponse<{ referenceId: string }>;
export type SubmitDealerApplicationResult = ApiResponse<{ applicationId: string }>;
