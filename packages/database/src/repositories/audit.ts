import type { Client } from '@libsql/client';
import type { AuditLog, AuditEvent } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapAuditLogRow(row: Record<string, unknown>): AuditLog {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    event: row.event as AuditEvent,
    ipAddress: row.ip_address ? String(row.ip_address) : null,
    userAgent: row.user_agent ? String(row.user_agent) : null,
    metadata: row.metadata ? String(row.metadata) : null,
    createdAt: String(row.created_at),
  };
}

export const auditLogsRepository = {
  async recordEvent(
    data: {
      userId?: string | null;
      event: AuditEvent;
      ipAddress?: string | null;
      userAgent?: string | null;
      metadata?: Record<string, unknown> | string | null;
    },
    client: Client = getDbClient()
  ): Promise<AuditLog> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const metaStr =
      typeof data.metadata === 'object' && data.metadata !== null
        ? JSON.stringify(data.metadata)
        : (data.metadata as string | null) || null;

    await client.execute({
      sql: `INSERT INTO audit_logs (id, user_id, event, ip_address, user_agent, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.userId || null, data.event, data.ipAddress || null, data.userAgent || null, metaStr, now],
    });

    return {
      id,
      userId: data.userId || null,
      event: data.event,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      metadata: metaStr,
      createdAt: now,
    };
  },

  async list(
    filter?: {
      userId?: string;
      event?: AuditEvent;
      limit?: number;
    },
    client: Client = getDbClient()
  ): Promise<AuditLog[]> {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const args: (string | number)[] = [];

    if (filter?.userId) {
      sql += ' AND user_id = ?';
      args.push(filter.userId);
    }
    if (filter?.event) {
      sql += ' AND event = ?';
      args.push(filter.event);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    args.push(filter?.limit || 50);

    const result = await client.execute({ sql, args });
    return result.rows.map(mapAuditLogRow);
  },
};
