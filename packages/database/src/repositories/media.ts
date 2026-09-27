import type { Client } from '@libsql/client';
import type { ProductMedia, MediaType } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapMediaRow(row: Record<string, unknown>): ProductMedia {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    type: row.type as MediaType,
    storagePath: String(row.storage_path),
    fileName: String(row.file_name),
    fileSize: Number(row.file_size ?? 0),
    mimeType: String(row.mime_type),
    altText: row.alt_text ? String(row.alt_text) : null,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at),
  };
}

export const mediaRepository = {
  async create(
    data: {
      productId: string;
      type: MediaType;
      storagePath: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      altText?: string | null;
      sortOrder?: number;
    },
    client: Client = getDbClient()
  ): Promise<ProductMedia> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const sortOrder = data.sortOrder ?? 0;

    await client.execute({
      sql: `INSERT INTO product_media (
              id, product_id, type, storage_path, file_name, file_size, mime_type, alt_text, sort_order, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.productId,
        data.type,
        data.storagePath,
        data.fileName,
        data.fileSize,
        data.mimeType,
        data.altText || null,
        sortOrder,
        now,
      ],
    });

    return {
      id,
      productId: data.productId,
      type: data.type,
      storagePath: data.storagePath,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      altText: data.altText || null,
      sortOrder,
      createdAt: now,
    };
  },

  async delete(id: string, client: Client = getDbClient()): Promise<boolean> {
    const result = await client.execute({
      sql: 'DELETE FROM product_media WHERE id = ?',
      args: [id],
    });
    return (result.rowsAffected ?? 0) > 0;
  },

  async listByProduct(productId: string, client: Client = getDbClient()): Promise<ProductMedia[]> {
    const result = await client.execute({
      sql: 'SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order ASC, created_at ASC',
      args: [productId],
    });
    return result.rows.map(mapMediaRow);
  },
};
