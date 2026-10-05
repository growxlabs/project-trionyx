import { dealerNetworkRepository } from '@trionyx/database';
import { dealersService } from './dealers';
import { distributorsService } from './distributors';

export type DealerTarget = { dealerId?: string; dealerCode?: string; dealerName?: string };
export type DistributorTarget = { distributorId?: string; distributorCode?: string; distributorName?: string };
export class DealerNetworkError extends Error {
  constructor(public readonly code: string, message: string) { super(message); }
}

/** Read-only facade: no mutation methods are reachable through this dependency. */
export function createDealerNetworkService(deps = {
  listDealers: dealersService.listDealers,
  listDistributors: distributorsService.listDistributors,
  summary: dealerNetworkRepository.summary,
  history: dealerNetworkRepository.history,
  exceptions: dealerNetworkRepository.exceptions,
}) {
  return {
    listDealers: deps.listDealers,
    listDistributors: deps.listDistributors,
    async resolveDealer(target: DealerTarget) {
      const result = await deps.listDealers({ id: target.dealerId, code: target.dealerCode, exactName: target.dealerName, pageSize: 2 });
      if (result.meta.total === 0) throw new DealerNetworkError('TRIX_DEALER_NOT_FOUND', 'No matching dealer was found. Supply the exact business name, dealer ID or code.');
      if (result.meta.total > 1) throw new DealerNetworkError('TRIX_DEALER_AMBIGUOUS', 'Multiple dealers have that name. Supply a dealer ID or code to choose.');
      return result.items[0];
    },
    async resolveDistributor(target: DistributorTarget) {
      const result = await deps.listDistributors({ id: target.distributorId, code: target.distributorCode, exactName: target.distributorName, pageSize: 2 });
      if (result.meta.total === 0) throw new DealerNetworkError('TRIX_DISTRIBUTOR_NOT_FOUND', 'No matching distributor was found. Supply the exact business name, distributor ID or code.');
      if (result.meta.total > 1) throw new DealerNetworkError('TRIX_DISTRIBUTOR_AMBIGUOUS', 'Multiple distributors have that name. Supply a distributor ID or code to choose.');
      return result.items[0];
    },
    summary: deps.summary,
    async history(query: Parameters<typeof deps.history>[0]) {
      try { return await deps.history(query); }
      catch (error) {
        // Only a genuinely missing ledger becomes capability-unavailable; other errors fail closed.
        const code = (error as { code?: string }).code;
        const message = error instanceof Error ? error.message : '';
        if (code === '42P01' || /no such table: dealer_distributor_history/.test(message)) {
          throw new DealerNetworkError('TRIX_ASSIGNMENT_HISTORY_UNAVAILABLE', 'Dealer assignment history is unavailable in the current database.');
        }
        throw error;
      }
    },
    exceptions: deps.exceptions,
  };
}
export const dealerNetworkService = createDealerNetworkService();
