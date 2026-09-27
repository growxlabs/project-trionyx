import {
  serialsRepository,
  serialMovementsRepository,
  locationsRepository,
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

  async transferSerials(data: TransferSerialsInput, actorId: string) {
    return serialsRepository.transferBatch({
      serialNumbers: data.serialNumbers,
      sourceLocationId: data.sourceLocationId,
      destinationLocationId: data.destinationLocationId,
      reference: data.reference,
      notes: data.notes,
      actorId,
    });
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
};
