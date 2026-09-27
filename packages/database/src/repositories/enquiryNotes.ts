import type { Client } from '@libsql/client';
import type { EnquiryNote } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapNoteRow(row: Record<string, unknown>): EnquiryNote {
  return {
    id: String(row.id),
    enquiryId: String(row.enquiry_id),
    body: String(row.body),
    createdBy: String(row.created_by),
    authorName: row.author_name ? String(row.author_name) : null,
    createdAt: String(row.created_at),
  };
}

export const enquiryNotesRepository = {
  async create(
    data: {
      enquiryId: string;
      body: string;
      createdBy: string;
    },
    client: Client = getDbClient()
  ): Promise<EnquiryNote> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO enquiry_notes (id, enquiry_id, body, created_by, created_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, data.enquiryId, data.body.trim(), data.createdBy, now],
    });

    const result = await client.execute({
      sql: `SELECT n.*, u.name as author_name
            FROM enquiry_notes n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE n.id = ? LIMIT 1`,
      args: [id],
    });

    if (result.rows.length === 0) {
      throw new Error('Failed to retrieve enquiry note after creation');
    }

    return mapNoteRow(result.rows[0]);
  },

  async listForEnquiry(
    enquiryId: string,
    client: Client = getDbClient()
  ): Promise<EnquiryNote[]> {
    const result = await client.execute({
      sql: `SELECT n.*, u.name as author_name
            FROM enquiry_notes n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE n.enquiry_id = ?
            ORDER BY n.created_at DESC`,
      args: [enquiryId],
    });

    return result.rows.map(mapNoteRow);
  },
};
