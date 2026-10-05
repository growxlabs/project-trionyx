import type { Client } from '@libsql/client';
import type { ContactEnquiryStatus, ContactEnquiryType } from '@trionyx/types';
import { getDbClient, getDatabaseUrl, isPostgresUrl } from '../db';

export type EnquiryFilter = {
  type?: ContactEnquiryType | 'ALL'; status?: ContactEnquiryStatus | 'ALL'; state?: string;
  assignedTo?: string; search?: string; page?: number; limit?: number;
  enquiryId?: string; enquiryCode?: string; city?: string; pincode?: string;
  hasOwner?: boolean; createdFrom?: string; createdTo?: string; createdBefore?: string;
};
export function enquiryWhere(filter: EnquiryFilter = {}) {
  const conditions = ['1=1']; const args: (string | number)[] = [];
  const add = (sql: string, value: string) => { conditions.push(sql); args.push(value); };
  if (filter.type && filter.type !== 'ALL') add('ce.type = ?', filter.type);
  if (filter.status && filter.status !== 'ALL') add('ce.status = ?', filter.status);
  for (const key of ['state', 'city', 'pincode'] as const) if (filter[key] && filter[key] !== 'ALL') add(`LOWER(ce.${key}) = LOWER(?)`, filter[key]!);
  if (filter.enquiryId) add('ce.id = ?', filter.enquiryId);
  if (filter.enquiryCode) add('UPPER(ce.enquiry_code) = UPPER(?)', filter.enquiryCode);
  if (filter.assignedTo && filter.assignedTo !== 'ALL') {
    if (filter.assignedTo === 'UNASSIGNED') conditions.push('ce.assigned_to IS NULL');
    else add('ce.assigned_to = ?', filter.assignedTo);
  }
  if (filter.hasOwner !== undefined) conditions.push(`ce.assigned_to IS ${filter.hasOwner ? 'NOT ' : ''}NULL`);
  if (filter.createdFrom) add('ce.created_at >= ?', filter.createdFrom);
  if (filter.createdTo) add('ce.created_at <= ?', filter.createdTo);
  if (filter.createdBefore) add('ce.created_at < ?', filter.createdBefore);
  if (filter.search) {
    const fields = ['enquiry_code', 'full_name', 'company_name', 'business_address', 'phone', 'email', 'city'];
    conditions.push(`(${fields.map(field => `LOWER(ce.${field}) LIKE LOWER(?)`).join(' OR ')})`);
    args.push(...fields.map(() => `%${filter.search!.trim()}%`));
  }
  return { whereSql: `WHERE ${conditions.join(' AND ')}`, args };
}
export type EnquiryGrouping = 'status' | 'type' | 'assignment_status' | 'state';
export type EnquiryChangeType = 'CREATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'NOTE_ADDED';
const events: Record<EnquiryChangeType, string> = { CREATED: 'CONTACT_ENQUIRY_CREATED', STATUS_CHANGED: 'CONTACT_ENQUIRY_STATUS_CHANGED', ASSIGNED: 'CONTACT_ENQUIRY_ASSIGNED', NOTE_ADDED: 'CONTACT_ENQUIRY_NOTE_ADDED' };
export const enquiryReadsRepository = {
  async owners(target: { ownerId?: string; ownerName?: string }, client: Client = getDbClient()) {
    const conditions = ["role IN ('MANAGING_DIRECTOR', 'ADMIN', 'STAFF')"]; const args: string[] = [];
    if (target.ownerId) { conditions.push('id = ?'); args.push(target.ownerId); }
    if (target.ownerName) { conditions.push('LOWER(TRIM(name)) = LOWER(?)'); args.push(target.ownerName.trim()); }
    const result = await client.execute({ sql: `SELECT id, name FROM users WHERE ${conditions.join(' AND ')} ORDER BY id LIMIT 2`, args });
    return result.rows.map(row => ({ id: String(row.id), displayName: String(row.name) }));
  },
  async summary(filter: EnquiryFilter & { groupBy: EnquiryGrouping }, client: Client = getDbClient()) {
    const { whereSql, args } = enquiryWhere(filter);
    const dimensions = { status: 'ce.status', type: 'ce.type', state: "COALESCE(NULLIF(ce.state, ''), 'UNKNOWN')", assignment_status: "CASE WHEN ce.assigned_to IS NULL THEN 'UNASSIGNED' ELSE 'ASSIGNED' END" };
    const expression = dimensions[filter.groupBy];
    const total = await client.execute({ sql: `SELECT COUNT(*) AS count FROM contact_enquiries ce ${whereSql}`, args });
    const groupsTotal = await client.execute({ sql: `SELECT COUNT(*) AS count FROM (SELECT ${expression} FROM contact_enquiries ce ${whereSql} GROUP BY ${expression}) grouped`, args });
    const page = filter.page ?? 1, limit = filter.limit ?? 20;
    const rows = await client.execute({ sql: `SELECT ${expression} AS key, COUNT(*) AS count FROM contact_enquiries ce ${whereSql} GROUP BY ${expression} ORDER BY count DESC, key LIMIT ? OFFSET ?`, args: [...args, limit, (page - 1) * limit] });
    return { total: Number(total.rows[0].count), groupsTotal: Number(groupsTotal.rows[0].count), groups: rows.rows.map(row => ({ key: String(row.key), label: String(row.key), count: Number(row.count) })) };
  },
  async attention(filter: { rule?: 'NEW_UNASSIGNED' | 'MISSING_OWNER'; page?: number; limit?: number }, client: Client = getDbClient()) {
    const rules = { NEW_UNASSIGNED: "ce.status = 'NEW' AND ce.assigned_to IS NULL", MISSING_OWNER: 'ce.assigned_to IS NOT NULL AND u.id IS NULL' };
    const condition = filter.rule ? rules[filter.rule] : `(${rules.NEW_UNASSIGNED}) OR (${rules.MISSING_OWNER})`;
    const from = `FROM contact_enquiries ce LEFT JOIN users u ON ce.assigned_to = u.id WHERE ${condition}`;
    const total = await client.execute(`SELECT COUNT(*) AS count ${from}`);
    const page = filter.page ?? 1, limit = filter.limit ?? 20;
    const result = await client.execute({ sql: `SELECT ce.id, ce.enquiry_code, ce.created_at, CASE WHEN ce.assigned_to IS NOT NULL AND u.id IS NULL THEN 'MISSING_OWNER' ELSE 'NEW_UNASSIGNED' END AS rule ${from} ORDER BY ce.created_at DESC, ce.id LIMIT ? OFFSET ?`, args: [limit, (page - 1) * limit] });
    return { total: Number(total.rows[0].count), items: result.rows.map(row => ({ enquiryId: String(row.id), enquiryCode: String(row.enquiry_code), createdAt: String(row.created_at), rule: row.rule as 'NEW_UNASSIGNED' | 'MISSING_OWNER' })) };
  },
  async changes(filter: { enquiryId?: string; changeType?: EnquiryChangeType; from?: string; to?: string; page?: number; limit?: number }, client: Client = getDbClient(), postgres = isPostgresUrl(getDatabaseUrl())) {
    // Audit events are the actual source of lifecycle history, never current-state timestamps.
    const field = (name: string) => postgres ? `(a.metadata::jsonb ->> '${name}')` : `json_extract(CASE WHEN json_valid(a.metadata) THEN a.metadata ELSE '{}' END, '$.${name}')`;
    if (!postgres) {
      const malformed = await client.execute({ sql: `SELECT COUNT(*) AS count FROM audit_logs WHERE event IN (${Object.values(events).map(() => '?').join(',')}) AND (metadata IS NULL OR NOT json_valid(metadata))`, args: Object.values(events) });
      if (Number(malformed.rows[0].count)) throw new Error('INVALID_STORED_HISTORY');
    }
    const conditions = [`a.event IN (${Object.values(events).map(() => '?').join(',')})`]; const args: (string | number)[] = Object.values(events);
    if (filter.changeType) { conditions.push('a.event = ?'); args.push(events[filter.changeType]); }
    if (filter.enquiryId) { conditions.push(`${field('enquiryId')} = ?`); args.push(filter.enquiryId); }
    if (filter.from) { conditions.push('a.created_at >= ?'); args.push(filter.from); }
    if (filter.to) { conditions.push('a.created_at <= ?'); args.push(filter.to); }
    const from = `FROM audit_logs a JOIN contact_enquiries ce ON ce.id = ${field('enquiryId')} WHERE ${conditions.join(' AND ')}`;
    const total = await client.execute({ sql: `SELECT COUNT(*) AS count ${from}`, args });
    const page = filter.page ?? 1, limit = filter.limit ?? 20;
    const rows = await client.execute({ sql: `SELECT a.id, a.event, a.created_at, ce.id AS enquiry_id, ce.enquiry_code, ${field('previousStatus')} AS previous_status, ${field('newStatus')} AS new_status, ${field('previousAssignedTo')} AS previous_owner, ${field('newAssignedTo')} AS new_owner ${from} ORDER BY a.created_at DESC, a.id DESC LIMIT ? OFFSET ?`, args: [...args, limit, (page - 1) * limit] });
    return { total: Number(total.rows[0].count), items: rows.rows.map(row => {
      const changeType = (Object.keys(events) as EnquiryChangeType[]).find(key => events[key] === row.event)!;
      const nullable = (value: unknown) => value == null ? null : String(value);
      if (changeType === 'STATUS_CHANGED' && (![ 'NEW', 'IN_PROGRESS', 'CLOSED' ].includes(String(row.previous_status)) || ![ 'NEW', 'IN_PROGRESS', 'CLOSED' ].includes(String(row.new_status)))) throw new Error('UNSUPPORTED_STORED_HISTORY');
      return { id: String(row.id), enquiryId: String(row.enquiry_id), enquiryCode: String(row.enquiry_code), changeType, occurredAt: (row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at))).toISOString(), previousValue: changeType === 'STATUS_CHANGED' ? nullable(row.previous_status) : changeType === 'ASSIGNED' ? nullable(row.previous_owner) : null, newValue: changeType === 'STATUS_CHANGED' ? nullable(row.new_status) : changeType === 'ASSIGNED' ? nullable(row.new_owner) : null };
    }) };
  },
};
