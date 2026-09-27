import type { Client } from '@libsql/client';
import type { ProductSpecification } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapSpecRow(row: Record<string, unknown>): ProductSpecification {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    label: String(row.label ?? row.name ?? ''),
    value: String(row.value),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export const specificationsRepository = {
  async replaceForProduct(
    productId: string,
    specs: Array<{ label: string; value: string; sortOrder?: number }>,
    client: Client = getDbClient()
  ): Promise<ProductSpecification[]> {
    // Delete existing specs
    await client.execute({
      sql: 'DELETE FROM product_specifications WHERE product_id = ?',
      args: [productId],
    });

    if (specs.length === 0) return [];

    const created: ProductSpecification[] = [];
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      const id = randomUUID();
      const sortOrder = s.sortOrder !== undefined ? s.sortOrder : i;

      await client.execute({
        sql: `INSERT INTO product_specifications (id, product_id, group_name, name, label, value, sort_order)
              VALUES (?, ?, 'General', ?, ?, ?, ?)`,
        args: [id, productId, s.label.trim(), s.label.trim(), s.value.trim(), sortOrder],
      });

      created.push({
        id,
        productId,
        label: s.label.trim(),
        value: s.value.trim(),
        sortOrder,
      });
    }

    return created;
  },

  async listByProduct(productId: string, client: Client = getDbClient()): Promise<ProductSpecification[]> {
    const result = await client.execute({
      sql: 'SELECT id, product_id, COALESCE(label, name, \'\') as label, value, sort_order FROM product_specifications WHERE product_id = ? ORDER BY sort_order ASC, label ASC',
      args: [productId],
    });
    return result.rows.map(mapSpecRow);
  },
};
