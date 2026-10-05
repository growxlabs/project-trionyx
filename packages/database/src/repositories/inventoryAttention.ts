import type { Client } from '@libsql/client';
import { getDbClient } from '../db';
// Shared with the canonical inventory exception reader. No new thresholds.
export const inventoryExceptionSources = {
  ZERO_AVAILABLE_STOCK: `SELECT p.id, p.name, p.product_code FROM products p WHERE p.status='ACTIVE' AND NOT EXISTS (SELECT 1 FROM serial_numbers s WHERE s.product_id=p.id AND s.status='AVAILABLE')`,
  INACTIVE_LOCATION_STOCK: `SELECT l.id, l.name, l.code, COUNT(s.id) AS count FROM inventory_locations l JOIN serial_numbers s ON s.location_id=l.id WHERE l.status='INACTIVE' AND s.status='AVAILABLE' GROUP BY l.id,l.name,l.code`,
  ORPHAN_SERIAL_LOCATION: `SELECT s.id, s.serial_number, s.location_id FROM serial_numbers s LEFT JOIN inventory_locations l ON s.location_id=l.id WHERE l.id IS NULL`,
};
export async function readInventoryAttention(limit = 5, client: Client = getDbClient()) {
  const source = Object.entries(inventoryExceptionSources).map(([rule, sql]) => `SELECT id AS record_id, '${rule}' AS rule FROM (${sql}) records`).join(' UNION ALL ');
  const total = await client.execute(`SELECT COUNT(*) AS count FROM (${source}) conditions`);
  const rows = await client.execute({ sql: `SELECT * FROM (${source}) conditions ORDER BY rule,record_id LIMIT ?`, args: [Math.min(50, Math.max(1, limit))] });
  return { total: Number(total.rows[0].count), items: rows.rows.map(row => ({ recordId: String(row.record_id), rule: String(row.rule), severity: row.rule === 'ZERO_AVAILABLE_STOCK' ? 'WARNING' as const : 'CRITICAL' as const })) };
}
