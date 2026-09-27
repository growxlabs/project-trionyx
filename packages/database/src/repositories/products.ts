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
import { specificationsRepository } from './specifications';
import { mediaRepository } from './media';

function mapProductRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    productCode: String(row.product_code),
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

export async function generateProductCode(client: Client = getDbClient()): Promise<string> {
  // Query existing product codes to find the highest sequence
  const result = await client.execute(`
    SELECT product_code FROM products
    WHERE product_code LIKE 'TRX-PROD-%'
    ORDER BY product_code DESC LIMIT 1
  `);

  let nextSeq = 1;
  if (result.rows.length > 0 && result.rows[0].product_code) {
    const lastCode = String(result.rows[0].product_code);
    const numPart = lastCode.replace('TRX-PROD-', '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, '0');
  return `TRX-PROD-${padded}`;
}

export const productsRepository = {
  async create(
    data: {
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
    const productCode = await generateProductCode(client);
    const now = new Date().toISOString();
    const status = data.status || 'DRAFT';
    const publicVisibility = data.publicVisibility || 'PRIVATE';
    const dealerVisibility = data.dealerVisibility !== undefined ? (data.dealerVisibility ? 1 : 0) : 1;

    await client.execute({
      sql: `INSERT INTO products (
              id, product_code, name, slug, category_id, short_description,
              description, status, public_visibility, dealer_visibility, created_by, updated_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        productCode,
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
      productCode,
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
    client: Client = getDbClient()
  ): Promise<Product | null> {
    const existing = await this.findById(id, client);
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

  async archive(id: string, actorId?: string | null, client: Client = getDbClient()): Promise<Product | null> {
    return this.update(id, { status: 'ARCHIVED', updatedBy: actorId }, client);
  },

  async findById(id: string, client: Client = getDbClient()): Promise<Product | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM products WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapProductRow(result.rows[0]);
  },

  async findByCode(productCode: string, client: Client = getDbClient()): Promise<Product | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM products WHERE product_code = ? LIMIT 1',
      args: [productCode],
    });
    if (result.rows.length === 0) return null;
    return mapProductRow(result.rows[0]);
  },

  async findBySlug(slug: string, client: Client = getDbClient()): Promise<Product | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM products WHERE slug = ? LIMIT 1',
      args: [slug],
    });
    if (result.rows.length === 0) return null;
    return mapProductRow(result.rows[0]);
  },

  async findWithRelations(id: string, client: Client = getDbClient()): Promise<ProductWithRelations | null> {
    const product = await this.findById(id, client);
    if (!product) return null;

    const [category, specifications, media] = await Promise.all([
      categoriesRepository.findById(product.categoryId, client),
      specificationsRepository.listByProduct(product.id, client),
      mediaRepository.listByProduct(product.id, client),
    ]);

    return {
      ...product,
      category: category || undefined,
      specifications,
      media,
    };
  },

  async list(
    filter?: {
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

    sql += ' GROUP BY p.id ORDER BY p.name ASC';

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
        GROUP BY p.id
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
};

