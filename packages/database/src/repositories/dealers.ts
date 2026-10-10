import type { Client, InValue } from '@libsql/client';
import type { Dealer, DealerWithRelations, DealerStatus, DealerDistributorHistory } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapDealerRow(row: Record<string, unknown>): Dealer {
  return {
    id: String(row.id),
    dealerCode: String(row.dealer_code),
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
    organizationId: row.organization_id ? String(row.organization_id) : null,
    distributorId: row.distributor_id ? String(row.distributor_id) : null,
    status: row.status as DealerStatus,
    gstin: row.gstin ? String(row.gstin) : null,
    notes: row.notes ? String(row.notes) : null,
    createdBy: String(row.created_by),
    updatedBy: String(row.updated_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function generateDealerCode(client: Client = getDbClient()): Promise<string> {
  const result = await client.execute(`
    SELECT dealer_code FROM dealers
    WHERE dealer_code LIKE 'TRX-DLR-%'
    ORDER BY dealer_code DESC LIMIT 1
  `);

  let nextSeq = 1;
  if (result.rows.length > 0 && result.rows[0].dealer_code) {
    const lastCode = String(result.rows[0].dealer_code);
    const numPart = lastCode.replace('TRX-DLR-', '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, '0');
  return `TRX-DLR-${padded}`;
}

export const dealersRepository = {
  async checkDuplicates(
    params: {
      phone: string;
      email?: string | null;
      gstin?: string | null;
      excludeId?: string;
      organizationId?: string;
    },
    client: Client = getDbClient()
  ): Promise<{ duplicateField: string; existingDealerName: string } | null> {
    const checks: Array<{ field: string; val: string; column: string }> = [];

    if (params.phone) {
      checks.push({ field: 'Phone number', val: params.phone.trim(), column: 'phone' });
    }
    if (params.email && params.email.trim().length > 0) {
      checks.push({ field: 'Email address', val: params.email.trim().toLowerCase(), column: 'LOWER(email)' });
    }
    if (params.gstin && params.gstin.trim().length > 0) {
      checks.push({ field: 'GSTIN', val: params.gstin.trim().toUpperCase(), column: 'UPPER(gstin)' });
    }

    for (const check of checks) {
      let query = `SELECT business_name FROM dealers WHERE ${check.column} = ?`;
      const args: InValue[] = [check.val];

      if (params.excludeId) {
        query += ' AND id != ?';
        args.push(params.excludeId);
      }
      if (params.organizationId) {
        query += ' AND organization_id = ?';
        args.push(params.organizationId);
      }

      const res = await client.execute({ sql: query, args });
      if (res.rows.length > 0) {
        return {
          duplicateField: check.field,
          existingDealerName: String(res.rows[0].business_name),
        };
      }
    }

    return null;
  },

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
      distributorId?: string | null;
      organizationId?: string | null;
      status?: DealerStatus;
      gstin?: string | null;
      notes?: string | null;
      createdBy: string;
    },
    client: Client = getDbClient()
  ): Promise<Dealer> {
    const id = randomUUID();
    const code = await generateDealerCode(client);
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';
    const country = data.country || 'India';
    const distributorId = data.distributorId?.trim() || null;
    const organizationId = data.organizationId || 'org-trionyx';

    await client.execute({
      sql: `INSERT INTO dealers (
        id, dealer_code, business_name, legal_name, contact_person,
        phone, alternate_phone, email, address_line1, address_line2,
        city, district, state, postal_code, country, distributor_id, organization_id,
        status, gstin, notes, created_by, updated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        distributorId,
        organizationId,
        status,
        data.gstin?.trim() || null,
        data.notes?.trim() || null,
        data.createdBy,
        data.createdBy,
        now,
        now,
      ],
    });

    // If an initial distributor is assigned, record initial assignment in history
    if (distributorId) {
      await client.execute({
        sql: `INSERT INTO dealer_distributor_history (
          id, dealer_id, previous_distributor_id, new_distributor_id, reason, changed_by, changed_at
        ) VALUES (?, ?, NULL, ?, 'Initial distributor assignment upon dealer creation', ?, ?)`,
        args: [randomUUID(), id, distributorId, data.createdBy, now],
      });
    }

    const created = await this.findById(id, undefined, client);
    if (!created) {
      throw new Error('Failed to retrieve dealer after creation');
    }
    return created;
  },

  async findById(
    id: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<DealerWithRelations | null> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    let sql = `SELECT dl.*,
                   dst.distributor_code as dst_code,
                   dst.business_name as dst_name,
                   dst.contact_person as dst_contact_person,
                   dst.phone as dst_phone,
                   dst.city as dst_city,
                   dst.state as dst_state,
                   u1.name as creator_name,
                   u2.name as updater_name
            FROM dealers dl
            LEFT JOIN distributors dst ON dl.distributor_id = dst.id
            LEFT JOIN users u1 ON dl.created_by = u1.id
            LEFT JOIN users u2 ON dl.updated_by = u2.id
            WHERE dl.id = ?`;
    const args: string[] = [id];
    if (organizationId) {
      sql += ' AND dl.organization_id = ?';
      args.push(organizationId);
    }

    const result = await client.execute({ sql, args });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const dealer = mapDealerRow(row);

    return {
      ...dealer,
      distributor: row.distributor_id && row.dst_code
        ? {
            id: String(row.distributor_id),
            distributorCode: String(row.dst_code),
            businessName: String(row.dst_name),
            contactPerson: String(row.dst_contact_person),
            phone: String(row.dst_phone),
            city: String(row.dst_city),
            state: String(row.dst_state),
          }
        : null,
      creatorName: row.creator_name ? String(row.creator_name) : undefined,
      updaterName: row.updater_name ? String(row.updater_name) : undefined,
    };
  },

  async findByCode(
    code: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<DealerWithRelations | null> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    let sql = `SELECT dl.*,
                   dst.distributor_code as dst_code,
                   dst.business_name as dst_name,
                   dst.contact_person as dst_contact_person,
                   dst.phone as dst_phone,
                   dst.city as dst_city,
                   dst.state as dst_state,
                   u1.name as creator_name,
                   u2.name as updater_name
            FROM dealers dl
            LEFT JOIN distributors dst ON dl.distributor_id = dst.id
            LEFT JOIN users u1 ON dl.created_by = u1.id
            LEFT JOIN users u2 ON dl.updated_by = u2.id
            WHERE dl.dealer_code = ?`;
    const args: string[] = [code];
    if (organizationId) {
      sql += ' AND dl.organization_id = ?';
      args.push(organizationId);
    }

    const result = await client.execute({ sql, args });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const dealer = mapDealerRow(row);

    return {
      ...dealer,
      distributor: row.distributor_id && row.dst_code
        ? {
            id: String(row.distributor_id),
            distributorCode: String(row.dst_code),
            businessName: String(row.dst_name),
            contactPerson: String(row.dst_contact_person),
            phone: String(row.dst_phone),
            city: String(row.dst_city),
            state: String(row.dst_state),
          }
        : null,
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
      gstin?: string | null;
      notes?: string | null;
      updatedBy: string;
    },
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<DealerWithRelations> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    const existing = await this.findById(id, client, organizationId);
    if (!existing) {
      throw new Error(`Dealer ${id} not found`);
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
      sql: `UPDATE dealers SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    const updated = await this.findById(id, client, organizationId);
    if (!updated) {
      throw new Error(`Failed to find dealer ${id} after update`);
    }
    return updated;
  },

  async updateStatus(
    id: string,
    status: DealerStatus,
    updatedBy: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<DealerWithRelations> {
    const client = (clientOrOrgId && typeof clientOrOrgId === 'object' && 'execute' in clientOrOrgId)
      ? clientOrOrgId
      : (maybeOrgOrClient && typeof maybeOrgOrClient === 'object' && 'execute' in maybeOrgOrClient)
        ? maybeOrgOrClient
        : getDbClient();
    const organizationId = typeof clientOrOrgId === 'string'
      ? clientOrOrgId
      : typeof maybeOrgOrClient === 'string'
        ? maybeOrgOrClient
        : undefined;

    const existing = await this.findById(id, client, organizationId);
    if (!existing) {
      throw new Error(`Dealer ${id} not found`);
    }

    await client.execute({
      sql: `UPDATE dealers SET status = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      args: [status, updatedBy, new Date().toISOString(), id],
    });

    const updated = await this.findById(id, client, organizationId);
    if (!updated) {
      throw new Error(`Dealer ${id} not found after status update`);
    }
    return updated;
  },

  async reassignDistributor(
    dealerId: string,
    newDistributorId: string | null,
    reason: string,
    actorId: string,
    client: Client = getDbClient()
  ): Promise<{ dealer: DealerWithRelations; history: DealerDistributorHistory }> {
    const dealer = await this.findById(dealerId, client);
    if (!dealer) {
      throw new Error(`Dealer ${dealerId} not found`);
    }

    const prevDistributorId = dealer.distributorId;
    if (prevDistributorId === newDistributorId) {
      throw new Error('Dealer is already assigned to this distributor');
    }

    // Verify new distributor exists if not null
    if (newDistributorId) {
      const dstCheck = await client.execute({
        sql: 'SELECT id FROM distributors WHERE id = ?',
        args: [newDistributorId],
      });
      if (dstCheck.rows.length === 0) {
        throw new Error(`Distributor ${newDistributorId} not found`);
      }
    }

    const historyId = randomUUID();
    const now = new Date().toISOString();

    await client.batch(
      [
        {
          sql: `UPDATE dealers SET distributor_id = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
          args: [newDistributorId || null, actorId, now, dealerId],
        },
        {
          sql: `INSERT INTO dealer_distributor_history (
            id, dealer_id, previous_distributor_id, new_distributor_id, reason, changed_by, changed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [historyId, dealerId, prevDistributorId || null, newDistributorId || null, reason.trim(), actorId, now],
        },
      ],
      'write'
    );

    const updatedDealer = await this.findById(dealerId, client);
    if (!updatedDealer) {
      throw new Error('Failed to find dealer after reassignment');
    }

    const historyList = await this.getDistributorHistory(dealerId, client);
    const historyItem = historyList.find((h) => h.id === historyId) || {
      id: historyId,
      dealerId,
      previousDistributorId: prevDistributorId,
      newDistributorId,
      reason,
      changedBy: actorId,
      changedAt: now,
    };

    return { dealer: updatedDealer, history: historyItem };
  },

  async getDistributorHistory(dealerId: string, client: Client = getDbClient()): Promise<DealerDistributorHistory[]> {
    const result = await client.execute({
      sql: `SELECT h.*,
                   d_prev.business_name as prev_distributor_name,
                   d_new.business_name as new_distributor_name,
                   u.name as changed_by_name
            FROM dealer_distributor_history h
            LEFT JOIN distributors d_prev ON h.previous_distributor_id = d_prev.id
            LEFT JOIN distributors d_new ON h.new_distributor_id = d_new.id
            LEFT JOIN users u ON h.changed_by = u.id
            WHERE h.dealer_id = ?
            ORDER BY h.changed_at DESC`,
      args: [dealerId],
    });

    return result.rows.map((row) => ({
      id: String(row.id),
      dealerId: String(row.dealer_id),
      previousDistributorId: row.previous_distributor_id ? String(row.previous_distributor_id) : null,
      newDistributorId: row.new_distributor_id ? String(row.new_distributor_id) : null,
      reason: row.reason ? String(row.reason) : null,
      changedBy: String(row.changed_by),
      changedAt: String(row.changed_at),
      previousDistributorName: row.prev_distributor_name ? String(row.prev_distributor_name) : null,
      newDistributorName: row.new_distributor_name ? String(row.new_distributor_name) : null,
      changedByName: row.changed_by_name ? String(row.changed_by_name) : null,
    }));
  },

  async list(
    params: {
      organizationId?: string;
      search?: string;
      status?: DealerStatus;
      state?: string;
      city?: string;
      id?: string;
      code?: string;
      exactName?: string;
      hasDistributor?: boolean;
      distributorId?: string | null;
      unassignedOnly?: boolean;
      page?: number;
      limit?: number;
    } = {},
    client: Client = getDbClient()
  ): Promise<{ items: DealerWithRelations[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const args: InValue[] = [];

    if (params.organizationId) {
      whereClauses.push('dl.organization_id = ?');
      args.push(params.organizationId);
    }

    for (const [column, value] of [['id', params.id], ['dealer_code', params.code], ['city', params.city], ['business_name', params.exactName]] as const) {
      if (value !== undefined) {
        whereClauses.push(`LOWER(dl.${column}) = LOWER(?)`);
        args.push(value.trim());
      }
    }
    if (params.hasDistributor !== undefined) {
      whereClauses.push(`dl.distributor_id IS ${params.hasDistributor ? 'NOT ' : ''}NULL`);
    }

    if (params.status) {
      whereClauses.push('dl.status = ?');
      args.push(params.status);
    }

    if (params.state) {
      whereClauses.push('LOWER(dl.state) = LOWER(?)');
      args.push(params.state.trim());
    }

    if (params.unassignedOnly) {
      whereClauses.push('dl.distributor_id IS NULL');
    } else if (params.distributorId !== undefined) {
      whereClauses.push('dl.distributor_id = ?');
      args.push(params.distributorId);
    }

    if (params.search) {
      const q = `%${params.search.trim().toLowerCase()}%`;
      whereClauses.push(`(
        LOWER(dl.business_name) LIKE ? OR
        LOWER(COALESCE(dl.legal_name, '')) LIKE ? OR
        LOWER(dl.contact_person) LIKE ? OR
        dl.dealer_code LIKE ? OR
        dl.phone LIKE ? OR
        LOWER(COALESCE(dl.email, '')) LIKE ? OR
        LOWER(dl.city) LIKE ? OR
        LOWER(dl.state) LIKE ? OR
        LOWER(COALESCE(dst.business_name, '')) LIKE ?
      )`);
      args.push(q, q, q, q, q, q, q, q, q);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countResult = await client.execute({
      sql: `SELECT COUNT(*) as total
            FROM dealers dl
            LEFT JOIN distributors dst ON dl.distributor_id = dst.id
            ${whereSql}`,
      args,
    });
    const total = Number(countResult.rows[0].total || 0);

    const queryArgs = [...args, limit, offset];
    const result = await client.execute({
      sql: `SELECT dl.*,
                   dst.distributor_code as dst_code,
                   dst.business_name as dst_name,
                   dst.contact_person as dst_contact_person,
                   dst.phone as dst_phone,
                   dst.city as dst_city,
                   dst.state as dst_state,
                   u1.name as creator_name,
                   u2.name as updater_name
            FROM dealers dl
            LEFT JOIN distributors dst ON dl.distributor_id = dst.id
            LEFT JOIN users u1 ON dl.created_by = u1.id
            LEFT JOIN users u2 ON dl.updated_by = u2.id
            ${whereSql}
            ORDER BY dl.created_at DESC, dl.id ASC
            LIMIT ? OFFSET ?`,
      args: queryArgs,
    });

    const items: DealerWithRelations[] = result.rows.map((row) => ({
      ...mapDealerRow(row),
      distributor: row.distributor_id && row.dst_code
        ? {
            id: String(row.distributor_id),
            distributorCode: String(row.dst_code),
            businessName: String(row.dst_name),
            contactPerson: String(row.dst_contact_person),
            phone: String(row.dst_phone),
            city: String(row.dst_city),
            state: String(row.dst_state),
          }
        : null,
      creatorName: row.creator_name ? String(row.creator_name) : undefined,
      updaterName: row.updater_name ? String(row.updater_name) : undefined,
    }));

    return { items, total, page, limit };
  },

  async countActive(distributorId?: string | null, organizationId?: string, client: Client = getDbClient()): Promise<number> {
    const whereClauses: string[] = ["status = 'ACTIVE'"];
    const args: string[] = [];

    if (organizationId) {
      whereClauses.push('organization_id = ?');
      args.push(organizationId);
    }

    if (distributorId) {
      whereClauses.push('distributor_id = ?');
      args.push(distributorId);
    }

    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM dealers WHERE ${whereClauses.join(' AND ')}`,
      args,
    });
    return Number(res.rows[0].count || 0);
  },
};
