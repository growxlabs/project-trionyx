import type { DatabaseClient as Client } from '@trionyx/database';
import { getDbClient } from '@trionyx/database';
import {
  dealersRepository,
  internalNotesRepository,
  dealerUsersRepository,
  auditLogsRepository,
} from '@trionyx/database';
import { inviteDealerUser as authInviteDealerUser } from '@trionyx/auth';
import type {
  CreateDealerInput,
  UpdateDealerInput,
  DealerStatusInput,
  ReassignDealerDistributorInput,
} from '@trionyx/validation';
import type { DealerStatus } from '@trionyx/types';

export const dealersService = {
  async listDealers(
    query: {
      search?: string;
      status?: DealerStatus;
      state?: string;
      city?: string;
      id?: string;
      code?: string;
      exactName?: string;
      hasDistributor?: boolean;
      distributorId?: string;
      organizationId?: string;
      page?: number;
      pageSize?: number;
    },
    distributorScope?: string | null
  ) {
    const page = query.page || 1;
    const limit = query.pageSize || 25;

    // Server-enforced distributor scoping
    const effectiveDistributorId = distributorScope || query.distributorId;

    const result = await dealersRepository.list({
      city: query.city,
      id: query.id,
      code: query.code,
      exactName: query.exactName,
      hasDistributor: distributorScope ? true : query.hasDistributor,
      search: query.search,
      status: query.status,
      state: query.state,
      distributorId: effectiveDistributorId,
      organizationId: query.organizationId,
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

  async getDealerById(id: string, distributorScope?: string | null, organizationId?: string) {
    const dealer = await dealersRepository.findById(id, organizationId);
    if (!dealer) return null;

    if (distributorScope && dealer.distributorId !== distributorScope) {
      const err = new Error('Access denied to dealer outside assigned territory');
      (err as any).statusCode = 403;
      (err as any).code = 'FORBIDDEN';
      throw err;
    }

    return dealer;
  },

  async createDealer(
    data: CreateDealerInput & { organizationId?: string | null },
    actorId: string,
    distributorScope?: string | null
  ) {
    // If user is a distributor, enforce self-assignment
    const assignedDistributorId = distributorScope || data.distributorId || null;

    // Check duplicate phone or email
    const duplicate = await dealersRepository.checkDuplicates({
      phone: data.phone,
      email: data.email,
    });

    if (duplicate) {
      const err = new Error(`${duplicate.duplicateField} is already registered to ${duplicate.existingDealerName}`);
      (err as any).statusCode = 409;
      (err as any).code = 'CONFLICT';
      throw err;
    }

    const created = await dealersRepository.create({
      ...data,
      distributorId: assignedDistributorId,
      createdBy: actorId,
      organizationId: data.organizationId ?? null,
    });

    await auditLogsRepository.recordEvent({
      userId: actorId,
      organizationId: data.organizationId ?? null,
      event: 'DEALER_CREATED',
      metadata: { dealerId: created.id, dealerCode: created.dealerCode, businessName: created.businessName },
    });

    return created;
  },

  async updateDealer(
    id: string,
    data: UpdateDealerInput,
    actorId: string,
    distributorScope?: string | null,
    organizationId?: string
  ) {
    const existing = await this.getDealerById(id, distributorScope, organizationId);
    if (!existing) {
      const err = new Error('Dealer not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    if (data.phone || data.email) {
      const duplicate = await dealersRepository.checkDuplicates({
        phone: data.phone || existing.phone,
        email: data.email !== undefined ? data.email : existing.email,
        excludeId: id,
        organizationId,
      });

      if (duplicate) {
        const err = new Error(`${duplicate.duplicateField} is already registered to ${duplicate.existingDealerName}`);
        (err as any).statusCode = 409;
        (err as any).code = 'CONFLICT';
        throw err;
      }
    }

    const updated = await dealersRepository.update(id, {
      ...data,
      updatedBy: actorId,
    }, organizationId);

    await auditLogsRepository.recordEvent({
      userId: actorId,
      organizationId: organizationId || existing.organizationId || null,
      event: 'DEALER_UPDATED',
      metadata: { dealerId: id, updatedFields: Object.keys(data) },
    });

    return updated;
  },

  async updateDealerStatus(
    id: string,
    input: DealerStatusInput,
    actorId: string,
    distributorScope?: string | null,
    organizationId?: string
  ) {
    const existing = await this.getDealerById(id, distributorScope, organizationId);
    if (!existing) {
      const err = new Error('Dealer not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    const updated = await dealersRepository.updateStatus(id, input.status, actorId, organizationId);

    await auditLogsRepository.recordEvent({
      userId: actorId,
      organizationId: organizationId || existing.organizationId || null,
      event: 'DEALER_STATUS_CHANGED',
      metadata: { dealerId: id, newStatus: input.status },
    });

    return updated;
  },

  async assignDistributor(id: string, input: ReassignDealerDistributorInput, actorId: string, client: Client = getDbClient()) {
    const existing = await dealersRepository.findById(id, client);
    if (!existing) {
      const err = new Error('Dealer not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    const newDistributorId = input.newDistributorId?.trim() || null;
    const result = await dealersRepository.reassignDistributor(
      id,
      newDistributorId,
      input.reason,
      actorId, client
    );

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'DEALER_DISTRIBUTOR_REASSIGNED',
      metadata: {
        dealerId: id,
        previousDistributorId: existing.distributorId,
        newDistributorId,
        reason: input.reason,
      },
    }, client);

    return result.dealer;
  },

  async getDealerHistory(dealerId: string, distributorScope?: string | null) {
    await this.getDealerById(dealerId, distributorScope);
    return dealersRepository.getDistributorHistory(dealerId);
  },

  async listDealerNotes(dealerId: string, distributorScope?: string | null) {
    await this.getDealerById(dealerId, distributorScope);
    return internalNotesRepository.listForEntity('DEALER', dealerId);
  },

  async createDealerNote(dealerId: string, body: string, actorId: string, distributorScope?: string | null) {
    await this.getDealerById(dealerId, distributorScope);
    const note = await internalNotesRepository.create({
      entityType: 'DEALER',
      entityId: dealerId,
      body,
      createdBy: actorId,
    });

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'INTERNAL_NOTE_CREATED',
      metadata: { entityType: 'DEALER', entityId: dealerId, noteId: note.id },
    });

    return note;
  },

  async listDealerUsers(dealerId: string, distributorScope?: string | null) {
    await this.getDealerById(dealerId, distributorScope);
    return dealerUsersRepository.listByDealer(dealerId);
  },

  async inviteDealerUser(dealerId: string, name: string, email: string, actorId: string) {
    return authInviteDealerUser(dealerId, name, email, actorId);
  },

  async disableDealerUser(dealerUserId: string, actorId: string) {
    const user = await dealerUsersRepository.findById(dealerUserId);
    if (!user) {
      const err = new Error('Dealer user not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    const updated = await dealerUsersRepository.updateStatus(dealerUserId, 'DISABLED');
    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'DEALER_USER_DISABLED',
      metadata: { dealerUserId, dealerId: user.dealerId },
    });
    return updated;
  },
};
