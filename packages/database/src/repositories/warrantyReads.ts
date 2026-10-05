import type { Client, InValue } from '@libsql/client';
import { getDbClient, getDatabaseUrl, isPostgresUrl } from '../db';

export type WarrantyFilter = {
  warrantyId?: string; serialNumber?: string; dealerId?: string; productId?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'VOID'; registeredFrom?: string; registeredTo?: string;
  asOfDate?: string; page?: number; limit?: number;
};
export type WarrantyGrouping = 'status' | 'dealer' | 'product' | 'registration_period';
export const warrantyRules = ['MISSING_SERIAL', 'MISSING_PRODUCT', 'MISSING_DEALER', 'INACTIVE_DEALER', 'DUPLICATE_ACTIVE', 'INVALID_DATE_ORDER', 'INVALID_VOID_STATE'] as const;
export type WarrantyRule = typeof warrantyRules[number];
const joins = 'FROM warranties w LEFT JOIN serial_numbers s ON s.id=w.serial_record_id LEFT JOIN products p ON p.id=w.product_id LEFT JOIN dealers d ON d.id=w.dealer_id';
export const isoTimestamp = (value: unknown) => (value instanceof Date ? value : new Date(String(value))).toISOString();
function statusExpression(today: string) {
  // Date comes only from the server, never model SQL. Bind it separately from filter values.
  return { sql: "CASE WHEN w.status='VOID' THEN 'VOID' WHEN w.status='ACTIVE' AND w.warranty_end_date < ? THEN 'EXPIRED' WHEN w.status='ACTIVE' THEN 'ACTIVE' ELSE 'UNSUPPORTED' END", args: [today] };
}
function where(filter: WarrantyFilter) {
  const parts = ['1=1']; const args: InValue[] = [];
  for (const [key, field] of [['warrantyId', 'w.id'], ['serialNumber', 's.serial_number'], ['dealerId', 'w.dealer_id'], ['productId', 'w.product_id']] as const) {
    if (filter[key]) { parts.push(key === 'serialNumber' ? `UPPER(${field}) = UPPER(?)` : `${field} = ?`); args.push(filter[key]!); }
  }
  if (filter.status === 'VOID') parts.push("w.status='VOID'");
  else if (filter.status) { parts.push(`w.status='ACTIVE' AND w.warranty_end_date ${filter.status === 'EXPIRED' ? '<' : '>='} ?`); args.push(filter.asOfDate ?? new Date().toISOString().slice(0, 10)); }
  if (filter.registeredFrom) { parts.push('w.activated_at >= ?'); args.push(filter.registeredFrom); }
  if (filter.registeredTo) { parts.push('w.activated_at <= ?'); args.push(filter.registeredTo); }
  return { sql: `WHERE ${parts.join(' AND ')}`, args };
}
function paging(filter: { page?: number; limit?: number }) {
  const page = Math.max(1, filter.page ?? 1), limit = Math.min(50, Math.max(1, filter.limit ?? 20));
  return { page, limit, offset: (page - 1) * limit };
}
const exceptionConditions: Record<WarrantyRule, string> = {
  MISSING_SERIAL: 's.id IS NULL', MISSING_PRODUCT: 'p.id IS NULL',
  MISSING_DEALER: 'w.dealer_id IS NOT NULL AND d.id IS NULL',
  INACTIVE_DEALER: "d.id IS NOT NULL AND d.status <> 'ACTIVE'",
  DUPLICATE_ACTIVE: "w.status='ACTIVE' AND EXISTS (SELECT 1 FROM warranties other WHERE other.serial_record_id=w.serial_record_id AND other.status='ACTIVE' AND other.id<>w.id)",
  INVALID_DATE_ORDER: 'w.warranty_end_date < w.warranty_start_date',
  INVALID_VOID_STATE: "(w.status='VOID' AND w.voided_at IS NULL) OR (w.status='ACTIVE' AND w.voided_at IS NOT NULL)",
};
export const warrantyReadsRepository = {
  async resolve(target: { id?: string; name?: string }, kind: 'dealer' | 'product', client: Client = getDbClient()) {
    const table = kind === 'dealer' ? 'dealers' : 'products', name = kind === 'dealer' ? 'business_name' : 'name';
    const parts = ['1=1']; const args: string[] = [];
    if (target.id) { parts.push('id=?'); args.push(target.id); }
    if (target.name) { parts.push(`LOWER(TRIM(${name}))=LOWER(?)`); args.push(target.name.trim()); }
    const rows = await client.execute({ sql: `SELECT id, ${name} AS name FROM ${table} WHERE ${parts.join(' AND ')} ORDER BY id LIMIT 2`, args });
    return rows.rows.map(row => ({ id: String(row.id), name: String(row.name) }));
  },
  async list(filter: WarrantyFilter, client: Client = getDbClient()) {
    const condition = where(filter), pagination = paging(filter);
    const total = await client.execute({ sql: `SELECT COUNT(*) AS count ${joins} ${condition.sql}`, args: condition.args });
    const rows = await client.execute({ sql: `SELECT w.id, w.serial_record_id, s.serial_number, w.product_id, p.name AS product_name, w.dealer_id, d.business_name AS dealer_name, w.status, w.installation_date, w.warranty_start_date, w.warranty_end_date, w.activated_at, w.voided_at ${joins} ${condition.sql} ORDER BY w.activated_at DESC, w.id DESC LIMIT ? OFFSET ?`, args: [...condition.args, pagination.limit, pagination.offset] });
    return { total: Number(total.rows[0].count), items: rows.rows.map(row => {
      if (!['ACTIVE', 'VOID'].includes(String(row.status))) throw new Error('INVALID_STORED_WARRANTY_STATUS');
      if (!row.serial_number || !row.product_name || (row.dealer_id && !row.dealer_name)) throw new Error('UNRESOLVED_WARRANTY_REFERENCE');
      return { warrantyId: String(row.id), serialRecordId: String(row.serial_record_id), serialNumber: String(row.serial_number), productId: String(row.product_id), productName: String(row.product_name), dealerId: row.dealer_id ? String(row.dealer_id) : null, dealerName: row.dealer_name ? String(row.dealer_name) : null,
        status: row.status === 'VOID' ? 'VOID' as const : String(row.warranty_end_date) < (filter.asOfDate ?? new Date().toISOString().slice(0, 10)) ? 'EXPIRED' as const : 'ACTIVE' as const,
        storedStatus: String(row.status), installationDate: String(row.installation_date), startDate: String(row.warranty_start_date), expiryDate: String(row.warranty_end_date), registeredAt: isoTimestamp(row.activated_at), voidedAt: row.voided_at ? isoTimestamp(row.voided_at) : null };
    }) };
  },
  async summary(filter: WarrantyFilter & { groupBy: WarrantyGrouping }, client: Client = getDbClient(), postgres = isPostgresUrl(getDatabaseUrl())) {
    const condition = where(filter), pagination = paging(filter);
    const status = statusExpression(filter.asOfDate ?? new Date().toISOString().slice(0, 10));
    const month = postgres ? "TO_CHAR(w.activated_at AT TIME ZONE 'UTC','YYYY-MM')" : "SUBSTR(w.activated_at,1,7)";
    const dimensions = { status: [status.sql, status.sql], dealer: ["COALESCE(w.dealer_id,'UNASSIGNED')", "COALESCE(d.business_name, CASE WHEN w.dealer_id IS NULL THEN 'Internal / no dealer' ELSE 'Missing dealer' END)"], product: ['w.product_id', "COALESCE(p.name,'Missing product')"], registration_period: [month, month] };
    const [key, label] = dimensions[filter.groupBy];
    // Group through a projected subquery so status parameters appear exactly twice, independent of SQL dialect.
    const projectArgs = filter.groupBy === 'status' ? [...status.args, ...status.args, ...condition.args] : condition.args;
    const grouped = `SELECT key, label, COUNT(*) AS count FROM (SELECT ${key} AS key, ${label} AS label ${joins} ${condition.sql}) records GROUP BY key,label`;
    const total = await client.execute({ sql: `SELECT COUNT(*) AS count ${joins} ${condition.sql}`, args: condition.args });
    const count = await client.execute({ sql: `SELECT COUNT(*) AS count FROM (${grouped}) groups_count`, args: projectArgs });
    const rows = await client.execute({ sql: `${grouped} ORDER BY count DESC,key LIMIT ? OFFSET ?`, args: [...projectArgs, pagination.limit, pagination.offset] });
    return { total: Number(total.rows[0].count), groupsTotal: Number(count.rows[0].count), groups: rows.rows.map(row => ({ key: String(row.key), label: String(row.label), count: Number(row.count) })) };
  },
  async exceptions(filter: { rule?: WarrantyRule; page?: number; limit?: number }, client: Client = getDbClient()) {
    const selected = filter.rule ? [filter.rule] : warrantyRules;
    const source = selected.map(rule => `SELECT w.id AS record_id, '${rule}' AS rule ${joins} WHERE ${exceptionConditions[rule]}`).join(' UNION ALL ');
    const total = await client.execute(`SELECT COUNT(*) AS count FROM (${source}) conditions`);
    const pagination = paging(filter);
    const rows = await client.execute({ sql: `SELECT * FROM (${source}) conditions ORDER BY rule,record_id LIMIT ? OFFSET ?`, args: [pagination.limit, pagination.offset] });
    return { total: Number(total.rows[0].count), items: rows.rows.map(row => ({ recordId: String(row.record_id), rule: row.rule as WarrantyRule, severity: row.rule === 'INACTIVE_DEALER' ? 'WARNING' as const : 'CRITICAL' as const })) };
  },
};
