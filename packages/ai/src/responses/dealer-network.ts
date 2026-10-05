import { z } from 'zod';

const text = z.string().trim().min(1).max(120).regex(/^[^\u0000-\u001f\u007f]*$/);
export const networkStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
const pagination = { limit: z.number().int().min(1).max(50).default(20), page: z.number().int().min(1).max(100000).default(1) };
export const searchDealersInputSchema = z.object({
  query: text.optional(), dealerId: text.optional(), dealerCode: text.optional(),
  distributorId: text.optional(), distributorName: text.optional(), status: networkStatusSchema.optional(),
  city: text.optional(), state: text.optional(), hasDistributor: z.boolean().optional(), ...pagination,
}).strict().refine(value => !(value.hasDistributor === false && (value.distributorId || value.distributorName)), 'An unassigned filter cannot include a distributor.');
export const searchDistributorsInputSchema = z.object({
  query: text.optional(), distributorId: text.optional(), distributorCode: text.optional(),
  status: networkStatusSchema.optional(), city: text.optional(), state: text.optional(), hasDealers: z.boolean().optional(), ...pagination,
}).strict();
export const networkSummaryInputSchema = z.object({
  dealerStatus: networkStatusSchema.optional(), distributorId: text.optional(), state: text.optional(),
  groupBy: z.enum(['distributor', 'dealer_status', 'state', 'assignment_status']), ...pagination,
}).strict();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/)
  .refine(value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value.slice(0, 10), 'Supply a real date or UTC timestamp.');
export const assignmentHistoryInputSchema = z.object({
  dealerId: text.optional(), distributorId: text.optional(), from: date.optional(), to: date.optional(), ...pagination,
}).strict().refine(value => !value.from || !value.to || Date.parse(value.from) <= Date.parse(value.to), 'Invalid date range.');
export const networkExceptionTypeSchema = z.enum(['ACTIVE_DEALER_UNASSIGNED', 'MISSING_DISTRIBUTOR', 'ACTIVE_DEALER_NON_ACTIVE_DISTRIBUTOR']);
export const networkExceptionsInputSchema = z.object({ type: networkExceptionTypeSchema.optional(), ...pagination }).strict();

const pageInfo = z.object({ total: z.number().int().nonnegative(), page: z.number().int().positive(), limit: z.number().int().min(1).max(50), hasMore: z.boolean() }).strict();
const assignedDistributor = z.object({ id: text, businessName: text }).strict().nullable();
export const dealerItemSchema = z.object({ id: text, dealerCode: text, businessName: text, status: networkStatusSchema, city: z.string(), state: z.string(), assignedDistributor }).strict();
export const distributorItemSchema = z.object({ id: text, distributorCode: text, businessName: text, status: networkStatusSchema, city: z.string(), state: z.string(), dealerCount: z.number().int().nonnegative() }).strict();
export const dealerListResponseSchema = z.object({ type: z.literal('dealer_list'), items: z.array(dealerItemSchema).max(50), pageInfo }).strict();
export const distributorListResponseSchema = z.object({ type: z.literal('distributor_list'), items: z.array(distributorItemSchema).max(50), pageInfo }).strict();
export const dealerNetworkSummaryResponseSchema = z.object({
  type: z.literal('dealer_network_summary'), totalDealers: z.number().int().nonnegative(), totalDistributors: z.number().int().nonnegative(),
  distributorCountScope: z.literal('all_distributors_or_selected_id'), groupBy: networkSummaryInputSchema.shape.groupBy,
  groups: z.array(z.object({ key: z.string(), label: z.string(), count: z.number().int().nonnegative() }).strict()).max(50), pageInfo,
  filtersApplied: z.object({ dealerStatus: networkStatusSchema.optional(), distributorId: text.optional(), state: text.optional() }).strict(),
}).strict();
export const dealerAssignmentHistoryResponseSchema = z.object({
  type: z.literal('dealer_assignment_history'), items: z.array(z.object({
    id: text, dealerId: text, dealerName: z.string(), previousDistributorId: text.nullable(), previousDistributorName: z.string().nullable(),
    newDistributorId: text.nullable(), newDistributorName: z.string().nullable(), changedAt: z.string(),
  }).strict()).max(50), pageInfo,
}).strict();
export const dealerNetworkExceptionResponseSchema = z.object({
  type: z.literal('dealer_network_exceptions'), totalExceptions: z.number().int().nonnegative(),
  items: z.array(z.object({ type: networkExceptionTypeSchema, severity: z.enum(['WARNING', 'CRITICAL']), label: z.string(), description: z.string(), recordType: z.literal('dealer'), recordId: text }).strict()).max(50), pageInfo,
}).strict();

export const dealerNetworkResponseSchemas = [dealerListResponseSchema, distributorListResponseSchema, dealerNetworkSummaryResponseSchema, dealerAssignmentHistoryResponseSchema, dealerNetworkExceptionResponseSchema] as const;
export const dealerNetworkResponseSchema = z.discriminatedUnion('type', dealerNetworkResponseSchemas);
export type DealerNetworkResponse = z.infer<typeof dealerNetworkResponseSchema>;
export type DealerNetworkResult = { success: true; response: DealerNetworkResponse } | { success: false; errorCode: string; message: string };
