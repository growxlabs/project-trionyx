import type { Client } from '@libsql/client';
import type { Organization, OrganizationMembership, Role } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapOrgRow(row: Record<string, unknown>): Organization {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    status: row.status as Organization['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMembershipRow(row: Record<string, unknown>): OrganizationMembership {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    userId: String(row.user_id),
    role: row.role as Role,
    status: row.status as OrganizationMembership['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const organizationsRepository = {
  async list(client: Client = getDbClient()): Promise<Organization[]> {
    const result = await client.execute({
      sql: 'SELECT * FROM organizations WHERE status = ? ORDER BY name ASC',
      args: ['ACTIVE'],
    });
    return result.rows.map(mapOrgRow);
  },

  async findById(id: string, client: Client = getDbClient()): Promise<Organization | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM organizations WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapOrgRow(result.rows[0]);
  },

  async findBySlug(slug: string, client: Client = getDbClient()): Promise<Organization | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM organizations WHERE slug = ? LIMIT 1',
      args: [slug.toLowerCase().trim()],
    });
    if (result.rows.length === 0) return null;
    return mapOrgRow(result.rows[0]);
  },

  async getUserMemberships(
    userId: string,
    client: Client = getDbClient()
  ): Promise<Array<OrganizationMembership & { organization: Organization }>> {
    const result = await client.execute({
      sql: `SELECT m.*, o.slug as org_slug, o.name as org_name, o.status as org_status,
                   o.created_at as org_created_at, o.updated_at as org_updated_at
            FROM organization_memberships m
            INNER JOIN organizations o ON m.organization_id = o.id
            WHERE m.user_id = ? AND m.status = 'ACTIVE' AND o.status = 'ACTIVE'
            ORDER BY o.name ASC`,
      args: [userId],
    });

    return result.rows.map((row) => ({
      ...mapMembershipRow(row),
      organization: {
        id: String(row.organization_id),
        slug: String(row.org_slug),
        name: String(row.org_name),
        status: row.org_status as Organization['status'],
        createdAt: String(row.org_created_at),
        updatedAt: String(row.org_updated_at),
      },
    }));
  },

  async getUserMembership(
    userId: string,
    orgIdOrSlug: string,
    client: Client = getDbClient()
  ): Promise<(OrganizationMembership & { organization: Organization }) | null> {
    const result = await client.execute({
      sql: `SELECT m.*, o.slug as org_slug, o.name as org_name, o.status as org_status,
                   o.created_at as org_created_at, o.updated_at as org_updated_at
            FROM organization_memberships m
            INNER JOIN organizations o ON m.organization_id = o.id
            WHERE m.user_id = ? AND (o.id = ? OR o.slug = ?)
              AND m.status = 'ACTIVE' AND o.status = 'ACTIVE'
            LIMIT 1`,
      args: [userId, orgIdOrSlug, orgIdOrSlug.toLowerCase().trim()],
    });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...mapMembershipRow(row),
      organization: {
        id: String(row.organization_id),
        slug: String(row.org_slug),
        name: String(row.org_name),
        status: row.org_status as Organization['status'],
        createdAt: String(row.org_created_at),
        updatedAt: String(row.org_updated_at),
      },
    };
  },

  async addMembership(
    data: {
      organizationId: string;
      userId: string;
      role: Role;
      status?: OrganizationMembership['status'];
    },
    client: Client = getDbClient()
  ): Promise<OrganizationMembership> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';

    await client.execute({
      sql: `INSERT INTO organization_memberships (id, organization_id, user_id, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (organization_id, user_id) DO UPDATE SET
              role = excluded.role,
              status = excluded.status,
              updated_at = excluded.updated_at`,
      args: [id, data.organizationId, data.userId, data.role, status, now, now],
    });

    return {
      id,
      organizationId: data.organizationId,
      userId: data.userId,
      role: data.role,
      status,
      createdAt: now,
      updatedAt: now,
    };
  },

  async removeMembership(
    userId: string,
    organizationId: string,
    client: Client = getDbClient()
  ): Promise<void> {
    await client.execute({
      sql: 'DELETE FROM organization_memberships WHERE user_id = ? AND organization_id = ?',
      args: [userId, organizationId],
    });
  },

  async listMembershipsForUser(
    userId: string,
    client: Client = getDbClient()
  ): Promise<Array<OrganizationMembership & { organization: Organization }>> {
    return this.getUserMemberships(userId, client);
  },
};
