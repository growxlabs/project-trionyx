import type { Client } from '@libsql/client';
import type { ContactEnquiry, ContactEnquiryStatus, ContactEnquiryType } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';
import { enquiryWhere, type EnquiryFilter } from './enquiryReads';

function mapRow(row: Record<string, unknown>): ContactEnquiry {
  return {
    id: String(row.id),
    enquiryCode: String(row.enquiry_code),
    organizationId: row.organization_id ? String(row.organization_id) : null,
    type: row.type as ContactEnquiryType,
    fullName: String(row.full_name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    companyName: row.company_name ? String(row.company_name) : null,
    businessAddress: row.business_address ? String(row.business_address) : null,
    businessType: row.business_type ? String(row.business_type) : null,
    city: String(row.city || ''),
    state: String(row.state || ''),
    pincode: String(row.pincode || ''),
    territory: row.territory ? String(row.territory) : null,
    productId: row.product_id ? String(row.product_id) : null,
    productName: row.product_name ? String(row.product_name) : null,
    purchaseDealerDetails: row.purchase_dealer_details ? String(row.purchase_dealer_details) : null,
    message: String(row.message || ''),
    status: row.status as ContactEnquiryStatus,
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    assignedUserName: row.assigned_user_name ? String(row.assigned_user_name) : null,
    createdAt: (row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at))).toISOString(),
    updatedAt: (row.updated_at instanceof Date ? row.updated_at : new Date(String(row.updated_at))).toISOString(),
  };
}

export const contactEnquiriesRepository = {
  async create(
    data: {
      type: ContactEnquiryType;
      fullName: string;
      phone: string;
      email: string;
      companyName?: string | null;
      businessAddress?: string | null;
      businessType?: string | null;
      city: string;
      state: string;
      pincode: string;
      territory?: string | null;
      productId?: string | null;
      purchaseDealerDetails?: string | null;
      message: string;
      organizationId?: string | null;
    },
    client: Client = getDbClient()
  ): Promise<ContactEnquiry> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const organizationId = data.organizationId || 'org-trionyx';

    // Generate enquiry code: TRX-ENQ-XXXXXX
    const countResult = await client.execute('SELECT COUNT(*) as count FROM contact_enquiries');
    const count = Number(countResult.rows[0]?.count ?? 0);
    const enquiryCode = `TRX-ENQ-${String(count + 1).padStart(6, '0')}`;

    await client.execute({
      sql: `INSERT INTO contact_enquiries (
              id, enquiry_code, type, full_name, phone, email,
              company_name, business_address, business_type, city, state, pincode, territory,
              product_id, purchase_dealer_details, message, organization_id,
              status, assigned_to, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', NULL, ?, ?)`,
      args: [
        id,
        enquiryCode,
        data.type,
        data.fullName,
        data.phone,
        data.email,
        data.companyName || null,
        data.businessAddress || null,
        data.businessType || null,
        data.city || '',
        data.state || '',
        data.pincode || '',
        data.territory || null,
        data.productId || null,
        data.purchaseDealerDetails || null,
        data.message || '',
        organizationId,
        now,
        now,
      ],
    });

    return {
      id,
      enquiryCode,
      organizationId,
      type: data.type,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      companyName: data.companyName || null,
      businessAddress: data.businessAddress || null,
      businessType: data.businessType || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      territory: data.territory || null,
      productId: data.productId || null,
      productName: null,
      purchaseDealerDetails: data.purchaseDealerDetails || null,
      message: data.message,
      status: 'NEW',
      assignedTo: null,
      assignedUserName: null,
      createdAt: now,
      updatedAt: now,
    };
  },

  async findById(
    id: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ContactEnquiry | null> {
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

    let sql = `SELECT ce.*, u.name as assigned_user_name, p.name as product_name
            FROM contact_enquiries ce
            LEFT JOIN users u ON ce.assigned_to = u.id
            LEFT JOIN products p ON ce.product_id = p.id
            WHERE ce.id = ?`;
    const args: string[] = [id];
    if (organizationId) {
      sql += ' AND ce.organization_id = ?';
      args.push(organizationId);
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapRow(result.rows[0]);
  },

  async findByCode(
    code: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ContactEnquiry | null> {
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

    let sql = `SELECT ce.*, u.name as assigned_user_name, p.name as product_name
            FROM contact_enquiries ce
            LEFT JOIN users u ON ce.assigned_to = u.id
            LEFT JOIN products p ON ce.product_id = p.id
            WHERE ce.enquiry_code = ?`;
    const args: string[] = [code];
    if (organizationId) {
      sql += ' AND ce.organization_id = ?';
      args.push(organizationId);
    }
    sql += ' LIMIT 1';

    const result = await client.execute({ sql, args });
    if (result.rows.length === 0) return null;
    return mapRow(result.rows[0]);
  },

  async updateStatus(
    id: string,
    status: ContactEnquiryStatus,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ContactEnquiry | null> {
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

    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE contact_enquiries SET status = ?, updated_at = ? WHERE id = ?`,
      args: [status, now, id],
    });
    return this.findById(id, client, organizationId);
  },

  async assign(
    id: string,
    assignedTo: string | null,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ContactEnquiry | null> {
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

    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE contact_enquiries SET assigned_to = ?, updated_at = ? WHERE id = ?`,
      args: [assignedTo || null, now, id],
    });
    return this.findById(id, client, organizationId);
  },

  async findDuplicates(
    phone: string,
    email: string,
    excludeId?: string,
    clientOrOrgId?: Client | string,
    maybeOrgOrClient?: string | Client
  ): Promise<ContactEnquiry[]> {
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
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    let sql = `SELECT ce.*, u.name as assigned_user_name
               FROM contact_enquiries ce
               LEFT JOIN users u ON ce.assigned_to = u.id
               WHERE (ce.phone = ? OR LOWER(ce.email) = ?)`;
    const args: (string | number)[] = [cleanPhone, cleanEmail];

    if (excludeId) {
      sql += ' AND ce.id != ?';
      args.push(excludeId);
    }
    if (organizationId) {
      sql += ' AND ce.organization_id = ?';
      args.push(organizationId);
    }

    sql += ' ORDER BY ce.created_at DESC LIMIT 10';

    const result = await client.execute({ sql, args });
    return result.rows.map(mapRow);
  },

  async list(
    filter?: EnquiryFilter,
    client: Client = getDbClient()
  ): Promise<{ items: ContactEnquiry[]; total: number }> {
    const { whereSql, args } = enquiryWhere(filter);

    // Count
    const countResult = await client.execute({
      sql: `SELECT COUNT(*) as count FROM contact_enquiries ce ${whereSql}`,
      args,
    });
    const total = Number(countResult.rows[0]?.count ?? 0);

    // Paginate
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 25;
    const offset = (page - 1) * limit;

    const result = await client.execute({
      sql: `SELECT ce.*, u.name as assigned_user_name, p.name as product_name
            FROM contact_enquiries ce
            LEFT JOIN users u ON ce.assigned_to = u.id
            LEFT JOIN products p ON ce.product_id = p.id
            ${whereSql}
            ORDER BY ce.created_at DESC, ce.id
            LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return {
      items: result.rows.map(mapRow),
      total,
    };
  },
};
