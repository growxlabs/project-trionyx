import type { Client } from '@libsql/client';
import type { ProductCategory } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapCategoryRow(row: Record<string, unknown>): ProductCategory {
  return {
    id: String(row.id),
    businessCode: row.business_code ? String(row.business_code) : 'TRIONYX',
    brandId: row.brand_id ? String(row.brand_id) : null,
    organizationId: row.organization_id ? String(row.organization_id) : null,
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    status: row.status as 'ACTIVE' | 'INACTIVE',
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const categoriesRepository = {
  async create(
    data: {
      organizationId?: string | null;
      businessCode?: 'TRIONYX' | 'LAKSHMI' | string;
      brandId?: string | null;
      name: string;
      slug: string;
      description?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
      sortOrder?: number;
    },
    client: Client = getDbClient()
  ): Promise<ProductCategory> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';
    const sortOrder = data.sortOrder ?? 0;
    const businessCode = data.businessCode || 'TRIONYX';
    const brandId = data.brandId || null;
    const organizationId = data.organizationId || (businessCode === 'LAKSHMI' ? 'org-lakshmi' : 'org-trionyx');

    await client.execute({
      sql: `INSERT INTO product_categories (id, business_code, brand_id, organization_id, name, slug, description, status, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, businessCode, brandId, organizationId, data.name, data.slug, data.description || null, status, sortOrder, now, now],
    });

    return {
      id,
      businessCode,
      brandId,
      organizationId,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      status,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      status: 'ACTIVE' | 'INACTIVE';
      sortOrder: number;
    }>,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ProductCategory | null> {
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

    const existing = await this.findById(id, client, organizationId);
    if (!existing) return null;

    const name = data.name !== undefined ? data.name : existing.name;
    const slug = data.slug !== undefined ? data.slug : existing.slug;
    const description = (data.description !== undefined ? data.description : existing.description) ?? null;
    const status = data.status !== undefined ? data.status : existing.status;
    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder;
    const now = new Date().toISOString();

    await client.execute({
      sql: `UPDATE product_categories
            SET name = ?, slug = ?, description = ?, status = ?, sort_order = ?, updated_at = ?
            WHERE id = ?`,
      args: [name, slug, description, status, sortOrder, now, id],
    });

    return {
      id,
      businessCode: existing.businessCode,
      brandId: existing.brandId,
      organizationId: existing.organizationId,
      name,
      slug,
      description,
      status,
      sortOrder,
      createdAt: existing.createdAt,
      updatedAt: now,
    };
  },

  async findById(
    id: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ProductCategory | null> {
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

    let sql = 'SELECT * FROM product_categories WHERE id = ?';
    const args: string[] = [id];
    if (organizationId) {
      sql += ' AND organization_id = ?';
      args.push(organizationId);
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapCategoryRow(result.rows[0]);
  },

  async findBySlug(slug: string, businessCodeOrOrgId?: string, client: Client = getDbClient()): Promise<ProductCategory | null> {
    let sql = 'SELECT * FROM product_categories WHERE slug = ?';
    const args: string[] = [slug];
    if (businessCodeOrOrgId) {
      if (businessCodeOrOrgId.startsWith('org-')) {
        sql += ' AND organization_id = ?';
      } else {
        sql += ' AND business_code = ?';
      }
      args.push(businessCodeOrOrgId);
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapCategoryRow(result.rows[0]);
  },

  async list(
    filter?: { organizationId?: string; businessCode?: string; brandId?: string; status?: 'ACTIVE' | 'INACTIVE'; search?: string },
    client: Client = getDbClient()
  ): Promise<ProductCategory[]> {
    let sql = 'SELECT * FROM product_categories WHERE 1=1';
    const args: (string | number)[] = [];

    if (filter?.organizationId) {
      sql += ' AND organization_id = ?';
      args.push(filter.organizationId);
    }
    if (filter?.businessCode) {
      sql += ' AND business_code = ?';
      args.push(filter.businessCode);
    }
    if (filter?.brandId) {
      sql += ' AND brand_id = ?';
      args.push(filter.brandId);
    }
    if (filter?.status) {
      sql += ' AND status = ?';
      args.push(filter.status);
    }
    if (filter?.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      const term = `%${filter.search}%`;
      args.push(term, term);
    }

    sql += ' ORDER BY sort_order ASC, name ASC';
    const result = await client.execute({ sql, args });
    return result.rows.map(mapCategoryRow);
  },

  async listAllActive(organizationId?: string, client: Client = getDbClient()): Promise<ProductCategory[]> {
    return this.list({ status: 'ACTIVE', organizationId }, client);
  },

  async count(organizationId?: string, client: Client = getDbClient()): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM product_categories';
    const args: string[] = [];
    if (organizationId) {
      sql += ' WHERE organization_id = ?';
      args.push(organizationId);
    }
    const result = await client.execute({ sql, args });
    return Number(result.rows[0]?.count ?? 0);
  },
};
