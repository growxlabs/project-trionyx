import type { Client } from '@libsql/client';
import type { ContactEnquiry, ContactEnquiryStatus, ContactEnquiryType } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapRow(row: Record<string, unknown>): ContactEnquiry {
  return {
    id: String(row.id),
    enquiryCode: String(row.enquiry_code),
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
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
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
    },
    client: Client = getDbClient()
  ): Promise<ContactEnquiry> {
    const id = randomUUID();
    const now = new Date().toISOString();

    // Generate enquiry code: TRX-ENQ-XXXXXX
    const countResult = await client.execute('SELECT COUNT(*) as count FROM contact_enquiries');
    const count = Number(countResult.rows[0]?.count ?? 0);
    const enquiryCode = `TRX-ENQ-${String(count + 1).padStart(6, '0')}`;

    await client.execute({
      sql: `INSERT INTO contact_enquiries (
              id, enquiry_code, type, full_name, phone, email,
              company_name, business_address, business_type, city, state, pincode, territory,
              product_id, purchase_dealer_details, message,
              status, assigned_to, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', NULL, ?, ?)`,
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
        data.city,
        data.state,
        data.pincode,
        data.territory || null,
        data.productId || null,
        data.purchaseDealerDetails || null,
        data.message,
        now,
        now,
      ],
    });

    return {
      id,
      enquiryCode,
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

  async findById(id: string, client: Client = getDbClient()): Promise<ContactEnquiry | null> {
    const result = await client.execute({
      sql: `SELECT ce.*, u.name as assigned_user_name, p.name as product_name
            FROM contact_enquiries ce
            LEFT JOIN users u ON ce.assigned_to = u.id
            LEFT JOIN products p ON ce.product_id = p.id
            WHERE ce.id = ? LIMIT 1`,
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapRow(result.rows[0]);
  },

  async findByCode(code: string, client: Client = getDbClient()): Promise<ContactEnquiry | null> {
    const result = await client.execute({
      sql: `SELECT ce.*, u.name as assigned_user_name, p.name as product_name
            FROM contact_enquiries ce
            LEFT JOIN users u ON ce.assigned_to = u.id
            LEFT JOIN products p ON ce.product_id = p.id
            WHERE ce.enquiry_code = ? LIMIT 1`,
      args: [code],
    });
    if (result.rows.length === 0) return null;
    return mapRow(result.rows[0]);
  },

  async updateStatus(
    id: string,
    status: ContactEnquiryStatus,
    client: Client = getDbClient()
  ): Promise<ContactEnquiry | null> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE contact_enquiries SET status = ?, updated_at = ? WHERE id = ?`,
      args: [status, now, id],
    });
    return this.findById(id, client);
  },

  async assign(
    id: string,
    assignedTo: string | null,
    client: Client = getDbClient()
  ): Promise<ContactEnquiry | null> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE contact_enquiries SET assigned_to = ?, updated_at = ? WHERE id = ?`,
      args: [assignedTo || null, now, id],
    });
    return this.findById(id, client);
  },

  async findDuplicates(
    phone: string,
    email: string,
    excludeId?: string,
    client: Client = getDbClient()
  ): Promise<ContactEnquiry[]> {
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

    sql += ' ORDER BY ce.created_at DESC LIMIT 10';

    const result = await client.execute({ sql, args });
    return result.rows.map(mapRow);
  },

  async list(
    filter?: {
      type?: ContactEnquiryType | 'ALL';
      status?: ContactEnquiryStatus | 'ALL';
      state?: string;
      assignedTo?: string; // 'UNASSIGNED', 'ALL', or user UUID
      search?: string;
      page?: number;
      limit?: number;
    },
    client: Client = getDbClient()
  ): Promise<{ items: ContactEnquiry[]; total: number }> {
    let whereSql = 'WHERE 1=1';
    const args: (string | number)[] = [];

    if (filter?.type && filter.type !== 'ALL') {
      whereSql += ' AND ce.type = ?';
      args.push(filter.type);
    }
    if (filter?.status && filter.status !== 'ALL') {
      whereSql += ' AND ce.status = ?';
      args.push(filter.status);
    }
    if (filter?.state && filter.state !== 'ALL') {
      whereSql += ' AND LOWER(ce.state) = LOWER(?)';
      args.push(filter.state);
    }
    if (filter?.assignedTo && filter.assignedTo !== 'ALL') {
      if (filter.assignedTo === 'UNASSIGNED') {
        whereSql += ' AND ce.assigned_to IS NULL';
      } else {
        whereSql += ' AND ce.assigned_to = ?';
        args.push(filter.assignedTo);
      }
    }
    if (filter?.search) {
      const term = `%${filter.search.trim()}%`;
      whereSql += ` AND (
        ce.enquiry_code LIKE ? OR
        ce.full_name LIKE ? OR
        ce.company_name LIKE ? OR
        ce.business_address LIKE ? OR
        ce.phone LIKE ? OR
        ce.email LIKE ? OR
        ce.city LIKE ?
      )`;
      args.push(term, term, term, term, term, term, term);
    }

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
            ORDER BY ce.created_at DESC
            LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return {
      items: result.rows.map(mapRow),
      total,
    };
  },
};
