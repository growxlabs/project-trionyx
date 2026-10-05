import type { DatabaseClient as Client } from '@trionyx/database';
import { getDbClient } from '@trionyx/database';
import {
  serialsRepository,
  serialMovementsRepository,
  locationsRepository,
  productsRepository,
} from '@trionyx/database';
import type {
  ReceiveSerialsInput,
  TransferSerialsInput,
  AdjustSerialStatusInput,
} from '@trionyx/validation';

export const inventoryService = {
  async getOverview() {
    const [summaries, locations] = await Promise.all([
      serialsRepository.listProductInventorySummaries(),
      locationsRepository.list(),
    ]);

    const totalAvailable = summaries.reduce((acc, s) => acc + s.availableCount, 0);
    const totalUnits = summaries.reduce((acc, s) => acc + s.totalCount, 0);

    return {
      totalAvailable,
      totalUnits,
      productSummaries: summaries,
      locations,
    };
  },

  async listSerials(query: {
    productId?: string;
    locationId?: string;
    status?: 'AVAILABLE' | 'TRANSFERRED' | 'INACTIVE';
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page || 1;
    const limit = query.pageSize || 25;

    const result = await serialsRepository.list({
      productId: query.productId,
      locationId: query.locationId,
      status: query.status,
      search: query.search,
      page,
      limit,
    });

    return {
      items: result.items,
      meta: {
        page,
        pageSize: limit,
        total: result.total,
      },
    };
  },

  async getSerialByNumber(serialNumber: string) {
    return serialsRepository.findBySerialNumber(serialNumber);
  },

  async receiveSerials(data: ReceiveSerialsInput, actorId: string) {
    return serialsRepository.receiveBatch({
      productId: data.productId,
      locationId: data.locationId,
      serialNumbers: data.serialNumbers,
      reference: data.reference,
      notes: data.notes,
      actorId,
    });
  },

  async transferSerials(data: TransferSerialsInput, actorId: string, client: Client = getDbClient()) {
    return serialsRepository.transferBatch({
      serialNumbers: data.serialNumbers,
      sourceLocationId: data.sourceLocationId,
      destinationLocationId: data.destinationLocationId,
      reference: data.reference,
      notes: data.notes,
      actorId,
    }, client);
  },

  async adjustSerial(data: AdjustSerialStatusInput, actorId: string) {
    return serialsRepository.adjustStatus({
      serialRecordId: data.serialRecordId,
      newStatus: data.newStatus,
      reason: data.reason,
      notes: data.notes,
      actorId,
    });
  },

  async listMovements(query: {
    productId?: string;
    serialRecordId?: string;
    type?: 'RECEIVED' | 'TRANSFERRED' | 'ADJUSTED';
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page || 1;
    const limit = query.pageSize || 25;
    const offset = (page - 1) * limit;

    const items = await serialMovementsRepository.listWithDetails({
      productId: query.productId,
      serialRecordId: query.serialRecordId,
      type: query.type,
      limit,
      offset,
    });

    return {
      items,
      meta: {
        page,
        pageSize: limit,
        total: items.length, // or count if available
      },
    };
  },

  async listLocations() {
    return locationsRepository.list();
  },

  async createLocation(data: { code: string; name: string }) {
    return locationsRepository.create(data);
  },

  async updateLocation(id: string, data: { name?: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    return locationsRepository.update(id, data);
  },

  async resolveProduct(query: { productId?: string; productName?: string }) {
    if (query.productId) {
      const p = await productsRepository.findById(query.productId);
      if (!p) return { found: false as const };
      return { found: true as const, product: p };
    }
    if (query.productName) {
      const matches = await productsRepository.findMatching(query.productName);
      if (matches.length === 0) return { found: false as const };
      if (matches.length === 1) return { found: true as const, product: matches[0] };
      // Check for exact case-insensitive match on name, slug, or code
      const clean = query.productName.trim().toLowerCase();
      const exact = matches.find(
        (m) =>
          m.name.toLowerCase() === clean ||
          m.slug.toLowerCase() === clean ||
          m.productCode.toLowerCase() === clean
      );
      if (exact) return { found: true as const, product: exact };
      return { ambiguous: true as const, matches };
    }
    return { found: false as const };
  },

  async resolveLocation(query: { locationId?: string; locationName?: string }) {
    if (query.locationId) {
      const loc = await locationsRepository.findById(query.locationId);
      if (!loc) return { found: false as const };
      return { found: true as const, location: loc };
    }
    if (query.locationName) {
      const matches = await locationsRepository.findMatching(query.locationName);
      if (matches.length === 0) return { found: false as const };
      if (matches.length === 1) return { found: true as const, location: matches[0] };
      // Check for exact case-insensitive match on name or code
      const clean = query.locationName.trim().toLowerCase();
      const exact = matches.find(
        (m) => m.name.toLowerCase() === clean || m.code.toLowerCase() === clean
      );
      if (exact) return { found: true as const, location: exact };
      return { ambiguous: true as const, matches };
    }
    return { found: false as const };
  },

  async getSummary(filter: {
    productId?: string;
    locationId?: string;
    status?: 'AVAILABLE' | 'TRANSFERRED' | 'INACTIVE';
    groupBy: 'product' | 'location' | 'status';
  }) {
    return serialsRepository.getInventorySummary(filter);
  },

  async getExceptions() {
    return serialsRepository.getInventoryExceptions();
  },

  async listRecentMovements(query: {
    productId?: string;
    locationId?: string;
    type?: 'RECEIVED' | 'TRANSFERRED' | 'ADJUSTED';
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    return serialMovementsRepository.listWithDetailsAndCount(query);
  },
};
