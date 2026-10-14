import type { Client } from '@libsql/client';
import type { WarrantyPolicy } from '@trionyx/types';
import { getDbClient } from '../db';

function isUuidString(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function mapWarrantyPolicyRow(row: Record<string, unknown>): WarrantyPolicy {
  const id = String(row.id);
  return {
    id,
    policyCode: id,
    productId: String(row.product_id),
    durationMonths: Number(row.duration_months),
    status: row.status as WarrantyPolicy['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function generatePolicyId(
  productId: string,
  client: Client = getDbClient()
): Promise<string> {
  let prefix = 'TRX-POL-';
  try {
    const prodRes = await client.execute({
      sql: `SELECT product_code, organization_id, business_code FROM products WHERE id = ? LIMIT 1`,
      args: [productId],
    });
    if (prodRes.rows.length > 0) {
      const prod = prodRes.rows[0];
      const prodCode = String(prod.product_code || '');
      const orgId = String(prod.organization_id || '');
      const bizCode = String(prod.business_code || '');
      if (prodCode.startsWith('LAK-') || orgId === 'org-lakshmi' || bizCode === 'LAKSHMI') {
        prefix = 'LAK-POL-';
      }
    }
  } catch (err) {
    console.error('[generatePolicyId] Error resolving product details:', err);
  }

  const result = await client.execute({
    sql: `SELECT id FROM warranty_policies
          WHERE id LIKE ?
          ORDER BY id DESC LIMIT 1`,
    args: [`${prefix}%`],
  });

  let nextSeq = 1;
  if (result.rows.length > 0 && result.rows[0]?.id) {
    const lastId = String(result.rows[0].id);
    const numPart = lastId.replace(prefix, '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, '0');
  return `${prefix}${padded}`;
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

    const row = { ...result.rows[0] };
    const rawId = String(row.id);
    if (isUuidString(rawId)) {
      const cleanId = await generatePolicyId(productId, client);
      try {
        await client.execute({
          sql: `UPDATE warranty_policies SET id = ? WHERE id = ?`,
          args: [cleanId, rawId],
        });
        row.id = cleanId;
      } catch (err) {
        console.error('[warrantyPoliciesRepository] Auto-migration of policy UUID failed:', err);
        row.id = cleanId;
      }
    }

    return mapWarrantyPolicyRow(row);
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
      let targetId = existing.id;
      if (isUuidString(targetId)) {
        targetId = await generatePolicyId(data.productId, client);
      }

      await client.execute({
        sql: `UPDATE warranty_policies 
              SET id = ?, duration_months = ?, status = ?, updated_at = ?
              WHERE id = ?`,
        args: [targetId, data.durationMonths, status, now, existing.id],
      });

      return {
        ...existing,
        id: targetId,
        policyCode: targetId,
        durationMonths: data.durationMonths,
        status,
        updatedAt: now,
      };
    }

    const id = await generatePolicyId(data.productId, client);
    await client.execute({
      sql: `INSERT INTO warranty_policies (id, product_id, duration_months, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, data.productId, data.durationMonths, status, now, now],
    });

    return {
      id,
      policyCode: id,
      productId: data.productId,
      durationMonths: data.durationMonths,
      status,
      createdAt: now,
      updatedAt: now,
    };
  },
};

