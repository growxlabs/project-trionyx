import type { Client } from '@libsql/client';
import type { Brand } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapBrandRow(row: Record<string, unknown>): Brand {
  return {
    id: String(row.id),
    businessCode: String(row.business_code || 'LAKSHMI'),
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

export const brandsRepository = {
  async create(
    data: {
      organizationId?: string | null;
      businessCode?: 'TRIONYX' | 'LAKSHMI' | string;
      name: string;
      slug: string;
      description?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
      sortOrder?: number;
    },
    client: Client = getDbClient()
  ): Promise<Brand> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const businessCode = data.businessCode || 'LAKSHMI';
    const organizationId = data.organizationId || (businessCode === 'TRIONYX' ? 'org-trionyx' : 'org-lakshmi');
    const status = data.status || 'ACTIVE';
    const sortOrder = data.sortOrder ?? 0;

    await client.execute({
      sql: `INSERT INTO brands (id, business_code, organization_id, name, slug, description, status, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, businessCode, organizationId, data.name, data.slug, data.description || null, status, sortOrder, now, now],
    });

    return {
      id,
      businessCode,
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

  async findById(
    id: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<Brand | null> {
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

    let sql = 'SELECT * FROM brands WHERE id = ?';
    const args: string[] = [id];
    if (organizationId) {
      sql += ' AND organization_id = ?';
      args.push(organizationId);
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapBrandRow(result.rows[0]);
  },

  async findBySlug(slug: string, businessCodeOrOrgId?: string, client: Client = getDbClient()): Promise<Brand | null> {
    let sql = 'SELECT * FROM brands WHERE slug = ?';
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
    return mapBrandRow(result.rows[0]);
  },

  async list(
    filter?: { organizationId?: string; businessCode?: string; status?: 'ACTIVE' | 'INACTIVE'; search?: string } | string,
    client: Client = getDbClient()
  ): Promise<Brand[]> {
    const filterObj = typeof filter === 'string' ? { organizationId: filter } : filter;
    let sql = 'SELECT * FROM brands WHERE 1=1';
    const args: (string | number)[] = [];

    if (filterObj?.organizationId) {
      sql += ' AND organization_id = ?';
      args.push(filterObj.organizationId);
    }
    if (filterObj?.businessCode) {
      sql += ' AND business_code = ?';
      args.push(filterObj.businessCode);
    }
    if (filterObj?.status) {
      sql += ' AND status = ?';
      args.push(filterObj.status);
    }
    if (filterObj?.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      const term = `%${filterObj.search}%`;
      args.push(term, term);
    }

    sql += ' ORDER BY sort_order ASC, name ASC';
    const result = await client.execute({ sql, args });
    return result.rows.map(mapBrandRow);
  },

  async count(filter?: { organizationId?: string; businessCode?: string }, client: Client = getDbClient()): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM brands WHERE 1=1';
    const args: string[] = [];
    if (filter?.organizationId) {
      sql += ' AND organization_id = ?';
      args.push(filter.organizationId);
    }
    if (filter?.businessCode) {
      sql += ' AND business_code = ?';
      args.push(filter.businessCode);
    }
    const result = await client.execute({ sql, args });
    return Number(result.rows[0]?.count ?? 0);
  },
};
