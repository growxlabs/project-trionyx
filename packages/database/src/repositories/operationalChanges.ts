import type { Client, InValue } from '@libsql/client';
import { getDbClient, getDatabaseUrl, isPostgresUrl } from '../db';
import { isoTimestamp } from './warrantyReads';
export type OperationalModule = 'inventory' | 'dealers' | 'distributors' | 'enquiries' | 'warranties';
export type ChangeFilter = { from: string; to: string; module?: OperationalModule; page?: number; limit?: number };
const auditSources = [
  ['warranties', 'warrantyId', ['WARRANTY_ACTIVATED', 'WARRANTY_VOIDED']],
  ['enquiries', 'enquiryId', ['CONTACT_ENQUIRY_CREATED', 'CONTACT_ENQUIRY_STATUS_CHANGED', 'CONTACT_ENQUIRY_ASSIGNED', 'CONTACT_ENQUIRY_NOTE_ADDED']],
  ['dealers', 'dealerId', ['DEALER_CREATED', 'DEALER_UPDATED', 'DEALER_STATUS_CHANGED']],
  ['distributors', 'distributorId', ['DISTRIBUTOR_CREATED', 'DISTRIBUTOR_UPDATED', 'DISTRIBUTOR_STATUS_CHANGED']],
] as const;
export const operationalChangesRepository = {
  async list(filter: ChangeFilter, client: Client = getDbClient(), postgres = isPostgresUrl(getDatabaseUrl())) {
    const field = (name: string) => postgres ? `(a.metadata::jsonb ->> '${name}')` : `json_extract(CASE WHEN json_valid(a.metadata) THEN a.metadata ELSE '{}' END,'$.${name}')`;
    const args: InValue[] = []; const sources: string[] = [];
    if (!filter.module || filter.module === 'inventory') {
      sources.push("SELECT 'inventory:' || id AS id, 'inventory' AS module, serial_record_id AS record_id, type AS event, created_at AS occurred_at FROM serial_movements WHERE created_at >= ? AND created_at <= ?"); args.push(filter.from, filter.to);
    }
    if (!filter.module || filter.module === 'dealers') {
      sources.push("SELECT 'assignment:' || id AS id, 'dealers' AS module, dealer_id AS record_id, 'DEALER_DISTRIBUTOR_ASSIGNED' AS event, changed_at AS occurred_at FROM dealer_distributor_history WHERE changed_at >= ? AND changed_at <= ?"); args.push(filter.from, filter.to);
    }
    for (const [module, idField, events] of auditSources) {
      if (filter.module && filter.module !== module) continue;
      // Fail closed for malformed selected audit metadata rather than silently omit records.
      if (!postgres) {
        const invalid = await client.execute({ sql: `SELECT COUNT(*) AS count FROM audit_logs WHERE event IN (${events.map(() => '?').join(',')}) AND created_at>=? AND created_at<=? AND (metadata IS NULL OR NOT json_valid(metadata))`, args: [...events, filter.from, filter.to] });
        if (Number(invalid.rows[0].count)) throw new Error('INVALID_STORED_HISTORY');
      }
      sources.push(`SELECT 'audit:' || a.id AS id, '${module}' AS module, ${field(idField)} AS record_id, a.event AS event, a.created_at AS occurred_at FROM audit_logs a WHERE a.event IN (${events.map(() => '?').join(',')}) AND a.created_at>=? AND a.created_at<=?`);
      args.push(...events, filter.from, filter.to);
    }
    const source = sources.join(' UNION ALL ');
    const invalidIds = await client.execute({ sql: `SELECT COUNT(*) AS count FROM (${source}) events WHERE record_id IS NULL OR TRIM(record_id)=''`, args });
    if (Number(invalidIds.rows[0].count)) throw new Error('MISSING_STORED_EVENT_ID');
    const total = await client.execute({ sql: `SELECT COUNT(*) AS count FROM (${source}) events`, args });
    const page = Math.max(1, filter.page ?? 1), limit = Math.min(50, Math.max(1, filter.limit ?? 20));
    const rows = await client.execute({ sql: `SELECT * FROM (${source}) events ORDER BY occurred_at DESC,id DESC LIMIT ? OFFSET ?`, args: [...args, limit, (page - 1) * limit] });
    return { total: Number(total.rows[0].count), items: rows.rows.map(row => {
      if (!row.record_id) throw new Error('MISSING_STORED_EVENT_ID');
      return { id: String(row.id), module: row.module as OperationalModule, recordId: String(row.record_id), event: String(row.event), occurredAt: isoTimestamp(row.occurred_at) };
    }) };
  },
};
