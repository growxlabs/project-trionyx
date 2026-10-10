import type { Client } from '@libsql/client';
import type { InventoryLocation } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapLocationRow(row: Record<string, unknown>): InventoryLocation {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    organizationId: row.organization_id ? String(row.organization_id) : null,
    status: row.status as 'ACTIVE' | 'INACTIVE',
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const locationsRepository = {
  async create(
    data: {
      code: string;
      name: string;
      organizationId?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    client: Client = getDbClient()
  ): Promise<InventoryLocation> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';
    const cleanCode = data.code.trim().toUpperCase();
    const organizationId = data.organizationId || 'org-trionyx';

    // Check code uniqueness within org
    const existing = await this.findByCode(cleanCode, organizationId, client);
    if (existing) {
      throw new Error(`Location code "${cleanCode}" is already in use.`);
    }

    await client.execute({
      sql: `INSERT INTO inventory_locations (id, code, name, organization_id, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, cleanCode, data.name.trim(), organizationId, status, now, now],
    });

    return {
      id,
      code: cleanCode,
      name: data.name.trim(),
      organizationId,
      status,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      status: 'ACTIVE' | 'INACTIVE';
    }>,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<InventoryLocation | null> {
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

    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const status = data.status !== undefined ? data.status : existing.status;
    const now = new Date().toISOString();

    await client.execute({
      sql: `UPDATE inventory_locations
            SET name = ?, status = ?, updated_at = ?
            WHERE id = ?`,
      args: [name, status, now, id],
    });

    return {
      ...existing,
      name,
      status,
      updatedAt: now,
    };
  },

  async findById(
    id: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<InventoryLocation | null> {
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

    let sql = 'SELECT * FROM inventory_locations WHERE id = ?';
    const args: string[] = [id];
    if (organizationId) {
      sql += ' AND organization_id = ?';
      args.push(organizationId);
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapLocationRow(result.rows[0]);
  },

  async findByCode(
    code: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<InventoryLocation | null> {
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

    let sql = 'SELECT * FROM inventory_locations WHERE code = ?';
    const args: string[] = [code.trim().toUpperCase()];
    if (organizationId) {
      sql += ' AND organization_id = ?';
      args.push(organizationId);
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapLocationRow(result.rows[0]);
  },

  async list(
    filter?: { organizationId?: string; status?: 'ACTIVE' | 'INACTIVE'; search?: string },
    client: Client = getDbClient()
  ): Promise<InventoryLocation[]> {
    let sql = 'SELECT * FROM inventory_locations WHERE 1=1';
    const args: (string | number)[] = [];

    if (filter?.organizationId) {
      sql += ' AND organization_id = ?';
      args.push(filter.organizationId);
    }
    if (filter?.status) {
      sql += ' AND status = ?';
      args.push(filter.status);
    }
    if (filter?.search) {
      sql += ' AND (name LIKE ? OR code LIKE ?)';
      const term = `%${filter.search}%`;
      args.push(term, term);
    }

    sql += ' ORDER BY name ASC';
    const result = await client.execute({ sql, args });
    return result.rows.map(mapLocationRow);
  },

  async count(
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<number> {
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

    let sql = 'SELECT COUNT(*) as count FROM inventory_locations';
    const args: string[] = [];
    if (organizationId) {
      sql += ' WHERE organization_id = ?';
      args.push(organizationId);
    }
    const result = await client.execute({ sql, args });
    return Number(result.rows[0]?.count ?? 0);
  },

  async findMatching(
    term: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<InventoryLocation[]> {
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

    let exactSql = `SELECT * FROM inventory_locations WHERE (LOWER(name) = LOWER(?) OR LOWER(code) = LOWER(?))`;
    const exactArgs: string[] = [clean, clean];
    if (organizationId) {
      exactSql += ` AND organization_id = ?`;
      exactArgs.push(organizationId);
    }

    const exact = await client.execute({ sql: exactSql, args: exactArgs });
    if (exact.rows.length > 0) return exact.rows.map(mapLocationRow);

    const pattern = `%${clean}%`;
    let partialSql = `SELECT * FROM inventory_locations WHERE (LOWER(name) LIKE LOWER(?) OR LOWER(code) LIKE LOWER(?))`;
    const partialArgs: string[] = [pattern, pattern];
    if (organizationId) {
      partialSql += ` AND organization_id = ?`;
      partialArgs.push(organizationId);
    }
    partialSql += ` ORDER BY name ASC`;

    const partial = await client.execute({ sql: partialSql, args: partialArgs });
    return partial.rows.map(mapLocationRow);
  },
};
