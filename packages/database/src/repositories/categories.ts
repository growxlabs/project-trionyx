import type { Client } from '@libsql/client';
import type { ProductCategory } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapCategoryRow(row: Record<string, unknown>): ProductCategory {
  return {
    id: String(row.id),
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

    await client.execute({
      sql: `INSERT INTO product_categories (id, name, slug, description, status, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.name, data.slug, data.description || null, status, sortOrder, now, now],
    });

    return {
      id,
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
    client: Client = getDbClient()
  ): Promise<ProductCategory | null> {
    const existing = await this.findById(id, client);
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
      name,
      slug,
      description,
      status,
      sortOrder,
      createdAt: existing.createdAt,
      updatedAt: now,
    };
  },

  async findById(id: string, client: Client = getDbClient()): Promise<ProductCategory | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM product_categories WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapCategoryRow(result.rows[0]);
  },

  async findBySlug(slug: string, client: Client = getDbClient()): Promise<ProductCategory | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM product_categories WHERE slug = ? LIMIT 1',
      args: [slug],
    });
    if (result.rows.length === 0) return null;
    return mapCategoryRow(result.rows[0]);
  },

  async list(
    filter?: { status?: 'ACTIVE' | 'INACTIVE'; search?: string },
    client: Client = getDbClient()
  ): Promise<ProductCategory[]> {
    let sql = 'SELECT * FROM product_categories WHERE 1=1';
    const args: (string | number)[] = [];

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

  async listAllActive(client: Client = getDbClient()): Promise<ProductCategory[]> {
    return this.list({ status: 'ACTIVE' }, client);
  },

  async count(client: Client = getDbClient()): Promise<number> {
    const result = await client.execute('SELECT COUNT(*) as count FROM product_categories');
    return Number(result.rows[0]?.count ?? 0);
  },
};
