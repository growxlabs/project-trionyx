import type { Client } from '@libsql/client';
import type { Warranty, WarrantyStatus, DerivedWarrantyStatus } from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

export function deriveWarrantyStatus(status: WarrantyStatus, endDateStr: string): DerivedWarrantyStatus {
  if (status === 'VOID') return 'VOID';
  const today = new Date().toISOString().split('T')[0];
  if (today > endDateStr) {
    return 'EXPIRED';
  }
  return 'ACTIVE';
}

function mapWarrantyRow(row: Record<string, unknown>): Warranty {
  const status = row.status as WarrantyStatus;
  const warrantyEndDate = String(row.warranty_end_date);
  return {
    id: String(row.id),
    serialRecordId: String(row.serial_record_id),
    serialNumber: String(row.serial_number || ''),
    productId: String(row.product_id),
    productName: row.product_name ? String(row.product_name) : null,
    productCode: row.product_code ? String(row.product_code) : null,
    dealerId: row.dealer_id ? String(row.dealer_id) : null,
    dealerName: row.dealer_name ? String(row.dealer_name) : null,
    installationDate: String(row.installation_date),
    warrantyStartDate: String(row.warranty_start_date),
    warrantyEndDate,
    status,
    derivedStatus: deriveWarrantyStatus(status, warrantyEndDate),
    activatedBy: String(row.activated_by),
    activatedByType: row.activated_by_type as 'INTERNAL' | 'DEALER',
    activatedByName: row.activated_by_name ? String(row.activated_by_name) : null,
    activatedAt: String(row.activated_at),
    voidedAt: row.voided_at ? String(row.voided_at) : null,
    voidedBy: row.voided_by ? String(row.voided_by) : null,
    voidReason: row.void_reason ? String(row.void_reason) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const warrantiesRepository = {
  async create(
    data: {
      serialRecordId: string;
      productId: string;
      dealerId?: string | null;
      installationDate: string;
      warrantyStartDate: string;
      warrantyEndDate: string;
      status?: WarrantyStatus;
      activatedBy: string;
      activatedByType: 'INTERNAL' | 'DEALER';
    },
    client: Client = getDbClient()
  ): Promise<Warranty> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const status = data.status || 'ACTIVE';

    await client.execute({
      sql: `INSERT INTO warranties (
        id, serial_record_id, product_id, dealer_id,
        installation_date, warranty_start_date, warranty_end_date,
        status, activated_by, activated_by_type,
        activated_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.serialRecordId,
        data.productId,
        data.dealerId || null,
        data.installationDate,
        data.warrantyStartDate,
        data.warrantyEndDate,
        status,
        data.activatedBy,
        data.activatedByType,
        now,
        now,
        now,
      ],
    });

    const created = await this.findById(id, client);
    if (!created) {
      throw new Error('Failed to retrieve newly created warranty');
    }
    return created;
  },

  async findById(id: string, client: Client = getDbClient()): Promise<Warranty | null> {
    const result = await client.execute({
      sql: `
        SELECT 
          w.*,
          s.serial_number,
          p.name as product_name,
          p.product_code as product_code,
          d.business_name as dealer_name,
          COALESCE(u.name, du.name) as activated_by_name
        FROM warranties w
        JOIN serial_numbers s ON w.serial_record_id = s.id
        JOIN products p ON w.product_id = p.id
        LEFT JOIN dealers d ON w.dealer_id = d.id
        LEFT JOIN users u ON w.activated_by = u.id AND w.activated_by_type = 'INTERNAL'
        LEFT JOIN dealer_users du ON w.activated_by = du.id AND w.activated_by_type = 'DEALER'
        WHERE w.id = ?
        LIMIT 1
      `,
      args: [id],
    });

    if (result.rows.length === 0) return null;
    return mapWarrantyRow(result.rows[0]);
  },

  async findBySerialRecordId(serialRecordId: string, client: Client = getDbClient()): Promise<Warranty | null> {
    const result = await client.execute({
      sql: `
        SELECT 
          w.*,
          s.serial_number,
          p.name as product_name,
          p.product_code as product_code,
          d.business_name as dealer_name,
          COALESCE(u.name, du.name) as activated_by_name
        FROM warranties w
        JOIN serial_numbers s ON w.serial_record_id = s.id
        JOIN products p ON w.product_id = p.id
        LEFT JOIN dealers d ON w.dealer_id = d.id
        LEFT JOIN users u ON w.activated_by = u.id AND w.activated_by_type = 'INTERNAL'
        LEFT JOIN dealer_users du ON w.activated_by = du.id AND w.activated_by_type = 'DEALER'
        WHERE w.serial_record_id = ?
        LIMIT 1
      `,
      args: [serialRecordId],
    });

    if (result.rows.length === 0) return null;
    return mapWarrantyRow(result.rows[0]);
  },

  async findBySerialNumber(serialNumber: string, client: Client = getDbClient()): Promise<Warranty | null> {
    const cleanSn = serialNumber.trim().toUpperCase();
    const result = await client.execute({
      sql: `
        SELECT 
          w.*,
          s.serial_number,
          p.name as product_name,
          p.product_code as product_code,
          d.business_name as dealer_name,
          COALESCE(u.name, du.name) as activated_by_name
        FROM warranties w
        JOIN serial_numbers s ON w.serial_record_id = s.id
        JOIN products p ON w.product_id = p.id
        LEFT JOIN dealers d ON w.dealer_id = d.id
        LEFT JOIN users u ON w.activated_by = u.id AND w.activated_by_type = 'INTERNAL'
        LEFT JOIN dealer_users du ON w.activated_by = du.id AND w.activated_by_type = 'DEALER'
        WHERE UPPER(s.serial_number) = ?
        LIMIT 1
      `,
      args: [cleanSn],
    });

    if (result.rows.length === 0) return null;
    return mapWarrantyRow(result.rows[0]);
  },

  async list(
    filter?: {
      dealerId?: string;
      productId?: string;
      status?: WarrantyStatus | 'EXPIRED';
      search?: string;
      page?: number;
      limit?: number;
    },
    client: Client = getDbClient()
  ): Promise<{ items: Warranty[]; total: number }> {
    let whereSql = 'WHERE 1=1';
    const args: (string | number)[] = [];
    const today = new Date().toISOString().split('T')[0];

    if (filter?.dealerId) {
      whereSql += ' AND w.dealer_id = ?';
      args.push(filter.dealerId);
    }

    if (filter?.productId) {
      whereSql += ' AND w.product_id = ?';
      args.push(filter.productId);
    }

    if (filter?.status) {
      if (filter.status === 'EXPIRED') {
        whereSql += ' AND w.status = ? AND w.warranty_end_date < ?';
        args.push('ACTIVE', today);
      } else if (filter.status === 'ACTIVE') {
        whereSql += ' AND w.status = ? AND w.warranty_end_date >= ?';
        args.push('ACTIVE', today);
      } else if (filter.status === 'VOID') {
        whereSql += ' AND w.status = ?';
        args.push('VOID');
      }
    }

    if (filter?.search) {
      const term = `%${filter.search.trim()}%`;
      whereSql += ' AND (s.serial_number LIKE ? OR p.name LIKE ? OR d.business_name LIKE ?)';
      args.push(term, term, term);
    }

    // Count
    const countResult = await client.execute({
      sql: `
        SELECT COUNT(*) as count 
        FROM warranties w
        JOIN serial_numbers s ON w.serial_record_id = s.id
        JOIN products p ON w.product_id = p.id
        LEFT JOIN dealers d ON w.dealer_id = d.id
        ${whereSql}
      `,
      args,
    });
    const total = Number(countResult.rows[0]?.count ?? 0);

    // Paginate
    const page = Math.max(1, filter?.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter?.limit ?? 25));
    const offset = (page - 1) * limit;

    const result = await client.execute({
      sql: `
        SELECT 
          w.*,
          s.serial_number,
          p.name as product_name,
          p.product_code as product_code,
          d.business_name as dealer_name,
          COALESCE(u.name, du.name) as activated_by_name
        FROM warranties w
        JOIN serial_numbers s ON w.serial_record_id = s.id
        JOIN products p ON w.product_id = p.id
        LEFT JOIN dealers d ON w.dealer_id = d.id
        LEFT JOIN users u ON w.activated_by = u.id AND w.activated_by_type = 'INTERNAL'
        LEFT JOIN dealer_users du ON w.activated_by = du.id AND w.activated_by_type = 'DEALER'
        ${whereSql}
        ORDER BY w.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limit, offset],
    });

    return {
      items: result.rows.map(mapWarrantyRow),
      total,
    };
  },

  async void(
    id: string,
    data: { voidedBy: string; voidReason: string },
    client: Client = getDbClient()
  ): Promise<Warranty | null> {
    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE warranties 
            SET status = 'VOID', voided_at = ?, voided_by = ?, void_reason = ?, updated_at = ?
            WHERE id = ?`,
      args: [now, data.voidedBy, data.voidReason, now, id],
    });

    return this.findById(id, client);
  },
};
