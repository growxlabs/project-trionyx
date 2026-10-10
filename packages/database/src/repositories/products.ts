import type { Client, InValue } from '@libsql/client';
import type {
  Product,
  ProductWithRelations,
  ProductStatus,
  PublicVisibility,
  DealerProduct,
  DealerProductAvailability,
} from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';
import { categoriesRepository } from './categories';
import { brandsRepository } from './brands';
import { specificationsRepository } from './specifications';
import { mediaRepository } from './media';

function mapProductRow(row: Record<string, unknown>): Product {
  const orgId = row.organization_id ? String(row.organization_id) : (row.business_code === 'LAKSHMI' ? 'org-lakshmi' : 'org-trionyx');
  return {
    id: String(row.id),
    organizationId: orgId,
    productCode: String(row.product_code),
    businessCode: row.business_code ? String(row.business_code) : (orgId === 'org-lakshmi' ? 'LAKSHMI' : 'TRIONYX'),
    brandId: row.brand_id ? String(row.brand_id) : null,
    name: String(row.name),
    slug: String(row.slug),
    categoryId: String(row.category_id),
    shortDescription: row.short_description ? String(row.short_description) : null,
    description: row.description ? String(row.description) : null,
    status: row.status as ProductStatus,
    publicVisibility: row.public_visibility as PublicVisibility,
    dealerVisibility: row.dealer_visibility !== undefined ? Boolean(row.dealer_visibility) : true,
    createdBy: row.created_by ? String(row.created_by) : null,
    updatedBy: row.updated_by ? String(row.updated_by) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function generateProductCode(prefix: string = 'TRX-PROD-', client: Client = getDbClient()): Promise<string> {
  // Query existing product codes to find the highest sequence
  const result = await client.execute({
    sql: `SELECT product_code FROM products
          WHERE product_code LIKE ?
          ORDER BY product_code DESC LIMIT 1`,
    args: [`${prefix}%`],
  });

  let nextSeq = 1;
  if (result.rows.length > 0 && result.rows[0].product_code) {
    const lastCode = String(result.rows[0].product_code);
    const numPart = lastCode.replace(prefix, '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, '0');
  return `${prefix}${padded}`;
}

export const productsRepository = {
  async create(
    data: {
      organizationId?: string | null;
      businessCode?: 'TRIONYX' | 'LAKSHMI' | string;
      brandId?: string | null;
      name: string;
      slug: string;
      categoryId: string;
      shortDescription?: string | null;
      description?: string | null;
      status?: ProductStatus;
      publicVisibility?: PublicVisibility;
      dealerVisibility?: boolean;
      createdBy?: string | null;
    },
    client: Client = getDbClient()
  ): Promise<Product> {
    const id = randomUUID();
    const organizationId = data.organizationId || (data.businessCode === 'LAKSHMI' ? 'org-lakshmi' : 'org-trionyx');
    const businessCode = data.businessCode || (organizationId === 'org-lakshmi' ? 'LAKSHMI' : 'TRIONYX');
    const brandId = data.brandId || null;
    const prefix = businessCode === 'LAKSHMI' || organizationId === 'org-lakshmi' ? 'LAK-PROD-' : 'TRX-PROD-';
    const productCode = await generateProductCode(prefix, client);
    const now = new Date().toISOString();
    const status = data.status || 'DRAFT';
    const publicVisibility = data.publicVisibility || 'PRIVATE';
    const dealerVisibility = data.dealerVisibility !== undefined ? (data.dealerVisibility ? 1 : 0) : 1;

    await client.execute({
      sql: `INSERT INTO products (
              id, organization_id, product_code, business_code, brand_id, name, slug, category_id, short_description,
              description, status, public_visibility, dealer_visibility, created_by, updated_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        organizationId,
        productCode,
        businessCode,
        brandId,
        data.name,
        data.slug,
        data.categoryId,
        data.shortDescription || null,
        data.description || null,
        status,
        publicVisibility,
        dealerVisibility,
        data.createdBy || null,
        data.createdBy || null,
        now,
        now,
      ],
    });

    return {
      id,
      organizationId,
      productCode,
      businessCode,
      brandId,
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      status,
      publicVisibility,
      dealerVisibility: Boolean(dealerVisibility),
      createdBy: data.createdBy || null,
      updatedBy: data.createdBy || null,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      categoryId: string;
      shortDescription: string | null;
      description: string | null;
      status: ProductStatus;
      publicVisibility: PublicVisibility;
      dealerVisibility: boolean;
      updatedBy: string | null;
    }>,
    client: Client = getDbClient(),
    organizationId?: string
  ): Promise<Product | null> {
    const existing = await this.findById(id, client, organizationId);
    if (!existing) return null;

    const name = data.name !== undefined ? data.name : existing.name;
    const slug = data.slug !== undefined ? data.slug : existing.slug;
    const categoryId = data.categoryId !== undefined ? data.categoryId : existing.categoryId;
    const shortDescription = (data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription) ?? null;
    const description = (data.description !== undefined ? data.description : existing.description) ?? null;
    const status = data.status !== undefined ? data.status : existing.status;
    const publicVisibility = data.publicVisibility !== undefined ? data.publicVisibility : existing.publicVisibility;
    const dealerVisibility = data.dealerVisibility !== undefined ? (data.dealerVisibility ? 1 : 0) : (existing.dealerVisibility ? 1 : 0);
    const updatedBy = (data.updatedBy !== undefined ? data.updatedBy : existing.updatedBy) ?? null;
    const now = new Date().toISOString();

    await client.execute({
      sql: `UPDATE products
            SET name = ?, slug = ?, category_id = ?, short_description = ?, description = ?,
                status = ?, public_visibility = ?, dealer_visibility = ?, updated_by = ?, updated_at = ?
            WHERE id = ?`,
      args: [name, slug, categoryId, shortDescription, description, status, publicVisibility, dealerVisibility, updatedBy, now, id],
    });

    return {
      ...existing,
      name,
      slug,
      categoryId,
      shortDescription,
      description,
      status,
      publicVisibility,
      dealerVisibility: Boolean(dealerVisibility),
      updatedBy,
      updatedAt: now,
    };
  },

  async archive(id: string, actorId?: string | null, client: Client = getDbClient(), organizationId?: string): Promise<Product | null> {
    return this.update(id, { status: 'ARCHIVED', updatedBy: actorId }, client, organizationId);
  },

  async findById(
    id: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<Product | null> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    let sql = 'SELECT * FROM products WHERE id = ?';
    const args: string[] = [id];
    if (organizationId) {
      sql += " AND (organization_id = ? OR (organization_id IS NULL AND ? = 'org-trionyx'))";
      args.push(organizationId, organizationId);
    }
    sql += ' LIMIT 1';
    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapProductRow(result.rows[0]);
  },

  async findByCode(
    productCode: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<Product | null> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    let sql = 'SELECT * FROM products WHERE product_code = ?';
    const args: string[] = [productCode];
    if (organizationId) {
      sql += " AND (organization_id = ? OR (organization_id IS NULL AND ? = 'org-trionyx'))";
      args.push(organizationId, organizationId);
    }
    sql += ' LIMIT 1';
    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapProductRow(result.rows[0]);
  },

  async findBySlug(slug: string, orgIdOrBusinessCode?: string, client: Client = getDbClient()): Promise<Product | null> {
    let sql = 'SELECT * FROM products WHERE slug = ?';
    const args: string[] = [slug];
    if (orgIdOrBusinessCode) {
      if (orgIdOrBusinessCode === 'LAKSHMI' || orgIdOrBusinessCode === 'org-lakshmi' || orgIdOrBusinessCode === 'lakshmi') {
        sql += " AND (organization_id = 'org-lakshmi' OR business_code = 'LAKSHMI')";
      } else {
        sql += " AND (organization_id = 'org-trionyx' OR business_code = 'TRIONYX' OR organization_id IS NULL)";
      }
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapProductRow(result.rows[0]);
  },

  async findWithRelations(
    id: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ProductWithRelations | null> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    const product = await this.findById(id, client, organizationId);
    if (!product) return null;

    const [brand, category, specifications, media] = await Promise.all([
      product.brandId ? brandsRepository.findById(product.brandId, client) : Promise.resolve(null),
      categoriesRepository.findById(product.categoryId, client),
      specificationsRepository.listByProduct(product.id, client),
      mediaRepository.listByProduct(product.id, client),
    ]);

    return {
      ...product,
      brand: brand || undefined,
      category: category || undefined,
      specifications,
      media,
    };
  },

  async findBySlugWithRelations(slug: string, orgIdOrBusinessCode?: string, client: Client = getDbClient()): Promise<ProductWithRelations | null> {
    const product = await this.findBySlug(slug, orgIdOrBusinessCode, client);
    if (!product) return null;
    return this.findWithRelations(product.id, client, product.organizationId || undefined);
  },

  async list(
    filter?: {
      organizationId?: string;
      businessCode?: string;
      brandId?: string;
      categoryId?: string;
      status?: ProductStatus;
      publicVisibility?: PublicVisibility;
      search?: string;
      limit?: number;
      offset?: number;
    },
    client: Client = getDbClient()
  ): Promise<Product[]> {
    let sql = 'SELECT p.* FROM products p';
    const args: (string | number)[] = [];
    const conditions: string[] = [];

    if (filter?.organizationId) {
      conditions.push("(p.organization_id = ? OR (p.organization_id IS NULL AND ? = 'org-trionyx'))");
      args.push(filter.organizationId, filter.organizationId);
    } else if (filter?.businessCode) {
      conditions.push('p.business_code = ?');
      args.push(filter.businessCode);
    }

    if (filter?.brandId) {
      conditions.push('p.brand_id = ?');
      args.push(filter.brandId);
    }
    if (filter?.categoryId) {
      conditions.push('p.category_id = ?');
      args.push(filter.categoryId);
    }
    if (filter?.status) {
      conditions.push('p.status = ?');
      args.push(filter.status);
    }
    if (filter?.publicVisibility) {
      conditions.push('p.public_visibility = ?');
      args.push(filter.publicVisibility);
    }
    if (filter?.search) {
      conditions.push(`(
        p.name LIKE ? OR
        p.product_code LIKE ? OR
        p.slug LIKE ? OR
        EXISTS (SELECT 1 FROM serial_numbers s WHERE s.product_id = p.id AND s.serial_number LIKE ?)
      )`);
      const term = `%${filter.search}%`;
      args.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY p.created_at DESC';

    if (filter?.limit) {
      sql += ' LIMIT ?';
      args.push(filter.limit);
      if (filter.offset) {
        sql += ' OFFSET ?';
        args.push(filter.offset);
      }
    }

    const result = await client.execute({ sql, args });
    return result.rows.map(mapProductRow);
  },

  async count(
    filter?: {
      organizationId?: string;
      businessCode?: string;
      brandId?: string;
      categoryId?: string;
      status?: ProductStatus;
      publicVisibility?: PublicVisibility;
      search?: string;
    },
    client: Client = getDbClient()
  ): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM products p';
    const args: (string | number)[] = [];
    const conditions: string[] = [];

    if (filter?.organizationId) {
      conditions.push("(p.organization_id = ? OR (p.organization_id IS NULL AND ? = 'org-trionyx'))");
      args.push(filter.organizationId, filter.organizationId);
    } else if (filter?.businessCode) {
      conditions.push('p.business_code = ?');
      args.push(filter.businessCode);
    }

    if (filter?.brandId) {
      conditions.push('p.brand_id = ?');
      args.push(filter.brandId);
    }
    if (filter?.categoryId) {
      conditions.push('p.category_id = ?');
      args.push(filter.categoryId);
    }
    if (filter?.status) {
      conditions.push('p.status = ?');
      args.push(filter.status);
    }
    if (filter?.publicVisibility) {
      conditions.push('p.public_visibility = ?');
      args.push(filter.publicVisibility);
    }
    if (filter?.search) {
      conditions.push(`(
        p.name LIKE ? OR
        p.product_code LIKE ? OR
        p.slug LIKE ? OR
        EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND (v.sku LIKE ? OR v.name LIKE ?))
      )`);
      const term = `%${filter.search}%`;
      args.push(term, term, term, term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await client.execute({ sql, args });
    return Number(result.rows[0]?.count ?? 0);
  },

  /**
   * STEP 4: List products approved for Dealer Portal visibility.
   * Only returns status = 'ACTIVE' AND dealer_visibility = 1.
   * Automatically computes availability from real available serial count.
   * NEVER returns serial numbers, warehouse locations, costs, or internal notes.
   */
  async listDealerProducts(
    filter?: {
      categoryId?: string;
      search?: string;
      availability?: DealerProductAvailability;
      threshold?: number;
    },
    client: Client = getDbClient()
  ): Promise<DealerProduct[]> {
    const threshold = filter?.threshold ?? parseInt(process.env.DEALER_AVAILABILITY_THRESHOLD || '5', 10);

    let sql = `
      SELECT
        p.id,
        p.product_code,
        p.name,
        p.slug,
        p.category_id,
        c.name as category_name,
        p.short_description,
        p.description,
        COALESCE(MAX(s.updated_at), p.updated_at) as last_updated,
        COUNT(CASE WHEN s.status = 'AVAILABLE' THEN 1 END) as available_count
      FROM products p
      JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN serial_numbers s ON s.product_id = p.id
      WHERE p.status = 'ACTIVE' AND p.dealer_visibility = 1
    `;
    const args: InValue[] = [];

    if (filter?.categoryId && filter.categoryId !== 'ALL') {
      sql += ' AND p.category_id = ?';
      args.push(filter.categoryId);
    }

    if (filter?.search?.trim()) {
      sql += ' AND (p.name LIKE ? OR p.short_description LIKE ? OR c.name LIKE ?)';
      const term = `%${filter.search.trim()}%`;
      args.push(term, term, term);
    }

    sql += ' GROUP BY p.id, c.name ORDER BY p.name ASC';

    const result = await client.execute({ sql, args });

    const products: DealerProduct[] = result.rows.map((row) => {
      const count = Number(row.available_count ?? 0);
      let availability: DealerProductAvailability = 'UNAVAILABLE';
      if (count > threshold) {
        availability = 'AVAILABLE';
      } else if (count > 0) {
        availability = 'LIMITED';
      }

      return {
        id: String(row.id),
        productCode: String(row.product_code),
        name: String(row.name),
        slug: String(row.slug),
        categoryId: String(row.category_id),
        categoryName: row.category_name ? String(row.category_name) : undefined,
        shortDescription: row.short_description ? String(row.short_description) : null,
        description: row.description ? String(row.description) : null,
        availability,
        lastUpdated: String(row.last_updated),
      };
    });

    if (filter?.availability && filter.availability !== ('ALL' as any)) {
      return products.filter((p) => p.availability === filter.availability);
    }

    return products;
  },

  /**
   * STEP 4: Retrieve single dealer-safe product with specifications and approved media.
   */
  async getDealerProductById(
    id: string,
    thresholdParam?: number,
    client: Client = getDbClient()
  ): Promise<DealerProduct | null> {
    const threshold = thresholdParam ?? parseInt(process.env.DEALER_AVAILABILITY_THRESHOLD || '5', 10);

    const result = await client.execute({
      sql: `
        SELECT
          p.id,
          p.product_code,
          p.name,
          p.slug,
          p.category_id,
          c.name as category_name,
          p.short_description,
          p.description,
          COALESCE(MAX(s.updated_at), p.updated_at) as last_updated,
          COUNT(CASE WHEN s.status = 'AVAILABLE' THEN 1 END) as available_count
        FROM products p
        JOIN product_categories c ON p.category_id = c.id
        LEFT JOIN serial_numbers s ON s.product_id = p.id
        WHERE p.id = ? AND p.status = 'ACTIVE' AND p.dealer_visibility = 1
        GROUP BY p.id, c.name
        LIMIT 1
      `,
      args: [id],
    });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    const count = Number(row.available_count ?? 0);
    let availability: DealerProductAvailability = 'UNAVAILABLE';
    if (count > threshold) {
      availability = 'AVAILABLE';
    } else if (count > 0) {
      availability = 'LIMITED';
    }

    const [specs, media] = await Promise.all([
      specificationsRepository.listByProduct(id, client),
      mediaRepository.listByProduct(id, client),
    ]);

    return {
      id: String(row.id),
      productCode: String(row.product_code),
      name: String(row.name),
      slug: String(row.slug),
      categoryId: String(row.category_id),
      categoryName: row.category_name ? String(row.category_name) : undefined,
      shortDescription: row.short_description ? String(row.short_description) : null,
      description: row.description ? String(row.description) : null,
      availability,
      specifications: specs.map((s) => ({ id: s.id, label: s.label, value: s.value, sortOrder: s.sortOrder })),
      media: media.map((m) => ({ id: m.id, type: m.type, storagePath: m.storagePath, fileName: m.fileName, altText: m.altText })),
      lastUpdated: String(row.last_updated),
    };
  },

  async findMatching(
    term: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<Product[]> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    const clean = term.trim();
    if (!clean) return [];

    let exactSql = `SELECT * FROM products WHERE (LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?) OR LOWER(product_code) = LOWER(?))`;
    const exactArgs: string[] = [clean, clean, clean];
    if (organizationId) {
      exactSql += " AND (organization_id = ? OR (organization_id IS NULL AND ? = 'org-trionyx'))";
      exactArgs.push(organizationId, organizationId);
    }
    const exact = await client.execute({ sql: exactSql, args: exactArgs });
    if (exact.rows.length > 0) return exact.rows.map(mapProductRow);

    const pattern = `%${clean}%`;
    let partialSql = `SELECT * FROM products WHERE (LOWER(name) LIKE LOWER(?) OR LOWER(slug) LIKE LOWER(?) OR LOWER(product_code) LIKE LOWER(?))`;
    const partialArgs: string[] = [pattern, pattern, pattern];
    if (organizationId) {
      partialSql += " AND (organization_id = ? OR (organization_id IS NULL AND ? = 'org-trionyx'))";
      partialArgs.push(organizationId, organizationId);
    }
    partialSql += ' ORDER BY name ASC';
    const partial = await client.execute({ sql: partialSql, args: partialArgs });
    return partial.rows.map(mapProductRow);
  },
};

