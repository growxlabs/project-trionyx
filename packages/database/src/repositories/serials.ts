import type { Client } from '@libsql/client';
import type {
  SerialNumberRecord,
  SerialNumberWithDetails,
  SerialStatus,
  ProductInventorySummary,
} from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';
import { auditLogsRepository } from './audit';

function mapSerialNumberRow(row: Record<string, unknown>): SerialNumberRecord {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    serialNumber: String(row.serial_number),
    locationId: String(row.location_id),
    status: row.status as SerialStatus,
    receivedAt: String(row.received_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const serialsRepository = {
  /**
   * Fast lookup of a single serial number with complete lineage and movement history.
   */
  async findBySerialNumber(
    serialNumber: string,
    client: Client = getDbClient()
  ): Promise<SerialNumberWithDetails | null> {
    const cleanSn = serialNumber.trim().toUpperCase();
    const result = await client.execute({
      sql: `
        SELECT
          s.*,
          p.product_code as product_code,
          p.name as product_name,
          p.slug as product_slug,
          p.category_id as product_category_id,
          l.code as location_code,
          l.name as location_name,
          l.status as location_status
        FROM serial_numbers s
        JOIN products p ON s.product_id = p.id
        JOIN inventory_locations l ON s.location_id = l.id
        WHERE UPPER(s.serial_number) = ?
        LIMIT 1
      `,
      args: [cleanSn],
    });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    // Fetch movements for this serial record
    const movementsResult = await client.execute({
      sql: `
        SELECT
          m.*,
          u.name as actor_name,
          from_l.name as from_location_name,
          from_l.code as from_location_code,
          to_l.name as to_location_name,
          to_l.code as to_location_code
        FROM serial_movements m
        LEFT JOIN users u ON m.created_by = u.id
        LEFT JOIN inventory_locations from_l ON m.from_location_id = from_l.id
        LEFT JOIN inventory_locations to_l ON m.to_location_id = to_l.id
        WHERE m.serial_record_id = ?
        ORDER BY m.created_at DESC
      `,
      args: [String(row.id)],
    });

    const movements = movementsResult.rows.map((mRow) => ({
      id: String(mRow.id),
      serialRecordId: String(mRow.serial_record_id),
      productId: String(mRow.product_id),
      type: mRow.type as 'RECEIVED' | 'TRANSFERRED' | 'ADJUSTED',
      fromLocationId: mRow.from_location_id ? String(mRow.from_location_id) : null,
      toLocationId: mRow.to_location_id ? String(mRow.to_location_id) : null,
      reference: mRow.reference ? String(mRow.reference) : null,
      reason: mRow.reason ? String(mRow.reason) : null,
      createdBy: String(mRow.created_by),
      createdAt: String(mRow.created_at),
      actorName: mRow.actor_name ? String(mRow.actor_name) : 'Operator',
      fromLocationName: mRow.from_location_name ? String(mRow.from_location_name) : undefined,
      fromLocationCode: mRow.from_location_code ? String(mRow.from_location_code) : undefined,
      toLocationName: mRow.to_location_name ? String(mRow.to_location_name) : undefined,
      toLocationCode: mRow.to_location_code ? String(mRow.to_location_code) : undefined,
    }));

    return {
      id: String(row.id),
      productId: String(row.product_id),
      serialNumber: String(row.serial_number),
      locationId: String(row.location_id),
      status: row.status as SerialStatus,
      receivedAt: String(row.received_at),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      product: {
        id: String(row.product_id),
        productCode: String(row.product_code),
        name: String(row.product_name),
        slug: String(row.product_slug),
        categoryId: String(row.product_category_id),
      },
      location: {
        id: String(row.location_id),
        code: String(row.location_code),
        name: String(row.location_name),
        status: row.location_status as 'ACTIVE' | 'INACTIVE',
      },
      movements,
    };
  },

  async findById(id: string, client: Client = getDbClient()): Promise<SerialNumberRecord | null> {
    const result = await client.execute({
      sql: 'SELECT * FROM serial_numbers WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return mapSerialNumberRow(result.rows[0]);
  },

  /**
   * Receive a batch of actual serial numbers into a product and facility location.
   */
  async receiveBatch(
    data: {
      productId: string;
      locationId: string;
      serialNumbers: string[];
      reference?: string | null;
      notes?: string | null;
      actorId: string;
    },
    client: Client = getDbClient()
  ): Promise<SerialNumberRecord[]> {
    if (data.serialNumbers.length === 0) {
      throw new Error('At least one serial number is required.');
    }

    // Sanitize and deduplicate incoming batch
    const cleanedSerials = data.serialNumbers
      .map((sn) => sn.trim().toUpperCase())
      .filter((sn) => sn.length > 0);

    const uniqueSet = new Set<string>();
    const withinBatchDuplicates: string[] = [];
    for (const sn of cleanedSerials) {
      if (uniqueSet.has(sn)) {
        withinBatchDuplicates.push(sn);
      } else {
        uniqueSet.add(sn);
      }
    }

    if (withinBatchDuplicates.length > 0) {
      throw new Error(`Duplicate serial numbers in batch: ${withinBatchDuplicates.join(', ')}`);
    }

    // Check for collisions with existing database records
    const existingChecks = await client.execute({
      sql: `SELECT serial_number FROM serial_numbers WHERE serial_number IN (${cleanedSerials.map(() => '?').join(', ')})`,
      args: cleanedSerials,
    });

    if (existingChecks.rows.length > 0) {
      const existing = existingChecks.rows.map((r) => String(r.serial_number));
      throw new Error(`Serial number(s) already exist in system: ${existing.join(', ')}`);
    }

    const now = new Date().toISOString();
    const createdRecords: SerialNumberRecord[] = [];

    // Transactional batch insert of serial numbers and initial movement records
    const batchOperations: { sql: string; args: (string | number | null)[] }[] = [];

    for (const sn of cleanedSerials) {
      const serialId = randomUUID();
      const movementId = randomUUID();

      batchOperations.push({
        sql: `INSERT INTO serial_numbers (
                id, product_id, serial_number, location_id, status, received_at, created_at, updated_at
              ) VALUES (?, ?, ?, ?, 'AVAILABLE', ?, ?, ?)`,
        args: [serialId, data.productId, sn, data.locationId, now, now, now],
      });

      batchOperations.push({
        sql: `INSERT INTO serial_movements (
                id, serial_record_id, product_id, type, from_location_id, to_location_id, reference, reason, created_by, created_at
              ) VALUES (?, ?, ?, 'RECEIVED', NULL, ?, ?, ?, ?, ?)`,
        args: [
          movementId,
          serialId,
          data.productId,
          data.locationId,
          data.reference || null,
          data.notes || 'Initial physical stock receipt',
          data.actorId,
          now,
        ],
      });

      createdRecords.push({
        id: serialId,
        productId: data.productId,
        serialNumber: sn,
        locationId: data.locationId,
        status: 'AVAILABLE',
        receivedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    await client.batch(batchOperations, 'write');

    // Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: data.actorId,
        event: 'SERIAL_RECEIVED',
        metadata: {
          productId: data.productId,
          locationId: data.locationId,
          count: createdRecords.length,
          reference: data.reference,
        },
      },
      client
    );

    return createdRecords;
  },

  /**
   * Transfer physical serial numbers from source location to destination location.
   */
  async transferBatch(
    data: {
      serialNumbers: string[];
      sourceLocationId: string;
      destinationLocationId: string;
      reference?: string | null;
      notes?: string | null;
      actorId: string;
    },
    client: Client = getDbClient()
  ): Promise<SerialNumberRecord[]> {
    if (data.sourceLocationId === data.destinationLocationId) {
      throw new Error('Source and destination locations cannot be the same.');
    }
    if (data.serialNumbers.length === 0) {
      throw new Error('At least one serial number is required for transfer.');
    }

    const cleanSerials = data.serialNumbers.map((s) => s.trim().toUpperCase());

    // Query all requested serial records
    const result = await client.execute({
      sql: `SELECT * FROM serial_numbers WHERE serial_number IN (${cleanSerials.map(() => '?').join(', ')})`,
      args: cleanSerials,
    });

    const foundRecords = result.rows.map(mapSerialNumberRow);
    const foundMap = new Map(foundRecords.map((r) => [r.serialNumber, r]));

    // Validate each requested serial number
    for (const sn of cleanSerials) {
      const rec = foundMap.get(sn);
      if (!rec) {
        throw new Error(`Serial number "${sn}" does not exist in inventory.`);
      }
      if (rec.locationId !== data.sourceLocationId) {
        throw new Error(`Serial number "${sn}" is not at the source location.`);
      }
      if (rec.status !== 'AVAILABLE') {
        throw new Error(`Serial number "${sn}" is currently ${rec.status} and cannot be transferred.`);
      }
    }

    const now = new Date().toISOString();
    const batchOperations: { sql: string; args: (string | number | null)[] }[] = [];
    const updatedRecords: SerialNumberRecord[] = [];

    for (const rec of foundRecords) {
      const movementId = randomUUID();

      batchOperations.push({
        sql: `UPDATE serial_numbers SET location_id = ?, updated_at = ? WHERE id = ?`,
        args: [data.destinationLocationId, now, rec.id],
      });

      batchOperations.push({
        sql: `INSERT INTO serial_movements (
                id, serial_record_id, product_id, type, from_location_id, to_location_id, reference, reason, created_by, created_at
              ) VALUES (?, ?, ?, 'TRANSFERRED', ?, ?, ?, ?, ?, ?)`,
        args: [
          movementId,
          rec.id,
          rec.productId,
          data.sourceLocationId,
          data.destinationLocationId,
          data.reference || null,
          data.notes || 'Inter-facility inventory transfer',
          data.actorId,
          now,
        ],
      });

      updatedRecords.push({
        ...rec,
        locationId: data.destinationLocationId,
        updatedAt: now,
      });
    }

    await client.batch(batchOperations, 'write');

    await auditLogsRepository.recordEvent(
      {
        userId: data.actorId,
        event: 'SERIAL_TRANSFERRED',
        metadata: {
          sourceLocationId: data.sourceLocationId,
          destinationLocationId: data.destinationLocationId,
          count: updatedRecords.length,
          reference: data.reference,
        },
      },
      client
    );

    return updatedRecords;
  },

  /**
   * Adjust serial number status (e.g. mark INACTIVE with mandatory reason).
   */
  async adjustStatus(
    data: {
      serialRecordId: string;
      newStatus: SerialStatus;
      reason: string;
      notes?: string | null;
      actorId: string;
    },
    client: Client = getDbClient()
  ): Promise<SerialNumberRecord> {
    if (!data.reason || data.reason.trim().length < 3) {
      throw new Error('A valid adjustment reason is mandatory (minimum 3 characters).');
    }

    const existing = await this.findById(data.serialRecordId, client);
    if (!existing) {
      throw new Error('Serial number record not found.');
    }

    const now = new Date().toISOString();
    const movementId = randomUUID();

    await client.batch(
      [
        {
          sql: `UPDATE serial_numbers SET status = ?, updated_at = ? WHERE id = ?`,
          args: [data.newStatus, now, existing.id],
        },
        {
          sql: `INSERT INTO serial_movements (
                  id, serial_record_id, product_id, type, from_location_id, to_location_id, reference, reason, created_by, created_at
                ) VALUES (?, ?, ?, 'ADJUSTED', ?, ?, NULL, ?, ?, ?)`,
          args: [
            movementId,
            existing.id,
            existing.productId,
            existing.locationId,
            existing.locationId,
            `${data.reason.trim()}${data.notes ? ` — ${data.notes.trim()}` : ''}`,
            data.actorId,
            now,
          ],
        },
      ],
      'write'
    );

    await auditLogsRepository.recordEvent(
      {
        userId: data.actorId,
        event: 'SERIAL_STATUS_CHANGED',
        metadata: {
          serialRecordId: existing.id,
          serialNumber: existing.serialNumber,
          oldStatus: existing.status,
          newStatus: data.newStatus,
          reason: data.reason,
        },
      },
      client
    );

    return {
      ...existing,
      status: data.newStatus,
      updatedAt: now,
    };
  },

  /**
   * List serial numbers for a product with details.
   */
  async listByProduct(
    productId: string,
    filter?: {
      locationId?: string;
      status?: SerialStatus;
      search?: string;
    },
    client: Client = getDbClient()
  ): Promise<SerialNumberWithDetails[]> {
    let sql = `
      SELECT
        s.*,
        p.product_code as product_code,
        p.name as product_name,
        p.slug as product_slug,
        p.category_id as product_category_id,
        l.code as location_code,
        l.name as location_name,
        l.status as location_status
      FROM serial_numbers s
      JOIN products p ON s.product_id = p.id
      JOIN inventory_locations l ON s.location_id = l.id
      WHERE s.product_id = ?
    `;
    const args: (string | number)[] = [productId];

    if (filter?.locationId) {
      sql += ' AND s.location_id = ?';
      args.push(filter.locationId);
    }
    if (filter?.status) {
      sql += ' AND s.status = ?';
      args.push(filter.status);
    }
    if (filter?.search) {
      sql += ' AND (s.serial_number LIKE ? OR l.name LIKE ?)';
      const term = `%${filter.search}%`;
      args.push(term, term);
    }

    sql += ' ORDER BY s.received_at DESC, s.serial_number ASC';

    const result = await client.execute({ sql, args });

    return result.rows.map((row) => ({
      id: String(row.id),
      productId: String(row.product_id),
      serialNumber: String(row.serial_number),
      locationId: String(row.location_id),
      status: row.status as SerialStatus,
      receivedAt: String(row.received_at),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      product: {
        id: String(row.product_id),
        productCode: String(row.product_code),
        name: String(row.product_name),
        slug: String(row.product_slug),
        categoryId: String(row.product_category_id),
      },
      location: {
        id: String(row.location_id),
        code: String(row.location_code),
        name: String(row.location_name),
        status: row.location_status as 'ACTIVE' | 'INACTIVE',
      },
    }));
  },

  async list(
    filter?: {
      productId?: string;
      locationId?: string;
      status?: SerialStatus;
      search?: string;
      page?: number;
      limit?: number;
    },
    client: Client = getDbClient()
  ): Promise<{ items: SerialNumberWithDetails[]; total: number }> {
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 25));
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        s.*,
        p.product_code as product_code,
        p.name as product_name,
        p.slug as product_slug,
        p.category_id as product_category_id,
        l.code as location_code,
        l.name as location_name,
        l.status as location_status
      FROM serial_numbers s
      JOIN products p ON s.product_id = p.id
      JOIN inventory_locations l ON s.location_id = l.id
      WHERE 1=1
    `;
    let countSql = `
      SELECT COUNT(*) as count
      FROM serial_numbers s
      JOIN products p ON s.product_id = p.id
      JOIN inventory_locations l ON s.location_id = l.id
      WHERE 1=1
    `;
    const args: (string | number)[] = [];
    const countArgs: (string | number)[] = [];

    if (filter?.productId) {
      sql += ' AND s.product_id = ?';
      countSql += ' AND s.product_id = ?';
      args.push(filter.productId);
      countArgs.push(filter.productId);
    }
    if (filter?.locationId) {
      sql += ' AND s.location_id = ?';
      countSql += ' AND s.location_id = ?';
      args.push(filter.locationId);
      countArgs.push(filter.locationId);
    }
    if (filter?.status) {
      sql += ' AND s.status = ?';
      countSql += ' AND s.status = ?';
      args.push(filter.status);
      countArgs.push(filter.status);
    }
    if (filter?.search) {
      const term = `%${filter.search}%`;
      const searchClause = ' AND (s.serial_number LIKE ? OR p.name LIKE ? OR p.product_code LIKE ?)';
      sql += searchClause;
      countSql += searchClause;
      args.push(term, term, term);
      countArgs.push(term, term, term);
    }

    sql += ' ORDER BY s.received_at DESC LIMIT ? OFFSET ?';
    args.push(limit, offset);

    const [result, countResult] = await Promise.all([
      client.execute({ sql, args }),
      client.execute({ sql: countSql, args: countArgs }),
    ]);

    const items = result.rows.map((row) => ({
      id: String(row.id),
      productId: String(row.product_id),
      serialNumber: String(row.serial_number),
      locationId: String(row.location_id),
      status: row.status as SerialStatus,
      receivedAt: String(row.received_at),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      product: {
        id: String(row.product_id),
        productCode: String(row.product_code),
        name: String(row.product_name),
        slug: String(row.product_slug),
        categoryId: String(row.product_category_id),
      },
      location: {
        id: String(row.location_id),
        code: String(row.location_code),
        name: String(row.location_name),
        status: row.location_status as 'ACTIVE' | 'INACTIVE',
      },
    }));

    return {
      items,
      total: Number(countResult.rows[0]?.count ?? 0),
    };
  },

  /**
   * Derived inventory summary aggregated by Product and Location.
   */
  async listProductInventorySummaries(
    filter?: {
      locationId?: string;
      categoryId?: string;
      search?: string;
    },
    client: Client = getDbClient()
  ): Promise<ProductInventorySummary[]> {
    let sql = `
      SELECT
        p.id as product_id,
        p.product_code as product_code,
        p.name as product_name,
        p.slug as product_slug,
        p.category_id as product_category_id,
        p.status as product_status,
        c.name as category_name,
        l.id as location_id,
        l.name as location_name,
        l.code as location_code,
        COUNT(CASE WHEN s.status = 'AVAILABLE' THEN 1 END) as available_count,
        COUNT(s.id) as total_count,
        COALESCE(MAX(s.updated_at), p.updated_at) as last_updated
      FROM products p
      JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN serial_numbers s ON s.product_id = p.id
      LEFT JOIN inventory_locations l ON s.location_id = l.id
      WHERE 1=1
    `;
    const args: (string | number)[] = [];

    if (filter?.locationId) {
      sql += ' AND s.location_id = ?';
      args.push(filter.locationId);
    }
    if (filter?.categoryId) {
      sql += ' AND p.category_id = ?';
      args.push(filter.categoryId);
    }
    if (filter?.search) {
      sql += ' AND (p.name LIKE ? OR p.product_code LIKE ? OR l.name LIKE ? OR s.serial_number LIKE ?)';
      const term = `%${filter.search}%`;
      args.push(term, term, term, term);
    }

    sql += ' GROUP BY p.id, l.id ORDER BY p.name ASC, l.name ASC';

    const result = await client.execute({ sql, args });

    return result.rows.map((row) => ({
      productId: String(row.product_id),
      productCode: String(row.product_code),
      productName: String(row.product_name),
      productSlug: String(row.product_slug),
      categoryId: String(row.product_category_id),
      categoryName: row.category_name ? String(row.category_name) : undefined,
      locationId: row.location_id ? String(row.location_id) : undefined,
      locationName: row.location_name ? String(row.location_name) : 'No Stock Recorded',
      locationCode: row.location_code ? String(row.location_code) : '—',
      availableCount: Number(row.available_count ?? 0),
      totalCount: Number(row.total_count ?? 0),
      status: row.product_status as ProductInventorySummary['status'],
      lastUpdated: String(row.last_updated),
    }));
  },

  /**
   * Total system available serial count.
   */
  async countAvailableSerials(client: Client = getDbClient()): Promise<number> {
    const res = await client.execute(`SELECT COUNT(*) as count FROM serial_numbers WHERE status = 'AVAILABLE'`);
    return Number(res.rows[0]?.count ?? 0);
  },

  /**
   * Available serial count for a specific product.
   */
  async countAvailableForProduct(productId: string, client: Client = getDbClient()): Promise<number> {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM serial_numbers WHERE product_id = ? AND status = 'AVAILABLE'`,
      args: [productId],
    });
    return Number(res.rows[0]?.count ?? 0);
  },
};
