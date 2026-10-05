import { dealerNetworkService, DealerNetworkError } from '@trionyx/api';
import type { SafeUser, DealerWithRelations, DistributorWithRelations } from '@trionyx/types';
import { z } from 'zod';
import { assertManagingDirector } from './lookup-serial';
import {
  searchDealersInputSchema, dealerDetailsInputSchema, searchDistributorsInputSchema, distributorDetailsInputSchema,
  networkSummaryInputSchema, assignmentHistoryInputSchema, networkExceptionsInputSchema,
  dealerNetworkResponseSchema, type DealerNetworkResult, type DealerNetworkResponse,
} from '../responses/dealer-network';

type User = Pick<SafeUser, 'id' | 'role' | 'status'> | null;
export type DealerNetworkService = typeof dealerNetworkService;
const pageInfo = (result: { total: number; page: number; limit: number }) => ({ ...result, hasMore: result.page * result.limit < result.total });
const dealerItem = (record: DealerWithRelations) => {
  if (record.distributorId && !record.distributor) {
    throw new DealerNetworkError('TRIX_RELATIONSHIP_UNAVAILABLE', 'The dealer distributor reference cannot be resolved.');
  }
  return {
    id: record.id, dealerCode: record.dealerCode, businessName: record.businessName, status: record.status,
    city: record.city, state: record.state,
    assignedDistributor: record.distributor ? { id: record.distributor.id, businessName: record.distributor.businessName } : null,
  };
};
const distributorItem = (record: DistributorWithRelations) => ({
  id: record.id, distributorCode: record.distributorCode, businessName: record.businessName, status: record.status,
  city: record.city, state: record.state, dealerCount: z.number().int().nonnegative().parse(record.dealerCount),
});
const address = (record: DealerWithRelations | DistributorWithRelations) => ({
  addressLine1: record.addressLine1 ?? null, addressLine2: record.addressLine2 ?? null, district: record.district ?? null,
  postalCode: record.postalCode ?? null, country: record.country, createdAt: record.createdAt, updatedAt: record.updatedAt,
});

async function validated<S extends z.ZodType>(schema: S, input: z.input<S>, user: User, errorCode: string,
  read: (input: z.output<S>) => Promise<DealerNetworkResponse>): Promise<DealerNetworkResult> {
  assertManagingDirector(user);
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, errorCode: 'TRIX_INVALID_REQUEST', message: 'The dealer network filters or identifiers are invalid.' };
  try { return { success: true, response: dealerNetworkResponseSchema.parse(await read(parsed.data)) }; }
  catch (error) {
    if (error instanceof DealerNetworkError) return { success: false, errorCode: error.code, message: error.message };
    return { success: false, errorCode, message: 'TRIX could not read the requested dealer network information. Try again.' };
  }
}

export async function searchDealers(input: z.input<typeof searchDealersInputSchema>, user: User, service = dealerNetworkService) {
  return validated(searchDealersInputSchema, input, user, 'TRIX_DEALER_QUERY_FAILED', async query => {
    let distributorId = query.distributorId;
    if (query.distributorName || distributorId) {
      distributorId = (await service.resolveDistributor({ distributorId, distributorName: query.distributorName })).id;
    }
    if (query.query && !query.dealerId && !query.dealerCode) {
      const exact = await service.listDealers({ exactName: query.query, pageSize: 2 });
      if (exact.meta.total > 1) throw new DealerNetworkError('TRIX_DEALER_AMBIGUOUS', 'Multiple dealers have that name. Supply a dealer ID or code to choose.');
      // Prefer an exact canonical name over broad search; keep requested pagination/filters.
      if (exact.meta.total === 1) query = { ...query, dealerId: exact.items[0].id, query: undefined };
    }
    const result = await service.listDealers({
      id: query.dealerId, code: query.dealerCode, search: query.query, distributorId,
      status: query.status, city: query.city, state: query.state, hasDistributor: query.hasDistributor,
      page: query.page, pageSize: query.limit,
    });
    return { type: 'dealer_list', items: result.items.map(dealerItem), pageInfo: pageInfo({ total: result.meta.total, page: result.meta.page, limit: result.meta.pageSize }) };
  });
}
export async function getDealerDetails(input: z.input<typeof dealerDetailsInputSchema>, user: User, service = dealerNetworkService) {
  return validated(dealerDetailsInputSchema, input, user, 'TRIX_DEALER_QUERY_FAILED', async query => {
    const record = await service.resolveDealer(query);
    return { type: 'dealer_detail', dealer: { ...dealerItem(record), ...address(record) } };
  });
}
export async function searchDistributors(input: z.input<typeof searchDistributorsInputSchema>, user: User, service = dealerNetworkService) {
  return validated(searchDistributorsInputSchema, input, user, 'TRIX_DISTRIBUTOR_QUERY_FAILED', async query => {
    if (query.query && !query.distributorId && !query.distributorCode) {
      const exact = await service.listDistributors({ exactName: query.query, pageSize: 2 });
      if (exact.meta.total > 1) throw new DealerNetworkError('TRIX_DISTRIBUTOR_AMBIGUOUS', 'Multiple distributors have that name. Supply a distributor ID or code to choose.');
      if (exact.meta.total === 1) query = { ...query, distributorId: exact.items[0].id, query: undefined };
    }
    const result = await service.listDistributors({ id: query.distributorId, code: query.distributorCode, search: query.query,
      status: query.status, city: query.city, state: query.state, hasDealers: query.hasDealers, page: query.page, pageSize: query.limit });
    return { type: 'distributor_list', items: result.items.map(distributorItem), pageInfo: pageInfo({ total: result.meta.total, page: result.meta.page, limit: result.meta.pageSize }) };
  });
}
export async function getDistributorDetails(input: z.input<typeof distributorDetailsInputSchema>, user: User, service = dealerNetworkService) {
  return validated(distributorDetailsInputSchema, input, user, 'TRIX_DISTRIBUTOR_QUERY_FAILED', async query => {
    const record = await service.resolveDistributor(query);
    const dealers = await service.listDealers({ distributorId: record.id, pageSize: 5, page: 1 });
    return { type: 'distributor_detail', distributor: { ...distributorItem(record), ...address(record), assignedDealersPreview: dealers.items.map(dealerItem) } };
  });
}
export async function getDealerNetworkSummary(input: z.input<typeof networkSummaryInputSchema>, user: User, service = dealerNetworkService) {
  return validated(networkSummaryInputSchema, input, user, 'TRIX_DEALER_QUERY_FAILED', async query => {
    if (query.distributorId) await service.resolveDistributor({ distributorId: query.distributorId });
    const result = await service.summary(query);
    return { type: 'dealer_network_summary', totalDealers: result.totalDealers, totalDistributors: result.totalDistributors,
      distributorCountScope: 'all_distributors_or_selected_id', groupBy: query.groupBy, groups: result.groups,
      pageInfo: pageInfo({ total: result.total, page: result.page, limit: result.limit }),
      filtersApplied: { dealerStatus: query.dealerStatus, distributorId: query.distributorId, state: query.state } };
  });
}
export async function getDealerAssignmentHistory(input: z.input<typeof assignmentHistoryInputSchema>, user: User, service = dealerNetworkService) {
  return validated(assignmentHistoryInputSchema, input, user, 'TRIX_DEALER_QUERY_FAILED', async query => {
    if (query.dealerId) await service.resolveDealer({ dealerId: query.dealerId });
    if (query.distributorId) await service.resolveDistributor({ distributorId: query.distributorId });
    const result = await service.history({ ...query,
      from: query.from ? (query.from.length === 10 ? `${query.from}T00:00:00.000Z` : new Date(query.from).toISOString()) : undefined,
      to: query.to ? (query.to.length === 10 ? `${query.to}T23:59:59.999Z` : new Date(query.to).toISOString()) : undefined,
    });
    return { type: 'dealer_assignment_history', items: result.items, pageInfo: pageInfo({ total: result.total, page: result.page, limit: result.limit }) };
  });
}
export async function getDealerNetworkExceptions(input: z.input<typeof networkExceptionsInputSchema>, user: User, service = dealerNetworkService) {
  return validated(networkExceptionsInputSchema, input, user, 'TRIX_DEALER_QUERY_FAILED', async query => {
    const result = await service.exceptions(query);
    return { type: 'dealer_network_exceptions', items: result.items, totalExceptions: result.total, pageInfo: pageInfo({ total: result.total, page: result.page, limit: result.limit }) };
  });
}
