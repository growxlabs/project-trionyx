import {
  productsRepository,
  categoriesRepository,
  dealersRepository,
  dealerUsersRepository,
  dealerRequestsRepository,
  auditLogsRepository,
} from '@trionyx/database';
import { changeDealerPassword as authChangeDealerPassword } from '@trionyx/auth';
import type {
  DealerWithRelations,
  SafeDealerUser,
  DealerActivityItem,
  DealerProductAvailability,
} from '@trionyx/types';
import type { UpdateDealerProfileByDealerInput } from '@trionyx/validation';

export const dealerPortalService = {
  async getOverview(dealer: DealerWithRelations, dealerUser: SafeDealerUser) {
    const requestsResult = await dealerRequestsRepository.list({
      dealerId: dealer.id,
      limit: 100,
    });
    const openRequestsCount = requestsResult.items.filter(
      (r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS'
    ).length;

    const rawAudit = await auditLogsRepository.list({ limit: 20 });
    const recentActivity: DealerActivityItem[] = [];

    for (const log of rawAudit) {
      let isDealerEvent = false;
      let type: DealerActivityItem['type'] = 'LOGIN';
      let description = '';

      if (log.userId === dealerUser.id) {
        if (log.event === 'DEALER_LOGIN_SUCCESS') {
          type = 'LOGIN';
          description = 'Signed in to Dealer Portal';
          isDealerEvent = true;
        } else if (log.event === 'DEALER_PASSWORD_CHANGED') {
          type = 'PASSWORD_CHANGED';
          description = 'Account password updated';
          isDealerEvent = true;
        }
      }

      if (!isDealerEvent && log.metadata) {
        try {
          const meta = JSON.parse(log.metadata);
          if (meta.dealerId === dealer.id || meta.dealerUserId === dealerUser.id) {
            if (log.event === 'DEALER_REQUEST_CREATED') {
              type = 'REQUEST_CREATED';
              description = `Product request created (${meta.requestCode || 'TRX-REQ'})`;
              isDealerEvent = true;
            } else if (log.event === 'DEALER_REQUEST_UPDATED' || log.event === 'DEALER_REQUEST_RESOLVED') {
              type = 'REQUEST_UPDATED';
              description = `Request status updated to ${meta.newStatus || 'UPDATED'}`;
              isDealerEvent = true;
            } else if (log.event === 'DEALER_ACCOUNT_UPDATED' || log.event === 'DEALER_UPDATED') {
              type = 'ACCOUNT_UPDATED';
              description = 'Dealer account details updated';
              isDealerEvent = true;
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      if (isDealerEvent) {
        recentActivity.push({
          id: log.id,
          type,
          description,
          timestamp: log.createdAt,
        });
        if (recentActivity.length >= 6) break;
      }
    }

    return {
      dealerUser,
      dealer: {
        id: dealer.id,
        dealerCode: dealer.dealerCode,
        businessName: dealer.businessName,
        status: dealer.status,
        city: dealer.city,
        state: dealer.state,
        contactPerson: dealer.contactPerson,
        phone: dealer.phone,
        email: dealer.email,
      },
      assignedDistributor: dealer.distributor
        ? {
            id: dealer.distributor.id,
            distributorCode: dealer.distributor.distributorCode,
            businessName: dealer.distributor.businessName,
            city: dealer.distributor.city,
            state: dealer.distributor.state,
            contactPerson: dealer.distributor.contactPerson,
            phone: dealer.distributor.phone,
          }
        : null,
      openRequestsCount,
      recentActivity,
    };
  },

  async listProducts(query: {
    categoryId?: string;
    search?: string;
    availability?: DealerProductAvailability;
  }) {
    const [products, categories] = await Promise.all([
      productsRepository.listDealerProducts(query),
      categoriesRepository.listAllActive(),
    ]);

    return {
      products,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    };
  },

  async getProductById(id: string) {
    const product = await productsRepository.findWithRelations(id);
    if (!product || !product.dealerVisibility || product.status !== 'ACTIVE') {
      const err = new Error('Product not found or not available');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    // Zero information leakage: strip costs, margins, and internal notes
    return {
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      categoryName: product.category?.name || 'General',
      shortDescription: product.shortDescription,
      description: product.description,
      specifications: product.specifications,
      media: product.media,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  },

  async getAvailability(query: {
    categoryId?: string;
    search?: string;
    availability?: DealerProductAvailability;
  }) {
    const [products, categories] = await Promise.all([
      productsRepository.listDealerProducts(query),
      categoriesRepository.listAllActive(),
    ]);

    const items = products.map((p) => ({
      id: p.id,
      name: p.name,
      productCode: p.productCode,
      categoryName: p.categoryName || 'General',
      availability: p.availability,
      lastUpdated: p.lastUpdated,
    }));

    return {
      items,
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    };
  },

  async getAccount(dealer: DealerWithRelations, dealerUser: SafeDealerUser) {
    const users = await dealerUsersRepository.listByDealer(dealer.id);
    return {
      dealer,
      currentUser: dealerUser,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
    };
  },

  async updateAccount(dealer: DealerWithRelations, data: UpdateDealerProfileByDealerInput, dealerUser: SafeDealerUser) {
    if (data.phone || data.email) {
      const dup = await dealersRepository.checkDuplicates({
        phone: data.phone || '',
        email: data.email,
        excludeId: dealer.id,
      });

      if (dup) {
        const err = new Error(`${dup.duplicateField} is already registered to ${dup.existingDealerName}`);
        (err as any).statusCode = 409;
        (err as any).code = 'CONFLICT';
        throw err;
      }
    }

    const updated = await dealersRepository.update(dealer.id, {
      contactPerson: data.contactPerson,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      email: data.email,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      updatedBy: dealer.updatedBy || dealer.createdBy,
    });

    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_ACCOUNT_UPDATED',
      metadata: {
        dealerUserId: dealerUser.id,
        dealerId: dealer.id,
        dealerCode: dealer.dealerCode,
        updatedFields: Object.keys(data),
      },
    });

    return updated;
  },

  async changePassword(dealerUserId: string, currentPassword: string, newPassword: string) {
    return authChangeDealerPassword(dealerUserId, currentPassword, newPassword);
  },
};
