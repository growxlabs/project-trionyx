import {
  productsRepository,
  categoriesRepository,
  specificationsRepository,
  mediaRepository,
  auditLogsRepository,
} from '@trionyx/database';
import type {
  ProductWithRelations,
  ProductCategory,
  ProductStatus,
  PublicVisibility,
} from '@trionyx/types';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export interface ListProductsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  visibility?: PublicVisibility;
  organizationId?: string;
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  shortDescription?: string | null;
  description?: string | null;
  status?: ProductStatus;
  publicVisibility?: PublicVisibility;
  dealerVisibility?: boolean;
  specifications?: Array<{ label: string; value: string }>;
  organizationId?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: string;
  shortDescription?: string | null;
  description?: string | null;
  status?: ProductStatus;
  publicVisibility?: PublicVisibility;
  dealerVisibility?: boolean;
  specifications?: Array<{ label: string; value: string }>;
}

export const productsService = {
  async listProducts(query: ListProductsQuery) {
    const page = query.page || 1;
    const limit = query.pageSize || 25;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      productsRepository.list({
        organizationId: query.organizationId,
        categoryId: query.categoryId,
        status: query.status,
        publicVisibility: query.visibility,
        search: query.search,
        limit,
        offset,
      }),
      productsRepository.count({
        organizationId: query.organizationId,
        categoryId: query.categoryId,
        status: query.status,
        publicVisibility: query.visibility,
        search: query.search,
      }),
    ]);

    return {
      items,
      meta: {
        page,
        pageSize: limit,
        total,
      },
    };
  },

  async getProductById(id: string, organizationId?: string): Promise<ProductWithRelations | null> {
    return productsRepository.findWithRelations(id, undefined, organizationId);
  },

  async createProduct(data: CreateProductInput, actorId: string): Promise<ProductWithRelations> {
    const slug = `${generateSlug(data.name)}-${Date.now().toString().slice(-4)}`;

    const created = await productsRepository.create({
      organizationId: data.organizationId,
      name: data.name,
      slug,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription,
      description: data.description,
      status: data.status || 'DRAFT',
      publicVisibility: data.publicVisibility || 'PRIVATE',
      dealerVisibility: data.dealerVisibility !== undefined ? data.dealerVisibility : true,
      createdBy: actorId,
    });

    if (data.specifications && data.specifications.length > 0) {
      await specificationsRepository.replaceForProduct(created.id, data.specifications);
    }

    await auditLogsRepository.recordEvent({
      userId: actorId,
      event: 'PRODUCT_CREATED',
      metadata: { productId: created.id, productCode: created.productCode, name: created.name },
    });

    const full = await productsRepository.findWithRelations(created.id);
    return full!;
  },

  async updateProduct(id: string, data: UpdateProductInput, actorId: string, organizationId?: string): Promise<ProductWithRelations> {
    const updated = await productsRepository.update(id, {
      ...data,
      updatedBy: actorId,
    }, undefined, organizationId);

    if (!updated) {
      const err = new Error('Product not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    if (data.specifications !== undefined) {
      await specificationsRepository.replaceForProduct(id, data.specifications);
    }

    await auditLogsRepository.recordEvent({
      userId: actorId,
      organizationId: organizationId || updated.organizationId || null,
      event: 'PRODUCT_UPDATED',
      metadata: { productId: id, updatedFields: Object.keys(data) },
    });

    const full = await productsRepository.findWithRelations(id, undefined, organizationId);
    return full!;
  },

  async archiveProduct(id: string, actorId: string, organizationId?: string): Promise<ProductWithRelations> {
    const archived = await productsRepository.archive(id, actorId, undefined, organizationId);
    if (!archived) {
      const err = new Error('Product not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    await auditLogsRepository.recordEvent({
      userId: actorId,
      organizationId: organizationId || archived.organizationId || null,
      event: 'PRODUCT_ARCHIVED',
      metadata: { productId: id },
    });
    const full = await productsRepository.findWithRelations(id, undefined, organizationId);
    return full!;
  },

  async restoreProduct(id: string, actorId: string, organizationId?: string): Promise<ProductWithRelations> {
    const restored = await productsRepository.update(id, {
      status: 'ACTIVE',
      updatedBy: actorId,
    }, undefined, organizationId);
    if (!restored) {
      const err = new Error('Product not found');
      (err as any).statusCode = 404;
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    await auditLogsRepository.recordEvent({
      userId: actorId,
      organizationId: organizationId || restored.organizationId || null,
      event: 'PRODUCT_UPDATED',
      metadata: { productId: id, action: 'RESTORED' },
    });
    const full = await productsRepository.findWithRelations(id, undefined, organizationId);
    return full!;
  },

  async listCategories(organizationId?: string): Promise<ProductCategory[]> {
    return categoriesRepository.listAllActive(organizationId);
  },

  async createCategory(data: { name: string; description?: string | null; organizationId?: string | null }) {
    const slug = generateSlug(data.name);
    return categoriesRepository.create({
      name: data.name,
      slug,
      description: data.description || null,
      organizationId: data.organizationId,
    });
  },

  async updateCategory(id: string, data: { name?: string; description?: string | null; status?: 'ACTIVE' | 'INACTIVE' }, organizationId?: string) {
    return categoriesRepository.update(id, data, organizationId);
  },

  async deleteMedia(mediaId: string, _actorId: string) {
    await mediaRepository.delete(mediaId);
    return { success: true };
  },
};
