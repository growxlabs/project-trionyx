import type { Client } from '@libsql/client';
import type { DealerSession } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapDealerSessionRow(row: Record<string, unknown>): DealerSession {
  return {
    id: String(row.id),
    dealerUserId: String(row.dealer_user_id),
    tokenHash: String(row.token_hash),
    expiresAt: String(row.expires_at),
    createdAt: String(row.created_at),
    lastSeenAt: String(row.last_seen_at),
  };
}

export const dealerSessionsRepository = {
  async create(
    data: {
      dealerUserId: string;
      tokenHash: string;
      expiresAt: string;
    },
    client: Client = getDbClient()
  ): Promise<DealerSession> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO dealer_sessions (id, dealer_user_id, token_hash, expires_at, created_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, data.dealerUserId, data.tokenHash, data.expiresAt, now, now],
    });

    return {
      id,
      dealerUserId: data.dealerUserId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: now,
      lastSeenAt: now,
    };
  },

  async findByTokenHash(tokenHash: string, client: Client = getDbClient()): Promise<DealerSession | null> {
    const result = await client.execute({
      sql: `SELECT * FROM dealer_sessions WHERE token_hash = ? LIMIT 1`,
      args: [tokenHash],
    });
    if (result.rows.length === 0) return null;
    return mapDealerSessionRow(result.rows[0]);
  },

  async deleteByTokenHash(tokenHash: string, client: Client = getDbClient()): Promise<void> {
    await client.execute({
      sql: `DELETE FROM dealer_sessions WHERE token_hash = ?`,
      args: [tokenHash],
    });
  },

  async deleteByUserId(dealerUserId: string, client: Client = getDbClient()): Promise<void> {
    await client.execute({
      sql: `DELETE FROM dealer_sessions WHERE dealer_user_id = ?`,
      args: [dealerUserId],
    });
  },

  async touch(id: string, client: Client = getDbClient()): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_sessions SET last_seen_at = ? WHERE id = ?`,
      args: [now, id],
    });
  },
};
