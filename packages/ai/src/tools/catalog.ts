import { z } from 'zod';
import { DealerNetworkError, dealerNetworkService, prepareDealerDistributorInputSchema, prepareEnquiryAssignmentInputSchema, prepareEnquiryStatusInputSchema, prepareInventoryTransferInputSchema, type PreparedActionContext } from '@trionyx/api';
import type { LanguageModel } from 'ai';
import type { SafeUser } from '@trionyx/types';
import { searchInventory } from './search-inventory';
import { getInventorySummary } from './inventory-summary';
import { getRecentSerialMovements } from './serial-movements';
import { getInventoryExceptions } from './inventory-exceptions';
import type { ProductResolver, LocationResolver } from './resolvers';
import { searchDealers, searchDistributors, getDealerNetworkSummary, getDealerAssignmentHistory, getDealerNetworkExceptions, type DealerNetworkService } from './dealer-network';
import { searchEnquiries, getEnquiryDetails, getEnquirySummary, getEnquiryAttention, getRecentEnquiryChanges, type EnquiryIntelligenceService } from './enquiries';
import { searchWarranties, getWarrantySummary, getWarrantyExceptions, getExecutiveOverview, getRecentOperationalChanges, operationalWindow, type WarrantyExecutiveService } from './warranty-executive';
import { prepareDealerDistributorAssignment, prepareEnquiryAssignment, prepareEnquiryStatusChange, prepareInventoryTransfer, type PreparationCapability } from './prepared-actions';
import { searchInventoryInputSchema, inventorySummaryInputSchema, type TrixResponse } from '../responses/schema';
import { searchDealersInputSchema, searchDistributorsInputSchema, networkSummaryInputSchema } from '../responses/dealer-network';
import { searchEnquiriesInputSchema, enquirySummaryInputSchema } from '../responses/enquiries';
import { warrantySearchInputSchema, warrantySummaryInputSchema, executiveInputSchema } from '../responses/warranty-executive';

export type TrixDependencies = {
  model?: LanguageModel;
  listSerials?: Parameters<typeof searchInventory>[2];
  readSummary?: Parameters<typeof getInventorySummary>[2];
  listMovements?: Parameters<typeof getRecentSerialMovements>[2];
  readExceptions?: Parameters<typeof getInventoryExceptions>[2];
  productResolver?: ProductResolver;
  locationResolver?: LocationResolver;
  dealerNetwork?: DealerNetworkService;
  enquiries?: EnquiryIntelligenceService;
  warrantyExecutive?: WarrantyExecutiveService;
  preparations?: PreparationCapability;
};

export type ToolResult = { success: true; response: TrixResponse } | { success: false; errorCode: string; message: string };
/** `context` carries the session and conversation for preparations. */
type Run<S extends z.ZodType> = (input: z.output<S>, user: SafeUser, deps: TrixDependencies, context: PreparedActionContext) => Promise<ToolResult>;
export type ToolDefinition = { name: string; description: string; failureCode: string; schema: z.ZodType; run: Run<z.ZodType> };
const define = <S extends z.ZodType>(name: string, description: string, failureCode: string, schema: S, run: Run<S>): ToolDefinition =>
  ({ name, description, failureCode, schema, run: run as Run<z.ZodType> });
const invalid = (message: string): ToolResult => ({ success: false, errorCode: 'TRIX_INVALID_REQUEST', message });
const has = (values: object) => Object.values(values).some(value => value !== undefined);

const pagination = { page: z.number().int().min(1).max(100000).default(1), limit: z.number().int().min(1).max(50).default(20) };
const windowDate = z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/);
const period = z.enum(['today', 'this_week', 'this_month', 'last_7_days']);

export const inventoryToolSchema = searchInventoryInputSchema.extend({ groupBy: inventorySummaryInputSchema.shape.groupBy.optional() });
export const dealersToolSchema = searchDealersInputSchema.safeExtend({ groupBy: networkSummaryInputSchema.shape.groupBy.optional() });
export const enquiriesToolSchema = searchEnquiriesInputSchema.safeExtend({ groupBy: enquirySummaryInputSchema.shape.groupBy.optional() });
export const warrantiesToolSchema = warrantySearchInputSchema.safeExtend({ groupBy: warrantySummaryInputSchema.shape.groupBy.optional() });
export const changesToolSchema = z.object({
  module: z.enum(['inventory', 'dealers', 'distributors', 'enquiries', 'warranties']).optional(),
  recordId: z.string().trim().min(1).max(120).optional(),
  period: period.optional(), from: windowDate.optional(), to: windowDate.optional(), ...pagination,
}).strict();
export const attentionToolSchema = z.object({ module: z.enum(['inventory', 'dealers', 'enquiries', 'warranties']), rule: z.string().trim().max(60).optional(), ...pagination }).strict();
export const prepareChangeToolSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('dealer_distributor'), params: prepareDealerDistributorInputSchema }).strict(),
  z.object({ kind: z.literal('enquiry_owner'), params: prepareEnquiryAssignmentInputSchema }).strict(),
  z.object({ kind: z.literal('enquiry_status'), params: prepareEnquiryStatusInputSchema }).strict(),
  z.object({ kind: z.literal('inventory_transfer'), params: prepareInventoryTransferInputSchema }).strict(),
]);

export const TRIX_TOOLS: ToolDefinition[] = [
  define('searchInventory', 'Find serials by serial number or text (query), product, location or status. With groupBy (product|location|status), returns counts instead of rows.',
    'TRIX_INVENTORY_QUERY_FAILED', inventoryToolSchema, async ({ groupBy, ...input }, user, deps) => {
      if (!groupBy) return searchInventory(input, user, deps.listSerials, deps.productResolver, deps.locationResolver);
      const { query, page: _page, limit: _limit, ...filters } = input;
      if (query) return invalid('Counts cannot be filtered by free text; use product, location or status.');
      return getInventorySummary({ ...filters, groupBy }, user, deps.readSummary, deps.productResolver, deps.locationResolver);
    }),
  define('searchDealers', 'Find dealers by ID, code, exact name or text (query), distributor (ID or exact name), status, city, state, or hasDistributor=false for unassigned. With groupBy (distributor|dealer_status|state|assignment_status), returns counts; only status, distributor and state filters apply.',
    'TRIX_DEALER_QUERY_FAILED', dealersToolSchema, async ({ groupBy, ...input }, user, deps) => {
      if (!groupBy) return searchDealers(input, user, deps.dealerNetwork);
      const { status, distributorId, distributorName, state, page, limit, ...other } = input;
      if (has(other)) return invalid('Dealer counts can be filtered only by status, distributor and state.');
      try {
        const resolvedId = distributorName ? (await (deps.dealerNetwork ?? dealerNetworkService).resolveDistributor({ distributorName })).id : distributorId;
        return getDealerNetworkSummary({ groupBy, dealerStatus: status, distributorId: resolvedId, state, page, limit }, user, deps.dealerNetwork);
      } catch (error) {
        if (error instanceof DealerNetworkError) return { success: false, errorCode: error.code, message: error.message };
        throw error;
      }
    }),
  define('searchDistributors', 'Find distributors by ID, code, exact name or text (query), status, city, state or hasDealers. Each result includes its dealer count; list its dealers with searchDealers.',
    'TRIX_DISTRIBUTOR_QUERY_FAILED', searchDistributorsInputSchema, (input, user, deps) => searchDistributors(input, user, deps.dealerNetwork)),
  define('searchEnquiries', 'Find contact enquiries by text, type, status, owner, location, created dates (createdPeriod=today) or age. An enquiryId or enquiryCode returns that one enquiry with its contact details and message. With groupBy (status|type|assignment_status|state), returns counts.',
    'TRIX_ENQUIRY_QUERY_FAILED', enquiriesToolSchema, async ({ groupBy, ...input }, user, deps) => {
      const { query, enquiryId, enquiryCode, ...filters } = input;
      if (groupBy) return query || enquiryId || enquiryCode ? invalid('Enquiry counts cannot be filtered by text or a single enquiry.') : getEnquirySummary({ ...filters, groupBy }, user, deps.enquiries);
      if (enquiryId || enquiryCode) return getEnquiryDetails({ enquiryId, enquiryCode }, user, deps.enquiries);
      return searchEnquiries(input, user, deps.enquiries);
    }),
  define('searchWarranties', 'Find warranties by serial number, warranty ID, dealer, product, status (ACTIVE|EXPIRED|VOID) or registration dates (registeredPeriod). With groupBy (status|dealer|product|registration_period), returns counts.',
    'TRIX_OPERATIONAL_QUERY_UNAVAILABLE', warrantiesToolSchema, ({ groupBy, ...input }, user, deps) =>
      groupBy ? getWarrantySummary({ ...input, groupBy }, user, deps.warrantyExecutive) : searchWarranties(input, user, deps.warrantyExecutive)),
  define('changes', 'Real recorded events in a time window (period or from/to; defaults to today for the cross-module feed). module=inventory gives serial movements with locations; module=enquiries gives status/owner changes (recordId = enquiry ID); module=dealers or distributors with a recordId gives distributor assignment history. Without a module, all modules.',
    'TRIX_OPERATIONAL_QUERY_UNAVAILABLE', changesToolSchema, ({ module, recordId, period, from, to, page, limit }, user, deps) => {
      const window = period || from || to ? operationalWindow({ period, from, to }, new Date()) : undefined;
      if (module === 'inventory') return getRecentSerialMovements({ fromDate: window?.from, toDate: window?.to, page, limit }, user, deps.listMovements, deps.productResolver, deps.locationResolver);
      if (module === 'enquiries') return getRecentEnquiryChanges({ enquiryId: recordId, from: window?.from, to: window?.to, page, limit }, user, deps.enquiries);
      if ((module === 'dealers' || module === 'distributors') && recordId) {
        return getDealerAssignmentHistory({ [module === 'dealers' ? 'dealerId' : 'distributorId']: recordId, from: window?.from, to: window?.to, page, limit }, user, deps.dealerNetwork);
      }
      return getRecentOperationalChanges({ module, period, from, to, page, limit }, user, deps.warrantyExecutive);
    }),
  define('attention', 'Records that break a stored rule and need attention, for one module. Optional rule: dealers ACTIVE_DEALER_UNASSIGNED|MISSING_DISTRIBUTOR|ACTIVE_DEALER_NON_ACTIVE_DISTRIBUTOR; enquiries NEW_UNASSIGNED|MISSING_OWNER; warranties MISSING_SERIAL|MISSING_PRODUCT|MISSING_DEALER|INACTIVE_DEALER|DUPLICATE_ACTIVE|INVALID_DATE_ORDER|INVALID_VOID_STATE.',
    'TRIX_QUERY_FAILED', attentionToolSchema, ({ module, rule, page, limit }, user, deps) => {
      if (module === 'inventory') return getInventoryExceptions({}, user, deps.readExceptions);
      if (module === 'dealers') return getDealerNetworkExceptions({ type: rule as never, page, limit }, user, deps.dealerNetwork);
      if (module === 'enquiries') return getEnquiryAttention({ rule: rule as never, page, limit }, user, deps.enquiries);
      return getWarrantyExceptions({ rule: rule as never, page, limit }, user, deps.warrantyExecutive);
    }),
  define('overview', 'Current counts and top attention items across inventory, dealers, enquiries and warranties, plus recent activity for the window (period or from/to; default today).',
    'TRIX_OPERATIONAL_QUERY_UNAVAILABLE', executiveInputSchema, (input, user, deps) => getExecutiveOverview(input, user, deps.warrantyExecutive)),
  define('prepareChange', 'Prepare a change for the Managing Director to confirm in the application. Stores a pending preview only; never executes. kind: dealer_distributor, enquiry_owner, enquiry_status, or inventory_transfer (at most 20 explicit serials).',
    'TRIX_ACTION_PREPARATION_FAILED', prepareChangeToolSchema, ({ kind, params }, user, deps, context) => {
      const ctx = { ...context, user };
      if (kind === 'dealer_distributor') return prepareDealerDistributorAssignment(params, ctx, deps.preparations);
      if (kind === 'enquiry_owner') return prepareEnquiryAssignment(params, ctx, deps.preparations);
      if (kind === 'enquiry_status') return prepareEnquiryStatusChange(params, ctx, deps.preparations);
      return prepareInventoryTransfer(params, ctx, deps.preparations);
    }),
];
