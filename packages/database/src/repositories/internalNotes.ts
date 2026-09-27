import type { Client } from '@libsql/client';
import type { InternalNote } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapInternalNoteRow(row: Record<string, unknown>): InternalNote {
  return {
    id: String(row.id),
    entityType: row.entity_type as 'DEALER' | 'DISTRIBUTOR',
    entityId: String(row.entity_id),
    body: String(row.body),
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
    authorName: row.author_name ? String(row.author_name) : undefined,
  };
}

export const internalNotesRepository = {
  async create(
    data: {
      entityType: 'DEALER' | 'DISTRIBUTOR';
      entityId: string;
      body: string;
      createdBy: string;
    },
    client: Client = getDbClient()
  ): Promise<InternalNote> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO internal_notes (
        id, entity_type, entity_id, body, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, data.entityType, data.entityId, data.body.trim(), data.createdBy, now],
    });

    const result = await client.execute({
      sql: `SELECT n.*, u.name as author_name
            FROM internal_notes n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE n.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      throw new Error('Failed to retrieve internal note after creation');
    }

    return mapInternalNoteRow(result.rows[0]);
  },

  async listForEntity(
    entityType: 'DEALER' | 'DISTRIBUTOR',
    entityId: string,
    client: Client = getDbClient()
  ): Promise<InternalNote[]> {
    const result = await client.execute({
      sql: `SELECT n.*, u.name as author_name
            FROM internal_notes n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE n.entity_type = ? AND n.entity_id = ?
            ORDER BY n.created_at DESC`,
      args: [entityType, entityId],
    });

    return result.rows.map(mapInternalNoteRow);
  },
};
