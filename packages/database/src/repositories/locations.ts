import type { Client } from '@libsql/client';
import type { InventoryLocation } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapLocationRow(row: Record<string, unknown>): InventoryLocation {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
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
      status?: 'ACTIVE' | 'INACTIVE';
    },
    client: Client = getDbClient()
  ): Promise<InventoryLocation> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';
    const cleanCode = data.code.trim().toUpperCase();

    // Check code uniqueness
    const existing = await this.findByCode(cleanCode, client);
    if (existing) {
      throw new Error(`Location code "${cleanCode}" is already in use.`);
    }

    await client.execute({
      sql: `INSERT INTO inventory_locations (id, code, name, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, cleanCode, data.name.trim(), status, now, now],
    });

    return {
      id,
      code: cleanCode,
      name: data.name.trim(),
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
    client: Client = getDbClient()
  ): Promise<InventoryLocation | null> {
    const existing = await this.findById(id, client);
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

  async findById(id: string, client: Client = getDbClient()): Promise<InventoryLocation | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM inventory_locations WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapLocationRow(result.rows[0]);
  },

  async findByCode(code: string, client: Client = getDbClient()): Promise<InventoryLocation | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM inventory_locations WHERE code = ? LIMIT 1',
      args: [code.trim().toUpperCase()],
    });
    if (result.rows.length === 0) return null;
    return mapLocationRow(result.rows[0]);
  },

  async list(
    filter?: { status?: 'ACTIVE' | 'INACTIVE'; search?: string },
    client: Client = getDbClient()
  ): Promise<InventoryLocation[]> {
    let sql = 'SELECT * FROM inventory_locations WHERE 1=1';
    const args: (string | number)[] = [];

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

  async count(client: Client = getDbClient()): Promise<number> {
    const result = await client.execute('SELECT COUNT(*) as count FROM inventory_locations');
    return Number(result.rows[0]?.count ?? 0);
  },

  async findMatching(term: string, client: Client = getDbClient()): Promise<InventoryLocation[]> {
    const clean = term.trim();
    if (!clean) return [];
    const exact = await client.execute({
      sql: `SELECT * FROM inventory_locations WHERE LOWER(name) = LOWER(?) OR LOWER(code) = LOWER(?)`,
      args: [clean, clean],
    });
    if (exact.rows.length > 0) return exact.rows.map(mapLocationRow);

    const pattern = `%${clean}%`;
    const partial = await client.execute({
      sql: `SELECT * FROM inventory_locations WHERE (LOWER(name) LIKE LOWER(?) OR LOWER(code) LIKE LOWER(?)) ORDER BY name ASC`,
      args: [pattern, pattern],
    });
    return partial.rows.map(mapLocationRow);
  },
};
