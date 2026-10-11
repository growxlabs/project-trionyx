import type { Client } from '@libsql/client';
import type { SerialMovementWithDetails, SerialMovementType } from '@trionyx/types';
import { getDbClient } from '../db';

export const serialMovementsRepository = {
  async listWithDetails(
    filter?: {
      organizationId?: string;
      productId?: string;
      serialRecordId?: string;
      type?: SerialMovementType;
      locationId?: string;
      fromDate?: string;
      toDate?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
    client: Client = getDbClient()
  ): Promise<SerialMovementWithDetails[]> {
    let sql = `
      SELECT
        m.*,
        s.serial_number as serial_number,
        p.name as product_name,
        p.product_code as product_code,
        from_l.name as from_location_name,
        from_l.code as from_location_code,
        to_l.name as to_location_name,
        to_l.code as to_location_code,
        u.name as actor_name
      FROM serial_movements m
      JOIN serial_numbers s ON m.serial_record_id = s.id
      JOIN products p ON m.product_id = p.id
      LEFT JOIN inventory_locations from_l ON m.from_location_id = from_l.id
      LEFT JOIN inventory_locations to_l ON m.to_location_id = to_l.id
      LEFT JOIN users u ON m.created_by = u.id
      WHERE 1=1
    `;
    const args: (string | number)[] = [];

    if (filter?.organizationId) {
      sql += " AND (p.organization_id = ? OR (p.organization_id IS NULL AND ? = 'org-trionyx'))";
      args.push(filter.organizationId, filter.organizationId);
    }
    if (filter?.productId) {
      sql += ' AND m.product_id = ?';
      args.push(filter.productId);
    }
    if (filter?.serialRecordId) {
      sql += ' AND m.serial_record_id = ?';
      args.push(filter.serialRecordId);
    }
    if (filter?.type) {
      sql += ' AND m.type = ?';
      args.push(filter.type);
    }
    if (filter?.locationId) {
      sql += ' AND (m.from_location_id = ? OR m.to_location_id = ?)';
      args.push(filter.locationId, filter.locationId);
    }
    if (filter?.fromDate) {
      sql += ' AND m.created_at >= ?';
      args.push(filter.fromDate);
    }
    if (filter?.toDate) {
      sql += ' AND m.created_at <= ?';
      args.push(filter.toDate);
    }
    if (filter?.search) {
      sql += ` AND (
        s.serial_number LIKE ? OR
        p.name LIKE ? OR
        p.product_code LIKE ? OR
        m.reference LIKE ? OR
        m.reason LIKE ?
      )`;
      const term = `%${filter.search}%`;
      args.push(term, term, term, term, term);
    }

    sql += ' ORDER BY m.created_at DESC';

    if (filter?.limit) {
      sql += ' LIMIT ?';
      args.push(filter.limit);
      if (filter.offset) {
        sql += ' OFFSET ?';
        args.push(filter.offset);
      }
    }

    const result = await client.execute({ sql, args });

    return result.rows.map((row) => ({
      id: String(row.id),
      serialRecordId: String(row.serial_record_id),
      productId: String(row.product_id),
      type: row.type as SerialMovementType,
      fromLocationId: row.from_location_id ? String(row.from_location_id) : null,
      toLocationId: row.to_location_id ? String(row.to_location_id) : null,
      reference: row.reference ? String(row.reference) : null,
      reason: row.reason ? String(row.reason) : null,
      createdBy: String(row.created_by),
      createdAt: String(row.created_at),
      serialNumber: String(row.serial_number),
      productName: String(row.product_name),
      productCode: String(row.product_code),
      fromLocationName: row.from_location_name ? String(row.from_location_name) : undefined,
      fromLocationCode: row.from_location_code ? String(row.from_location_code) : undefined,
      toLocationName: row.to_location_name ? String(row.to_location_name) : undefined,
      toLocationCode: row.to_location_code ? String(row.to_location_code) : undefined,
      actorName: row.actor_name ? String(row.actor_name) : 'Operator',
    }));
  },

  async listWithDetailsAndCount(
    filter?: {
      productId?: string;
      serialRecordId?: string;
      type?: SerialMovementType;
      locationId?: string;
      fromDate?: string;
      toDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    client: Client = getDbClient()
  ): Promise<{ items: SerialMovementWithDetails[]; total: number }> {
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const offset = (page - 1) * limit;

    let countSql = `
      SELECT COUNT(*) as count
      FROM serial_movements m
      JOIN serial_numbers s ON m.serial_record_id = s.id
      JOIN products p ON m.product_id = p.id
      LEFT JOIN inventory_locations from_l ON m.from_location_id = from_l.id
      LEFT JOIN inventory_locations to_l ON m.to_location_id = to_l.id
      WHERE 1=1
    `;
    const countArgs: (string | number)[] = [];

    if (filter?.productId) {
      countSql += ' AND m.product_id = ?';
      countArgs.push(filter.productId);
    }
    if (filter?.serialRecordId) {
      countSql += ' AND m.serial_record_id = ?';
      countArgs.push(filter.serialRecordId);
    }
    if (filter?.type) {
      countSql += ' AND m.type = ?';
      countArgs.push(filter.type);
    }
    if (filter?.locationId) {
      countSql += ' AND (m.from_location_id = ? OR m.to_location_id = ?)';
      countArgs.push(filter.locationId, filter.locationId);
    }
    if (filter?.fromDate) {
      countSql += ' AND m.created_at >= ?';
      countArgs.push(filter.fromDate);
    }
    if (filter?.toDate) {
      countSql += ' AND m.created_at <= ?';
      countArgs.push(filter.toDate);
    }
    if (filter?.search) {
      countSql += ` AND (
        s.serial_number LIKE ? OR
        p.name LIKE ? OR
        p.product_code LIKE ? OR
        m.reference LIKE ? OR
        m.reason LIKE ?
      )`;
      const term = `%${filter.search}%`;
      countArgs.push(term, term, term, term, term);
    }

    const [items, countResult] = await Promise.all([
      this.listWithDetails({ ...filter, limit, offset }, client),
      client.execute({ sql: countSql, args: countArgs }),
    ]);

    const total = Number(countResult.rows[0]?.count ?? 0);
    return { items, total };
  },
};
