import type { Client, InValue } from '@libsql/client';
import type { DealerUser, DealerUserStatus } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapDealerUserRow(row: Record<string, unknown>): DealerUser {
  return {
    id: String(row.id),
    dealerId: String(row.dealer_id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: row.password_hash ? String(row.password_hash) : null,
    status: row.status as DealerUserStatus,
    invitationTokenHash: row.invitation_token_hash ? String(row.invitation_token_hash) : null,
    invitationExpiresAt: row.invitation_expires_at ? String(row.invitation_expires_at) : null,
    resetTokenHash: row.reset_token_hash ? String(row.reset_token_hash) : null,
    resetExpiresAt: row.reset_expires_at ? String(row.reset_expires_at) : null,
    failedLoginCount: Number(row.failed_login_count ?? 0),
    lockedUntil: row.locked_until ? String(row.locked_until) : null,
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
    createdBy: row.created_by ? String(row.created_by) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    dealerBusinessName: row.dealer_business_name ? String(row.dealer_business_name) : undefined,
    dealerCode: row.dealer_code ? String(row.dealer_code) : undefined,
  };
}

export const dealerUsersRepository = {
  async createInvited(
    data: {
      dealerId: string;
      name: string;
      email: string;
      invitationTokenHash: string;
      invitationExpiresAt: string;
      createdBy?: string | null;
    },
    client: Client = getDbClient()
  ): Promise<DealerUser> {
    const id = randomUUID();
    const cleanEmail = data.email.trim().toLowerCase();
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO dealer_users (
              id, dealer_id, name, email, status, invitation_token_hash, invitation_expires_at,
              failed_login_count, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'INVITED', ?, ?, 0, ?, ?, ?)`,
      args: [
        id,
        data.dealerId,
        data.name.trim(),
        cleanEmail,
        data.invitationTokenHash,
        data.invitationExpiresAt,
        data.createdBy || null,
        now,
        now,
      ],
    });

    const user = await this.findById(id, client);
    if (!user) throw new Error('Failed to retrieve created dealer user');
    return user;
  },

  async findById(id: string, client: Client = getDbClient()): Promise<DealerUser | null> {
    const result = await client.execute({
      sql: `SELECT u.*, d.business_name as dealer_business_name, d.dealer_code
            FROM dealer_users u
            JOIN dealers d ON u.dealer_id = d.id
            WHERE u.id = ? LIMIT 1`,
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapDealerUserRow(result.rows[0]);
  },

  async findByEmail(email: string, client: Client = getDbClient()): Promise<DealerUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const result = await client.execute({
      sql: `SELECT u.*, d.business_name as dealer_business_name, d.dealer_code
            FROM dealer_users u
            JOIN dealers d ON u.dealer_id = d.id
            WHERE LOWER(u.email) = ? LIMIT 1`,
      args: [cleanEmail],
    });
    if (result.rows.length === 0) return null;
    return mapDealerUserRow(result.rows[0]);
  },

  async findByInvitationTokenHash(tokenHash: string, client: Client = getDbClient()): Promise<DealerUser | null> {
    const result = await client.execute({
      sql: `SELECT u.*, d.business_name as dealer_business_name, d.dealer_code
            FROM dealer_users u
            JOIN dealers d ON u.dealer_id = d.id
            WHERE u.invitation_token_hash = ? LIMIT 1`,
      args: [tokenHash],
    });
    if (result.rows.length === 0) return null;
    return mapDealerUserRow(result.rows[0]);
  },

  async findByResetTokenHash(tokenHash: string, client: Client = getDbClient()): Promise<DealerUser | null> {
    const result = await client.execute({
      sql: `SELECT u.*, d.business_name as dealer_business_name, d.dealer_code
            FROM dealer_users u
            JOIN dealers d ON u.dealer_id = d.id
            WHERE u.reset_token_hash = ? LIMIT 1`,
      args: [tokenHash],
    });
    if (result.rows.length === 0) return null;
    return mapDealerUserRow(result.rows[0]);
  },

  async listByDealer(dealerId: string, client: Client = getDbClient()): Promise<DealerUser[]> {
    const result = await client.execute({
      sql: `SELECT u.*, d.business_name as dealer_business_name, d.dealer_code
            FROM dealer_users u
            JOIN dealers d ON u.dealer_id = d.id
            WHERE u.dealer_id = ?
            ORDER BY u.created_at ASC`,
      args: [dealerId],
    });
    return result.rows.map(mapDealerUserRow);
  },

  async activate(
    id: string,
    passwordHash: string,
    client: Client = getDbClient()
  ): Promise<DealerUser> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_users
            SET password_hash = ?,
                status = 'ACTIVE',
                invitation_token_hash = NULL,
                invitation_expires_at = NULL,
                updated_at = ?
            WHERE id = ?`,
      args: [passwordHash, now, id],
    });
    const updated = await this.findById(id, client);
    if (!updated) throw new Error('User not found after activation');
    return updated;
  },

  async updateStatus(
    id: string,
    status: DealerUserStatus,
    client: Client = getDbClient()
  ): Promise<DealerUser> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_users SET status = ?, updated_at = ? WHERE id = ?`,
      args: [status, now, id],
    });
    const updated = await this.findById(id, client);
    if (!updated) throw new Error('User not found');
    return updated;
  },

  async updatePassword(
    id: string,
    passwordHash: string,
    client: Client = getDbClient()
  ): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_users
            SET password_hash = ?,
                reset_token_hash = NULL,
                reset_expires_at = NULL,
                failed_login_count = 0,
                locked_until = NULL,
                updated_at = ?
            WHERE id = ?`,
      args: [passwordHash, now, id],
    });
  },

  async setResetToken(
    id: string,
    tokenHash: string,
    expiresAt: string,
    client: Client = getDbClient()
  ): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_users
            SET reset_token_hash = ?,
                reset_expires_at = ?,
                updated_at = ?
            WHERE id = ?`,
      args: [tokenHash, expiresAt, now, id],
    });
  },

  async setInvitationToken(
    id: string,
    tokenHash: string,
    expiresAt: string,
    client: Client = getDbClient()
  ): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_users
            SET invitation_token_hash = ?,
                invitation_expires_at = ?,
                status = 'INVITED',
                updated_at = ?
            WHERE id = ?`,
      args: [tokenHash, expiresAt, now, id],
    });
  },

  async incrementFailedLogin(
    id: string,
    maxAttempts: number = 5,
    lockoutDurationMs: number = 15 * 60 * 1000,
    client: Client = getDbClient()
  ): Promise<{ locked: boolean; lockedUntil?: string }> {
    const user = await this.findById(id, client);
    if (!user) return { locked: false };

    const newCount = user.failedLoginCount + 1;
    const now = new Date();
    let lockedUntil: string | null = null;
    let locked = false;

    if (newCount >= maxAttempts) {
      locked = true;
      lockedUntil = new Date(now.getTime() + lockoutDurationMs).toISOString();
    }

    await client.execute({
      sql: `UPDATE dealer_users
            SET failed_login_count = ?,
                locked_until = ?,
                updated_at = ?
            WHERE id = ?`,
      args: [newCount, lockedUntil, now.toISOString(), id],
    });

    return { locked, lockedUntil: lockedUntil || undefined };
  },

  async resetFailedLogin(id: string, client: Client = getDbClient()): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_users
            SET failed_login_count = 0,
                locked_until = NULL,
                updated_at = ?
            WHERE id = ?`,
      args: [now, id],
    });
  },

  async resetLockout(id: string, client: Client = getDbClient()): Promise<void> {
    return this.resetFailedLogin(id, client);
  },

  async touchLogin(id: string, client: Client = getDbClient()): Promise<void> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE dealer_users
            SET last_login_at = ?,
                failed_login_count = 0,
                locked_until = NULL,
                updated_at = ?
            WHERE id = ?`,
      args: [now, now, id],
    });
  },
};
