import type { Client } from '@libsql/client';
import { randomUUID } from 'node:crypto';
import { getDbClient } from '../db';
import { isoTimestamp } from './warrantyReads';

export interface StoredTrixMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  resultPayload: string | null;
  activity: string | null;
  createdAt: string;
}

export interface StoredTrixConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: StoredTrixMessage[];
}

export const trixConversationsRepository = {
  async ensureConversation(
    id: string,
    userId: string,
    initialTitle: string,
    client: Client = getDbClient()
  ): Promise<StoredTrixConversation> {
    const now = new Date().toISOString();
    const title = initialTitle.trim().slice(0, 80) || 'New Conversation';
    await client.execute({
      sql: `INSERT INTO trix_conversations (id, user_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at`,
      args: [id, userId, title, now, now],
    });
    return {
      id,
      userId,
      title,
      createdAt: now,
      updatedAt: now,
    };
  },

  async listConversations(
    userId: string,
    limit = 50,
    client: Client = getDbClient()
  ): Promise<(StoredTrixConversation & { messageCount: number })[]> {
    const rows = await client.execute({
      sql: `SELECT c.id, c.user_id, c.title, c.created_at, c.updated_at,
                   COUNT(m.id) as message_count
            FROM trix_conversations c
            LEFT JOIN trix_messages m ON m.conversation_id = c.id
            WHERE c.user_id = ?
            GROUP BY c.id, c.user_id, c.title, c.created_at, c.updated_at
            ORDER BY c.updated_at DESC
            LIMIT ?`,
      args: [userId, limit],
    });

    return rows.rows.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      title: String(row.title),
      createdAt: isoTimestamp(row.created_at),
      updatedAt: isoTimestamp(row.updated_at),
      messageCount: Number(row.message_count || 0),
    }));
  },

  async getConversation(
    id: string,
    userId: string,
    client: Client = getDbClient()
  ): Promise<StoredTrixConversation | null> {
    const convRows = await client.execute({
      sql: `SELECT id, user_id, title, created_at, updated_at
            FROM trix_conversations
            WHERE id = ? AND user_id = ?`,
      args: [id, userId],
    });

    const conv = convRows.rows[0];
    if (!conv) return null;

    const msgRows = await client.execute({
      sql: `SELECT id, conversation_id, role, content, result_payload, activity, created_at
            FROM trix_messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC`,
      args: [id],
    });

    return {
      id: String(conv.id),
      userId: String(conv.user_id),
      title: String(conv.title),
      createdAt: isoTimestamp(conv.created_at),
      updatedAt: isoTimestamp(conv.updated_at),
      messages: msgRows.rows.map((r) => ({
        id: String(r.id),
        conversationId: String(r.conversation_id),
        role: String(r.role) as 'user' | 'assistant',
        content: String(r.content),
        resultPayload: r.result_payload ? String(r.result_payload) : null,
        activity: r.activity ? String(r.activity) : null,
        createdAt: isoTimestamp(r.created_at),
      })),
    };
  },

  async saveMessage(
    message: {
      id?: string;
      conversationId: string;
      role: 'user' | 'assistant';
      content: string;
      resultPayload?: string | null;
      activity?: string | null;
      createdAt?: string;
    },
    client: Client = getDbClient()
  ): Promise<StoredTrixMessage> {
    const id = message.id ?? randomUUID();
    const now = message.createdAt ?? new Date().toISOString();
    const resultPayload = message.resultPayload ?? null;
    const activity = message.activity ?? null;

    await client.execute({
      sql: `INSERT INTO trix_messages (id, conversation_id, role, content, result_payload, activity, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, message.conversationId, message.role, message.content, resultPayload, activity, now],
    });

    await client.execute({
      sql: `UPDATE trix_conversations SET updated_at = ? WHERE id = ?`,
      args: [now, message.conversationId],
    });

    return {
      id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      resultPayload,
      activity,
      createdAt: now,
    };
  },

  async deleteConversation(
    id: string,
    userId: string,
    client: Client = getDbClient()
  ): Promise<boolean> {
    const res = await client.execute({
      sql: `DELETE FROM trix_conversations WHERE id = ? AND user_id = ?`,
      args: [id, userId],
    });
    return (res.rowsAffected ?? 0) > 0;
  },
};
