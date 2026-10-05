import { ensureDatabaseReady, warrantyReadsRepository, operationalChangesRepository, readInventoryAttention, serialsRepository, dealerNetworkRepository, enquiryReadsRepository } from '@trionyx/database';
import type { ChangeFilter } from '@trionyx/database';
export class WarrantyExecutiveReadError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export function createWarrantyExecutiveService(reads: {
  list: typeof warrantyReadsRepository.list; summary: typeof warrantyReadsRepository.summary;
  exceptions: typeof warrantyReadsRepository.exceptions; resolve: typeof warrantyReadsRepository.resolve;
  changes: typeof operationalChangesRepository.list;
  inventory: () => Promise<{ total: number; groups: Array<{ key: string; count: number }> }>;
  inventoryAttention: typeof readInventoryAttention;
  networkSummary: typeof dealerNetworkRepository.summary; networkAttention: typeof dealerNetworkRepository.exceptions;
  enquirySummary: typeof enquiryReadsRepository.summary; enquiryAttention: typeof enquiryReadsRepository.attention;
}) {
  const count = (groups: Array<{ key: string; count: number }>, key: string) => groups.find(group => group.key === key)?.count ?? 0;
  return {
    ...reads,
    async resolveTarget(target: { id?: string; name?: string }, kind: 'dealer' | 'product') {
      const matches = await reads.resolve(target, kind);
      if (matches.length > 1) throw new WarrantyExecutiveReadError('TRIX_WARRANTY_TARGET_AMBIGUOUS', `Multiple ${kind} records have that exact name. Supply its ID.`);
      if (!matches.length) throw new WarrantyExecutiveReadError('TRIX_WARRANTY_TARGET_NOT_FOUND', `No matching ${kind} was found. Supply its stored ID or exact name.`);
      return matches[0];
    },
    async overview(window: ChangeFilter, today: { from: string; to: string }, now: Date) {
      // Compact current-state snapshots; no claim of an atomic cross-module historical snapshot.
      const inventory = await reads.inventory();
      const inventoryAttention = await reads.inventoryAttention(5);
      const network = await reads.networkSummary({ groupBy: 'dealer_status', limit: 50 });
      const assignments = await reads.networkSummary({ groupBy: 'assignment_status', limit: 50 });
      const dealerAttention = await reads.networkAttention({ limit: 5 });
      const enquiries = await reads.enquirySummary({ groupBy: 'status', limit: 50 });
      const enquiryAssignments = await reads.enquirySummary({ groupBy: 'assignment_status', limit: 50 });
      const enquiryAttention = await reads.enquiryAttention({ limit: 5 });
      const warranties = await reads.summary({ groupBy: 'status', asOfDate: now.toISOString().slice(0, 10), limit: 50 });
      if (warranties.groups.some(group => !['ACTIVE', 'EXPIRED', 'VOID'].includes(group.key))) throw new Error('INVALID_STORED_WARRANTY_STATUS');
      const registeredToday = await reads.summary({ groupBy: 'status', registeredFrom: today.from, registeredTo: today.to, limit: 50 });
      const warrantyAttention = await reads.exceptions({ limit: 5 });
      const activity = await reads.changes({ ...window, page: 1, limit: 5 });
      return {
        inventory: { totalSerials: inventory.total, availableSerials: count(inventory.groups, 'AVAILABLE') },
        dealers: { totalDealers: network.totalDealers, totalDistributors: network.totalDistributors, activeDealers: count(network.groups, 'ACTIVE'), unassignedDealers: count(assignments.groups, 'unassigned') },
        enquiries: { total: enquiries.total, new: count(enquiries.groups, 'NEW'), inProgress: count(enquiries.groups, 'IN_PROGRESS'), closed: count(enquiries.groups, 'CLOSED'), unassigned: count(enquiryAssignments.groups, 'UNASSIGNED') },
        warranties: { total: warranties.total, active: count(warranties.groups, 'ACTIVE'), expired: count(warranties.groups, 'EXPIRED'), void: count(warranties.groups, 'VOID'), registeredToday: registeredToday.total },
        attention: {
          inventory: inventoryAttention,
          dealers: { total: dealerAttention.total, items: dealerAttention.items.map(item => ({ recordId: item.recordId, rule: item.type, severity: item.severity })) },
          enquiries: { total: enquiryAttention.total, items: enquiryAttention.items.map(item => ({ recordId: item.enquiryId, rule: item.rule, severity: item.rule === 'MISSING_OWNER' ? 'CRITICAL' as const : 'WARNING' as const })) },
          warranties: warrantyAttention,
        },
        activity: { ...activity, window: { from: window.from, to: window.to }, hasMore: activity.total > activity.items.length },
        generatedAt: now.toISOString(), snapshotSemantics: 'Current counts from separate reads; activity is limited to the explicit window.' as const,
      };
    },
  };
}
export const warrantyExecutiveService = createWarrantyExecutiveService({
  list: async query => warrantyReadsRepository.list(query, await ensureDatabaseReady()),
  summary: async query => warrantyReadsRepository.summary(query, await ensureDatabaseReady()),
  exceptions: async query => warrantyReadsRepository.exceptions(query, await ensureDatabaseReady()),
  resolve: async (query, kind) => warrantyReadsRepository.resolve(query, kind, await ensureDatabaseReady()),
  changes: async query => operationalChangesRepository.list(query, await ensureDatabaseReady()),
  inventory: async () => serialsRepository.getInventorySummary({ groupBy: 'status' }, await ensureDatabaseReady()),
  inventoryAttention: async limit => readInventoryAttention(limit, await ensureDatabaseReady()),
  networkSummary: async query => dealerNetworkRepository.summary(query, await ensureDatabaseReady()),
  networkAttention: async query => dealerNetworkRepository.exceptions(query, await ensureDatabaseReady()),
  enquirySummary: async query => enquiryReadsRepository.summary(query, await ensureDatabaseReady()),
  enquiryAttention: async query => enquiryReadsRepository.attention(query, await ensureDatabaseReady()),
});
