import type { Client, InValue } from '@libsql/client';
import type { Distributor, DistributorWithRelations, DistributorStatus } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapDistributorRow(row: Record<string, unknown>): Distributor {
  return {
    id: String(row.id),
    distributorCode: String(row.distributor_code),
    businessName: String(row.business_name),
    legalName: row.legal_name ? String(row.legal_name) : null,
    contactPerson: String(row.contact_person),
    phone: String(row.phone),
    alternatePhone: row.alternate_phone ? String(row.alternate_phone) : null,
    email: row.email ? String(row.email) : null,
    addressLine1: row.address_line1 ? String(row.address_line1) : null,
    addressLine2: row.address_line2 ? String(row.address_line2) : null,
    city: String(row.city),
    district: row.district ? String(row.district) : null,
    state: String(row.state),
    postalCode: row.postal_code ? String(row.postal_code) : null,
    country: String(row.country || 'India'),
    territory: row.territory ? String(row.territory) : null,
    status: row.status as DistributorStatus,
    gstin: row.gstin ? String(row.gstin) : null,
    notes: row.notes ? String(row.notes) : null,
    createdBy: String(row.created_by),
    updatedBy: String(row.updated_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function generateDistributorCode(client: Client = getDbClient()): Promise<string> {
  const result = await client.execute(`
    SELECT distributor_code FROM distributors
    WHERE distributor_code LIKE 'TRX-DST-%'
    ORDER BY distributor_code DESC LIMIT 1
  `);

  let nextSeq = 1;
  if (result.rows.length > 0 && result.rows[0].distributor_code) {
    const lastCode = String(result.rows[0].distributor_code);
    const numPart = lastCode.replace('TRX-DST-', '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, '0');
  return `TRX-DST-${padded}`;
}

export const distributorsRepository = {
  async create(
    data: {
      businessName: string;
      legalName?: string | null;
      contactPerson: string;
      phone: string;
      alternatePhone?: string | null;
      email?: string | null;
      addressLine1?: string | null;
      addressLine2?: string | null;
      city: string;
      district?: string | null;
      state: string;
      postalCode?: string | null;
      country?: string;
      territory?: string | null;
      status?: DistributorStatus;
      gstin?: string | null;
      notes?: string | null;
      createdBy: string;
    },
    client: Client = getDbClient()
  ): Promise<Distributor> {
    const id = randomUUID();
    const code = await generateDistributorCode(client);
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';
    const country = data.country || 'India';

    await client.execute({
      sql: `INSERT INTO distributors (
        id, distributor_code, business_name, legal_name, contact_person,
        phone, alternate_phone, email, address_line1, address_line2,
        city, district, state, postal_code, country, territory,
        status, gstin, notes, created_by, updated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        code,
        data.businessName.trim(),
        data.legalName?.trim() || null,
        data.contactPerson.trim(),
        data.phone.trim(),
        data.alternatePhone?.trim() || null,
        data.email?.trim() || null,
        data.addressLine1?.trim() || null,
        data.addressLine2?.trim() || null,
        data.city.trim(),
        data.district?.trim() || null,
        data.state.trim(),
        data.postalCode?.trim() || null,
        country,
        data.territory?.trim() || null,
        status,
        data.gstin?.trim() || null,
        data.notes?.trim() || null,
        data.createdBy,
        data.createdBy,
        now,
        now,
      ],
    });

    const created = await this.findById(id, client);
    if (!created) {
      throw new Error('Failed to retrieve distributor after creation');
    }
    return created;
  },

  async findById(id: string, client: Client = getDbClient()): Promise<DistributorWithRelations | null> {
    const result = await client.execute({
      sql: `SELECT d.*,
                   u1.name as creator_name,
                   u2.name as updater_name,
                   (SELECT COUNT(*) FROM dealers WHERE distributor_id = d.id) as dealer_count,
                   (SELECT COUNT(*) FROM dealers WHERE distributor_id = d.id AND status = 'ACTIVE') as active_dealer_count
            FROM distributors d
            LEFT JOIN users u1 ON d.created_by = u1.id
            LEFT JOIN users u2 ON d.updated_by = u2.id
            WHERE d.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const distributor = mapDistributorRow(row);

    return {
      ...distributor,
      dealerCount: Number(row.dealer_count || 0),
      activeDealerCount: Number(row.active_dealer_count || 0),
      creatorName: row.creator_name ? String(row.creator_name) : undefined,
      updaterName: row.updater_name ? String(row.updater_name) : undefined,
    };
  },

  async findByCode(code: string, client: Client = getDbClient()): Promise<DistributorWithRelations | null> {
    const result = await client.execute({
      sql: `SELECT d.*,
                   u1.name as creator_name,
                   u2.name as updater_name,
                   (SELECT COUNT(*) FROM dealers WHERE distributor_id = d.id) as dealer_count,
                   (SELECT COUNT(*) FROM dealers WHERE distributor_id = d.id AND status = 'ACTIVE') as active_dealer_count
            FROM distributors d
            LEFT JOIN users u1 ON d.created_by = u1.id
            LEFT JOIN users u2 ON d.updated_by = u2.id
            WHERE d.distributor_code = ?`,
      args: [code],
    });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const distributor = mapDistributorRow(row);

    return {
      ...distributor,
      dealerCount: Number(row.dealer_count || 0),
      activeDealerCount: Number(row.active_dealer_count || 0),
      creatorName: row.creator_name ? String(row.creator_name) : undefined,
      updaterName: row.updater_name ? String(row.updater_name) : undefined,
    };
  },

  async update(
    id: string,
    data: {
      businessName?: string;
      legalName?: string | null;
      contactPerson?: string;
      phone?: string;
      alternatePhone?: string | null;
      email?: string | null;
      addressLine1?: string | null;
      addressLine2?: string | null;
      city?: string;
      district?: string | null;
      state?: string;
      postalCode?: string | null;
      country?: string;
      territory?: string | null;
      gstin?: string | null;
      notes?: string | null;
      updatedBy: string;
    },
    client: Client = getDbClient()
  ): Promise<DistributorWithRelations> {
    const existing = await this.findById(id, client);
    if (!existing) {
      throw new Error(`Distributor ${id} not found`);
    }

    const updates: string[] = [];
    const args: InValue[] = [];

    if (data.businessName !== undefined) {
      updates.push('business_name = ?');
      args.push(data.businessName.trim());
    }
    if (data.legalName !== undefined) {
      updates.push('legal_name = ?');
      args.push(data.legalName?.trim() || null);
    }
    if (data.contactPerson !== undefined) {
      updates.push('contact_person = ?');
      args.push(data.contactPerson.trim());
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      args.push(data.phone.trim());
    }
    if (data.alternatePhone !== undefined) {
      updates.push('alternate_phone = ?');
      args.push(data.alternatePhone?.trim() || null);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      args.push(data.email?.trim() || null);
    }
    if (data.addressLine1 !== undefined) {
      updates.push('address_line1 = ?');
      args.push(data.addressLine1?.trim() || null);
    }
    if (data.addressLine2 !== undefined) {
      updates.push('address_line2 = ?');
      args.push(data.addressLine2?.trim() || null);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      args.push(data.city.trim());
    }
    if (data.district !== undefined) {
      updates.push('district = ?');
      args.push(data.district?.trim() || null);
    }
    if (data.state !== undefined) {
      updates.push('state = ?');
      args.push(data.state.trim());
    }
    if (data.postalCode !== undefined) {
      updates.push('postal_code = ?');
      args.push(data.postalCode?.trim() || null);
    }
    if (data.country !== undefined) {
      updates.push('country = ?');
      args.push(data.country.trim());
    }
    if (data.territory !== undefined) {
      updates.push('territory = ?');
      args.push(data.territory?.trim() || null);
    }
    if (data.gstin !== undefined) {
      updates.push('gstin = ?');
      args.push(data.gstin?.trim() || null);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      args.push(data.notes?.trim() || null);
    }

    updates.push('updated_by = ?');
    args.push(data.updatedBy);

    updates.push('updated_at = ?');
    args.push(new Date().toISOString());

    args.push(id);

    await client.execute({
      sql: `UPDATE distributors SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await this.findById(id, client);
    if (!updated) {
      throw new Error(`Failed to find distributor ${id} after update`);
    }
    return updated;
  },

  async updateStatus(
    id: string,
    status: DistributorStatus,
    updatedBy: string,
    client: Client = getDbClient()
  ): Promise<DistributorWithRelations> {
    const existing = await this.findById(id, client);
    if (!existing) {
      throw new Error(`Distributor ${id} not found`);
    }

    await client.execute({
      sql: `UPDATE distributors SET status = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      args: [status, updatedBy, new Date().toISOString(), id],
    });

    const updated = await this.findById(id, client);
    if (!updated) {
      throw new Error(`Distributor ${id} not found after status update`);
    }
    return updated;
  },

  async list(
    params: {
      search?: string;
      status?: DistributorStatus;
      state?: string;
      page?: number;
      limit?: number;
    } = {},
    client: Client = getDbClient()
  ): Promise<{ items: DistributorWithRelations[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const args: InValue[] = [];

    if (params.status) {
      whereClauses.push('d.status = ?');
      args.push(params.status);
    }

    if (params.state) {
      whereClauses.push('LOWER(d.state) = LOWER(?)');
      args.push(params.state.trim());
    }

    if (params.search) {
      const q = `%${params.search.trim().toLowerCase()}%`;
      whereClauses.push(`(
        LOWER(d.business_name) LIKE ? OR
        LOWER(COALESCE(d.legal_name, '')) LIKE ? OR
        LOWER(d.contact_person) LIKE ? OR
        d.distributor_code LIKE ? OR
        d.phone LIKE ? OR
        LOWER(COALESCE(d.email, '')) LIKE ? OR
        LOWER(d.city) LIKE ? OR
        LOWER(d.state) LIKE ?
      )`);
      args.push(q, q, q, q, q, q, q, q);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countResult = await client.execute({
      sql: `SELECT COUNT(*) as total FROM distributors d ${whereSql}`,
      args,
    });
    const total = Number(countResult.rows[0].total || 0);

    const queryArgs = [...args, limit, offset];
    const result = await client.execute({
      sql: `SELECT d.*,
                   u1.name as creator_name,
                   u2.name as updater_name,
                   (SELECT COUNT(*) FROM dealers WHERE distributor_id = d.id) as dealer_count,
                   (SELECT COUNT(*) FROM dealers WHERE distributor_id = d.id AND status = 'ACTIVE') as active_dealer_count
            FROM distributors d
            LEFT JOIN users u1 ON d.created_by = u1.id
            LEFT JOIN users u2 ON d.updated_by = u2.id
            ${whereSql}
            ORDER BY d.created_at DESC
            LIMIT ? OFFSET ?`,
      args: queryArgs,
    });

    const items: DistributorWithRelations[] = result.rows.map((row) => ({
      ...mapDistributorRow(row),
      dealerCount: Number(row.dealer_count || 0),
      activeDealerCount: Number(row.active_dealer_count || 0),
      creatorName: row.creator_name ? String(row.creator_name) : undefined,
      updaterName: row.updater_name ? String(row.updater_name) : undefined,
    }));

    return { items, total, page, limit };
  },

  async listAllActive(client: Client = getDbClient()): Promise<Array<{ id: string; distributorCode: string; businessName: string; city: string; state: string }>> {
    const result = await client.execute(`
      SELECT id, distributor_code, business_name, city, state
      FROM distributors
      WHERE status = 'ACTIVE'
      ORDER BY business_name ASC
    `);

    return result.rows.map((row) => ({
      id: String(row.id),
      distributorCode: String(row.distributor_code),
      businessName: String(row.business_name),
      city: String(row.city),
      state: String(row.state),
    }));
  },
};
