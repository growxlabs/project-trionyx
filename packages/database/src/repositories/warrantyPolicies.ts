import type { Client } from '@libsql/client';
import type { WarrantyPolicy } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapWarrantyPolicyRow(row: Record<string, unknown>): WarrantyPolicy {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    durationMonths: Number(row.duration_months),
    status: row.status as WarrantyPolicy['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const warrantyPoliciesRepository = {
  async findByProductId(
    productId: string,
    client: Client = getDbClient()
  ): Promise<WarrantyPolicy | null> {
    const result = await client.execute({
      sql: `SELECT * FROM warranty_policies WHERE product_id = ? LIMIT 1`,
      args: [productId],
    });

    if (result.rows.length === 0) return null;
    return mapWarrantyPolicyRow(result.rows[0]);
  },

  async upsert(
    data: {
      productId: string;
      durationMonths: number;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    client: Client = getDbClient()
  ): Promise<WarrantyPolicy> {
    const existing = await this.findByProductId(data.productId, client);
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';

    if (existing) {
      await client.execute({
        sql: `UPDATE warranty_policies 
              SET duration_months = ?, status = ?, updated_at = ?
              WHERE id = ?`,
        args: [data.durationMonths, status, now, existing.id],
      });

      return {
        ...existing,
        durationMonths: data.durationMonths,
        status,
        updatedAt: now,
      };
    }

    const id = randomUUID();
    await client.execute({
      sql: `INSERT INTO warranty_policies (id, product_id, duration_months, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, data.productId, data.durationMonths, status, now, now],
    });

    return {
      id,
      productId: data.productId,
      durationMonths: data.durationMonths,
      status,
      createdAt: now,
      updatedAt: now,
    };
  },
};
