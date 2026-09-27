import type { Client } from '@libsql/client';
import type { Session } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapSessionRow(row: Record<string, unknown>): Session {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    tokenHash: String(row.token_hash),
    expiresAt: String(row.expires_at),
    createdAt: String(row.created_at),
    lastSeenAt: String(row.last_seen_at),
  };
}

export const sessionsRepository = {
  async create(
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: string;
    },
    client: Client = getDbClient()
  ): Promise<Session> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, data.userId, data.tokenHash, data.expiresAt, now, now],
    });

    return {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: now,
      lastSeenAt: now,
    };
  },

  async findByTokenHash(tokenHash: string, client: Client = getDbClient()): Promise<Session | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM sessions WHERE token_hash = ? LIMIT 1',
      args: [tokenHash],
    });
    if (result.rows.length === 0) return null;
    return mapSessionRow(result.rows[0]);
  },

  async touch(sessionId: string, client: Client = getDbClient()): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: 'UPDATE sessions SET last_seen_at = ? WHERE id = ?',
      args: [now, sessionId],
    });
  },

  async deleteByTokenHash(tokenHash: string, client: Client = getDbClient()): Promise<void> {
    await client.execute({
      sql: 'DELETE FROM sessions WHERE token_hash = ?',
      args: [tokenHash],
    });
  },

  async deleteByUserId(userId: string, client: Client = getDbClient()): Promise<void> {
    await client.execute({
      sql: 'DELETE FROM sessions WHERE user_id = ?',
      args: [userId],
    });
  },

  async deleteExpired(client: Client = getDbClient()): Promise<number> {
    const now = new Date().toISOString();
    const result = await client.execute({
      sql: 'DELETE FROM sessions WHERE expires_at <= ?',
      args: [now],
    });
    return result.rowsAffected;
  },
};
