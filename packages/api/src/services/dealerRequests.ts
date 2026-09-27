import {
  dealerRequestsRepository,
  dealerRequestMessagesRepository,
  auditLogsRepository,
} from '@trionyx/database';
import type {
  CreateDealerRequestInput,
  UpdateDealerRequestStatusInput,
  CreateDealerPortalRequestInput,
} from '@trionyx/validation';
import type { DealerRequestStatus, DealerRequestType } from '@trionyx/types';

export const dealerRequestsService = {
  // Internal operations
  async listInternalDealerRequests(
    dealerId: string,
    query: {
      status?: DealerRequestStatus;
      type?: DealerRequestType;
      page?: number;
      pageSize?: number;
    }
  ) {
    const page = query.page || 1;
    const limit = query.pageSize || 25;

    const result = await dealerRequestsRepository.list({
      dealerId,
      status: query.status,
      type: query.type,
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

  async createInternalDealerRequest(dealerId: string, data: Omit<CreateDealerRequestInput, 'dealerId'>, actorId: string) {
    const created = await dealerRequestsRepository.create({
      dealerId,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      assignedTo: data.assignedTo,
      createdBy: actorId,
    });

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'DEALER_REQUEST_CREATED',
      metadata: { requestId: created.id, requestCode: created.requestCode, dealerId },
    });

    return created;
  },

  async getInternalRequestById(requestId: string) {
    const item = await dealerRequestsRepository.findById(requestId);
    if (!item) return null;
    const messages = await dealerRequestMessagesRepository.listByRequest(requestId);
    return {
      request: item,
      messages,
    };
  },

  async updateInternalRequestStatus(requestId: string, input: UpdateDealerRequestStatusInput, actorId: string) {
    const updated = await dealerRequestsRepository.updateStatus(requestId, {
      status: input.status,
      assignedTo: input.assignedTo,
    });
    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'DEALER_REQUEST_UPDATED',
      metadata: { requestId, newStatus: input.status },
    });
    return updated;
  },

  // Dealer portal operations (strictly multi-tenant scoped to session dealerId)
  async listDealerPortalRequests(
    dealerId: string,
    query: {
      status?: DealerRequestStatus;
      type?: DealerRequestType;
      page?: number;
      pageSize?: number;
    }
  ) {
    const page = query.page || 1;
    const limit = query.pageSize || 25;

    const result = await dealerRequestsRepository.list({
      dealerId,
      status: query.status,
      type: query.type,
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

  async getDealerPortalRequestById(requestId: string, dealerId: string) {
    const item = await dealerRequestsRepository.findById(requestId);
    if (!item || item.dealerId !== dealerId) {
      const err = new Error('Request not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    const messages = await dealerRequestMessagesRepository.listByRequest(requestId);
    return {
      request: item,
      messages,
    };
  },

  async createDealerPortalRequest(
    data: CreateDealerPortalRequestInput,
    dealerId: string,
    dealerUserId: string,
    dealerCode?: string
  ) {
    const created = await dealerRequestsRepository.create({
      dealerId,
      productId: data.productId || null,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      createdBy: dealerUserId,
    });

    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_REQUEST_CREATED',
      metadata: {
        dealerUserId,
        dealerId,
        dealerCode,
        requestId: created.id,
        requestCode: created.requestCode,
        subject: created.subject,
        type: created.type,
      },
    });

    return created;
  },

  async addMessage(
    requestId: string,
    body: string,
    senderType: 'DEALER' | 'INTERNAL',
    senderId: string,
    senderName: string,
    dealerIdVerification?: string
  ) {
    const req = await dealerRequestsRepository.findById(requestId);
    if (!req) {
      const err = new Error('Request not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    if (dealerIdVerification && req.dealerId !== dealerIdVerification) {
      const err = new Error('Request not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    const message = await dealerRequestMessagesRepository.create({
      requestId,
      senderType,
      senderId,
      senderName,
      body,
    });

    await auditLogsRepository.recordEvent({
      userId: senderType === 'INTERNAL' ? senderId : null,
      event: 'DEALER_REQUEST_MESSAGE_CREATED',
      metadata: {
        dealerUserId: senderType === 'DEALER' ? senderId : undefined,
        dealerId: req.dealerId,
        requestId,
        requestCode: req.requestCode,
      },
    });

    return message;
  },
};
