import type { Client } from '@libsql/client';
import type { DealerRequestMessage } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapDealerRequestMessageRow(row: Record<string, unknown>): DealerRequestMessage {
  return {
    id: String(row.id),
    requestId: String(row.request_id),
    senderType: row.sender_type as 'DEALER' | 'INTERNAL',
    senderId: String(row.sender_id),
    senderName: String(row.sender_name),
    body: String(row.body),
    createdAt: String(row.created_at),
  };
}

export const dealerRequestMessagesRepository = {
  async create(
    data: {
      requestId: string;
      senderType: 'DEALER' | 'INTERNAL';
      senderId: string;
      senderName: string;
      body: string;
    },
    client: Client = getDbClient()
  ): Promise<DealerRequestMessage> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO dealer_request_messages (id, request_id, sender_type, sender_id, sender_name, body, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.requestId, data.senderType, data.senderId, data.senderName, data.body.trim(), now],
    });

    return {
      id,
      requestId: data.requestId,
      senderType: data.senderType,
      senderId: data.senderId,
      senderName: data.senderName,
      body: data.body.trim(),
      createdAt: now,
    };
  },

  async listByRequest(requestId: string, client: Client = getDbClient()): Promise<DealerRequestMessage[]> {
    const result = await client.execute({
      sql: `SELECT * FROM dealer_request_messages
            WHERE request_id = ?
            ORDER BY created_at ASC`,
      args: [requestId],
    });
    return result.rows.map(mapDealerRequestMessageRow);
  },
};
