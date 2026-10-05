import type { Client, InValue } from '@libsql/client';
import type { DealerStatus } from '@trionyx/types';
import { getDbClient } from '../db';

export type NetworkGroupBy = 'distributor' | 'dealer_status' | 'state' | 'assignment_status';
export type NetworkSummaryQuery = {
  dealerStatus?: DealerStatus; distributorId?: string; state?: string;
  groupBy: NetworkGroupBy; page?: number; limit?: number;
};
export type AssignmentHistoryQuery = {
  dealerId?: string; distributorId?: string; from?: string; to?: string; page?: number; limit?: number;
};
export type NetworkExceptionType = 'ACTIVE_DEALER_UNASSIGNED' | 'MISSING_DISTRIBUTOR' | 'ACTIVE_DEALER_NON_ACTIVE_DISTRIBUTOR';
export type NetworkException = {
  type: NetworkExceptionType; severity: 'WARNING' | 'CRITICAL'; label: string;
  description: string; recordType: 'dealer'; recordId: string;
};
function pagination(query: { page?: number; limit?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  return { page, limit, offset: (page - 1) * limit };
}

export const dealerNetworkRepository = {
  async summary(query: NetworkSummaryQuery, client: Client = getDbClient()) {
    // All SQL structure is application-owned; only validated values become parameters.
    const dimensions: Record<NetworkGroupBy, [string, string]> = {
      distributor: ["COALESCE(dl.distributor_id, 'unassigned')", "COALESCE(dst.business_name, CASE WHEN dl.distributor_id IS NULL THEN 'Unassigned' ELSE 'Missing distributor' END)"],
      dealer_status: ['dl.status', 'dl.status'],
      state: ["COALESCE(dl.state, '')", "COALESCE(dl.state, '')"],
      assignment_status: ["CASE WHEN dl.distributor_id IS NULL THEN 'unassigned' ELSE 'assigned' END", "CASE WHEN dl.distributor_id IS NULL THEN 'Unassigned' ELSE 'Assigned' END"],
    };
    const [key, label] = dimensions[query.groupBy];
    const conditions: string[] = [];
    const args: InValue[] = [];
    if (query.dealerStatus) { conditions.push('dl.status = ?'); args.push(query.dealerStatus); }
    if (query.distributorId) { conditions.push('dl.distributor_id = ?'); args.push(query.distributorId); }
    if (query.state) { conditions.push('LOWER(dl.state) = LOWER(?)'); args.push(query.state); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const source = `FROM dealers dl LEFT JOIN distributors dst ON dl.distributor_id = dst.id ${where}`;
    const grouped = `SELECT ${key} AS group_key, ${label} AS group_label, COUNT(*) AS count ${source} GROUP BY ${key}, ${label}`;
    const { page, limit, offset } = pagination(query);
    const totals = await client.execute({ sql: `SELECT COUNT(*) AS total ${source}`, args });
    const groupsCount = await client.execute({ sql: `SELECT COUNT(*) AS total FROM (${grouped}) groups_count`, args });
    const distributors = await client.execute({
      sql: `SELECT COUNT(*) AS total FROM distributors ${query.distributorId ? 'WHERE id = ?' : ''}`,
      args: query.distributorId ? [query.distributorId] : [],
    });
    const rows = await client.execute({ sql: `${grouped} ORDER BY count DESC, group_key ASC LIMIT ? OFFSET ?`, args: [...args, limit, offset] });
    return {
      totalDealers: Number(totals.rows[0].total),
      // This count is the distributor population, not a count filtered by dealer status/state.
      totalDistributors: Number(distributors.rows[0].total),
      groups: rows.rows.map(row => ({ key: String(row.group_key), label: String(row.group_label), count: Number(row.count) })),
      total: Number(groupsCount.rows[0].total), page, limit,
    };
  },

  async history(query: AssignmentHistoryQuery, client: Client = getDbClient()) {
    const clauses: string[] = [];
    const args: InValue[] = [];
    if (query.dealerId) { clauses.push('h.dealer_id = ?'); args.push(query.dealerId); }
    if (query.distributorId) { clauses.push('(h.previous_distributor_id = ? OR h.new_distributor_id = ?)'); args.push(query.distributorId, query.distributorId); }
    if (query.from) { clauses.push('h.changed_at >= ?'); args.push(query.from); }
    if (query.to) { clauses.push('h.changed_at <= ?'); args.push(query.to); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { page, limit, offset } = pagination(query);
    const count = await client.execute({ sql: `SELECT COUNT(*) AS total FROM dealer_distributor_history h ${where}`, args });
    const rows = await client.execute({
      sql: `SELECT h.id, h.dealer_id, dl.business_name AS dealer_name,
        h.previous_distributor_id, prev.business_name AS previous_name,
        h.new_distributor_id, next.business_name AS new_name, h.changed_at
        FROM dealer_distributor_history h JOIN dealers dl ON dl.id = h.dealer_id
        LEFT JOIN distributors prev ON prev.id = h.previous_distributor_id
        LEFT JOIN distributors next ON next.id = h.new_distributor_id
        ${where} ORDER BY h.changed_at DESC, h.id ASC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });
    return {
      items: rows.rows.map(row => ({
        id: String(row.id), dealerId: String(row.dealer_id), dealerName: String(row.dealer_name),
        previousDistributorId: row.previous_distributor_id == null ? null : String(row.previous_distributor_id),
        previousDistributorName: row.previous_name == null ? null : String(row.previous_name),
        newDistributorId: row.new_distributor_id == null ? null : String(row.new_distributor_id),
        newDistributorName: row.new_name == null ? null : String(row.new_name), changedAt: String(row.changed_at),
      })), total: Number(count.rows[0].total), page, limit,
    };
  },

  async exceptions(query: { type?: NetworkExceptionType; page?: number; limit?: number }, client: Client = getDbClient()) {
    const definitions: Record<NetworkExceptionType, { predicate: string; severity: NetworkException['severity']; label: string; description: string }> = {
      ACTIVE_DEALER_UNASSIGNED: { predicate: "dl.status = 'ACTIVE' AND dl.distributor_id IS NULL", severity: 'WARNING', label: 'Active dealer is unassigned', description: 'Stored ACTIVE dealer has no distributor assignment. This is an attention condition, not a performance judgment.' },
      MISSING_DISTRIBUTOR: { predicate: 'dl.distributor_id IS NOT NULL AND dst.id IS NULL', severity: 'CRITICAL', label: 'Missing distributor reference', description: 'The stored distributor reference does not resolve to a distributor record.' },
      ACTIVE_DEALER_NON_ACTIVE_DISTRIBUTOR: { predicate: "dl.status = 'ACTIVE' AND dst.status IN ('INACTIVE', 'SUSPENDED')", severity: 'WARNING', label: 'Active dealer assigned to a non-active distributor', description: 'Stored ACTIVE dealer is assigned to a distributor whose stored status is INACTIVE or SUSPENDED.' },
    };
    const selected = query.type ? [query.type] : Object.keys(definitions) as NetworkExceptionType[];
    const union = selected.map(type => `SELECT dl.id AS record_id, '${type}' AS exception_type FROM dealers dl LEFT JOIN distributors dst ON dl.distributor_id = dst.id WHERE ${definitions[type].predicate}`).join(' UNION ALL ');
    const { page, limit, offset } = pagination(query);
    const count = await client.execute(`SELECT COUNT(*) AS total FROM (${union}) exceptions_count`);
    const rows = await client.execute({ sql: `SELECT * FROM (${union}) exceptions_list ORDER BY exception_type, record_id LIMIT ? OFFSET ?`, args: [limit, offset] });
    const items: NetworkException[] = rows.rows.map(row => {
      const type = String(row.exception_type) as NetworkExceptionType;
      const definition = definitions[type];
      return { type, severity: definition.severity, label: definition.label, description: definition.description, recordType: 'dealer', recordId: String(row.record_id) };
    });
    return { items, total: Number(count.rows[0].total), page, limit };
  },
};
