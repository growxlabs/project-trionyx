import {
  distributorsRepository,
  dealersRepository,
  internalNotesRepository,
  auditLogsRepository,
} from '@trionyx/database';
import type {
  CreateDistributorInput,
  UpdateDistributorInput,
  DistributorStatusInput,
} from '@trionyx/validation';
import type { DistributorStatus } from '@trionyx/types';

export const distributorsService = {
  async listDistributors(
    query: {
      search?: string;
      status?: DistributorStatus;
      state?: string;
      page?: number;
      pageSize?: number;
    },
    distributorScope?: string | null
  ) {
    const page = query.page || 1;
    const limit = query.pageSize || 25;

    // If user is a distributor, restrict to their own ID
    if (distributorScope) {
      const dist = await distributorsRepository.findById(distributorScope);
      return {
        items: dist ? [dist] : [],
        meta: {
          page: 1,
          pageSize: limit,
          total: dist ? 1 : 0,
        },
      };
    }

    const result = await distributorsRepository.list({
      search: query.search,
      status: query.status,
      state: query.state,
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

  async getDistributorById(id: string, distributorScope?: string | null) {
    if (distributorScope && id !== distributorScope) {
      const err = new Error('Access denied to other distributor records');
      (err as any).statusCode = 403;
      (err as any).code = 'FORBIDDEN';
      throw err;
    }

    return distributorsRepository.findById(id);
  },

  async createDistributor(data: CreateDistributorInput, actorId: string) {
    const created = await distributorsRepository.create({
      ...data,
      createdBy: actorId,
    });

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'DISTRIBUTOR_CREATED',
      metadata: { distributorId: created.id, distributorCode: created.distributorCode, businessName: created.businessName },
    });

    return created;
  },

  async updateDistributor(id: string, data: UpdateDistributorInput, actorId: string) {
    const existing = await distributorsRepository.findById(id);
    if (!existing) {
      const err = new Error('Distributor not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    const updated = await distributorsRepository.update(id, {
      ...data,
      updatedBy: actorId,
    });

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'DISTRIBUTOR_UPDATED',
      metadata: { distributorId: id, updatedFields: Object.keys(data) },
    });

    return updated;
  },

  async updateDistributorStatus(id: string, input: DistributorStatusInput, actorId: string) {
    const existing = await distributorsRepository.findById(id);
    if (!existing) {
      const err = new Error('Distributor not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    const updated = await distributorsRepository.updateStatus(id, input.status, actorId);

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'DISTRIBUTOR_STATUS_CHANGED',
      metadata: { distributorId: id, newStatus: input.status },
    });

    return updated;
  },

  async listDistributorDealers(
    distributorId: string,
    query: { page?: number; pageSize?: number; search?: string },
    distributorScope?: string | null
  ) {
    if (distributorScope && distributorId !== distributorScope) {
      const err = new Error('Access denied to other distributor records');
      (err as any).statusCode = 403;
      (err as any).code = 'FORBIDDEN';
      throw err;
    }

    const page = query.page || 1;
    const limit = query.pageSize || 25;

    const result = await dealersRepository.list({
      distributorId,
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

  async listDistributorNotes(distributorId: string, distributorScope?: string | null) {
    if (distributorScope && distributorId !== distributorScope) {
      const err = new Error('Access denied to other distributor records');
      (err as any).statusCode = 403;
      (err as any).code = 'FORBIDDEN';
      throw err;
    }
    return internalNotesRepository.listForEntity('DISTRIBUTOR', distributorId);
  },

  async createDistributorNote(distributorId: string, body: string, actorId: string) {
    const note = await internalNotesRepository.create({
      entityType: 'DISTRIBUTOR',
      entityId: distributorId,
      body,
      createdBy: actorId,
    });

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'INTERNAL_NOTE_CREATED',
      metadata: { entityType: 'DISTRIBUTOR', entityId: distributorId, noteId: note.id },
    });

    return note;
  },
};
