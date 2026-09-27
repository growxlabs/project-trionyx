import type { Client, InValue } from '@libsql/client';
import type {
  DealerRequest,
  DealerRequestType,
  DealerRequestStatus,
  DealerRequestPriority,
} from '@trionyx/types';
import { getDbClient } from '../db';
import { randomUUID } from 'crypto';

function mapDealerRequestRow(row: Record<string, unknown>): DealerRequest {
  return {
    id: String(row.id),
    requestCode: String(row.request_code),
    dealerId: String(row.dealer_id),
    productId: row.product_id ? String(row.product_id) : null,
    productName: row.product_name ? String(row.product_name) : null,
    type: row.type as DealerRequestType,
    subject: String(row.subject),
    description: String(row.description),
    status: row.status as DealerRequestStatus,
    priority: row.priority as DealerRequestPriority,
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : null,
    dealerName: row.dealer_name ? String(row.dealer_name) : undefined,
    dealerCode: row.dealer_code ? String(row.dealer_code) : undefined,
    assignedToName: row.assigned_to_name ? String(row.assigned_to_name) : null,
    createdByName: row.created_by_name ? String(row.created_by_name) : undefined,
  };
}

export async function generateRequestCode(client: Client = getDbClient()): Promise<string> {
  const result = await client.execute(`
    SELECT request_code FROM dealer_requests
    WHERE request_code LIKE 'TRX-REQ-%'
    ORDER BY request_code DESC LIMIT 1
  `);

  let nextSeq = 1;
  if (result.rows.length > 0 && result.rows[0].request_code) {
    const lastCode = String(result.rows[0].request_code);
    const numPart = lastCode.replace('TRX-REQ-', '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, '0');
  return `TRX-REQ-${padded}`;
}

export const dealerRequestsRepository = {
  async create(
    data: {
      dealerId: string;
      productId?: string | null;
      type: DealerRequestType;
      subject: string;
      description: string;
      priority?: DealerRequestPriority;
      assignedTo?: string | null;
      createdBy: string;
    },
    client: Client = getDbClient()
  ): Promise<DealerRequest> {
    const id = randomUUID();
    const code = await generateRequestCode(client);
    const now = new Date().toISOString();
    const priority = data.priority || 'MEDIUM';

    await client.execute({
      sql: `INSERT INTO dealer_requests (
        id, request_code, dealer_id, product_id, type, subject, description,
        status, priority, assigned_to, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?, ?)`,
      args: [
        id,
        code,
        data.dealerId,
        data.productId || null,
        data.type,
        data.subject.trim(),
        data.description.trim(),
        priority,
        data.assignedTo || null,
        data.createdBy,
        now,
        now,
      ],
    });

    const created = await this.findById(id, client);
    if (!created) {
      throw new Error('Failed to retrieve dealer request after creation');
    }
    return created;
  },

  async findById(id: string, client: Client = getDbClient()): Promise<DealerRequest | null> {
    const result = await client.execute({
      sql: `SELECT r.*,
                   dl.business_name as dealer_name,
                   dl.dealer_code as dealer_code,
                   dl.distributor_id as dealer_distributor_id,
                   p.name as product_name,
                   u_assignee.name as assigned_to_name,
                   u_creator.name as created_by_name
            FROM dealer_requests r
            LEFT JOIN dealers dl ON r.dealer_id = dl.id
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN users u_assignee ON r.assigned_to = u_assignee.id
            LEFT JOIN users u_creator ON r.created_by = u_creator.id
            WHERE r.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) return null;
    return mapDealerRequestRow(result.rows[0]);
  },

  async list(
    params: {
      dealerId?: string;
      distributorId?: string | null;
      status?: DealerRequestStatus;
      type?: DealerRequestType;
      page?: number;
      limit?: number;
    } = {},
    client: Client = getDbClient()
  ): Promise<{ items: DealerRequest[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const args: InValue[] = [];

    if (params.dealerId) {
      whereClauses.push('r.dealer_id = ?');
      args.push(params.dealerId);
    }

    if (params.distributorId) {
      whereClauses.push('dl.distributor_id = ?');
      args.push(params.distributorId);
    }

    if (params.status) {
      whereClauses.push('r.status = ?');
      args.push(params.status);
    }

    if (params.type) {
      whereClauses.push('r.type = ?');
      args.push(params.type);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countResult = await client.execute({
      sql: `SELECT COUNT(*) as total
            FROM dealer_requests r
            LEFT JOIN dealers dl ON r.dealer_id = dl.id
            ${whereSql}`,
      args,
    });
    const total = Number(countResult.rows[0].total || 0);

    const queryArgs = [...args, limit, offset];
    const result = await client.execute({
      sql: `SELECT r.*,
                   dl.business_name as dealer_name,
                   dl.dealer_code as dealer_code,
                   dl.distributor_id as dealer_distributor_id,
                   p.name as product_name,
                   u_assignee.name as assigned_to_name,
                   u_creator.name as created_by_name
            FROM dealer_requests r
            LEFT JOIN dealers dl ON r.dealer_id = dl.id
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN users u_assignee ON r.assigned_to = u_assignee.id
            LEFT JOIN users u_creator ON r.created_by = u_creator.id
            ${whereSql}
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?`,
      args: queryArgs,
    });

    const items = result.rows.map(mapDealerRequestRow);
    return { items, total, page, limit };
  },

  async updateStatus(
    id: string,
    data: {
      status: DealerRequestStatus;
      assignedTo?: string | null;
    },
    client: Client = getDbClient()
  ): Promise<DealerRequest> {
    const existing = await this.findById(id, client);
    if (!existing) {
      throw new Error(`Dealer request ${id} not found`);
    }

    const now = new Date().toISOString();
    const resolvedAt = data.status === 'RESOLVED' || data.status === 'CLOSED' ? now : null;

    let updateSql = `UPDATE dealer_requests SET status = ?, updated_at = ?`;
    const args: InValue[] = [data.status, now];

    if (data.assignedTo !== undefined) {
      updateSql += `, assigned_to = ?`;
      args.push(data.assignedTo || null);
    }

    if (resolvedAt) {
      updateSql += `, resolved_at = ?`;
      args.push(resolvedAt);
    }

    updateSql += ` WHERE id = ?`;
    args.push(id);

    await client.execute({ sql: updateSql, args });

    const updated = await this.findById(id, client);
    if (!updated) {
      throw new Error('Failed to find dealer request after status update');
    }
    return updated;
  },
};
