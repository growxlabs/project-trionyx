import type { Client } from '@libsql/client';
import type { User, Role, UserStatus } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  last_login_at: string | null;
  failed_login_count: number;
  locked_until: string | null;
  distributor_id?: string | null;
  created_at: string;
  updated_at: string;
}

function mapUserRow(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    role: row.role as Role,
    status: row.status as UserStatus,
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
    failedLoginCount: Number(row.failed_login_count || 0),
    lockedUntil: row.locked_until ? String(row.locked_until) : null,
    distributorId: row.distributor_id ? String(row.distributor_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const usersRepository = {
  async findByEmail(email: string, client: Client = getDbClient()): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
      args: [normalized],
    });
    if (result.rows.length === 0) return null;
    return mapUserRow(result.rows[0]);
  },

  async findById(id: string, client: Client = getDbClient()): Promise<User | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapUserRow(result.rows[0]);
  },

  async create(
    data: {
      name: string;
      email: string;
      passwordHash: string;
      role: Role;
      status?: UserStatus;
      distributorId?: string | null;
    },
    client: Client = getDbClient()
  ): Promise<User> {
    const id = randomUUID();
    const normalized = data.email.trim().toLowerCase();
    const status = data.status || 'ACTIVE';
    const now = new Date().toISOString();
    const distributorId = data.distributorId || null;

    await client.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, status, distributor_id, failed_login_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      args: [id, data.name.trim(), normalized, data.passwordHash, data.role, status, distributorId, now, now],
    });

    const created = await this.findById(id, client);
    if (!created) {
      throw new Error('Failed to retrieve user after creation');
    }
    return created;
  },

  async updateLoginAttempt(
    userId: string,
    failedCount: number,
    lockedUntil: string | null,
    client: Client = getDbClient()
  ): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE users 
            SET failed_login_count = ?, locked_until = ?, updated_at = ?
            WHERE id = ?`,
      args: [failedCount, lockedUntil, now, userId],
    });
  },

  async recordSuccessfulLogin(userId: string, client: Client = getDbClient()): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE users 
            SET failed_login_count = 0, locked_until = NULL, last_login_at = ?, updated_at = ?
            WHERE id = ?`,
      args: [now, now, userId],
    });
  },

  async updateStatus(userId: string, status: UserStatus, client: Client = getDbClient()): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: 'UPDATE users SET status = ?, updated_at = ? WHERE id = ?',
      args: [status, now, userId],
    });
  },

  async listInternalUsers(client: Client = getDbClient()): Promise<User[]> {
    const result = await client.execute({
      sql: `SELECT * FROM users 
            WHERE role IN ('MANAGING_DIRECTOR', 'ADMIN', 'STAFF') AND status = 'ACTIVE'
            ORDER BY name ASC`,
      args: [],
    });
    return result.rows.map(mapUserRow);
  },
};

