import * as fs from 'fs';
import * as path from 'path';
import { getDbClient, ensureDatabaseReady, isPostgresUrl, findMonorepoRoot } from '@trionyx/database';

function loadEnvFile(root: string) {
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

// Ordered strictly by dependency hierarchy
const RESTORE_TABLE_ORDER = [
  'users',
  'product_categories',
  'inventory_locations',
  'distributors',
  'dealers',
  'products',
  'product_specifications',
  'product_media',
  'serial_numbers',
  'serial_movements',
  'dealer_distributor_history',
  'dealer_requests',
  'dealer_request_messages',
  'internal_notes',
  'dealer_users',
  'dealer_sessions',
  'contact_enquiries',
  'enquiry_notes',
  'warranty_policies',
  'warranties',
  'sessions',
  'audit_logs',
];

async function restoreFromBackup(backupFilePath: string, targetUrl: string) {
  console.log(`\n========================================`);
  console.log(` RESTORING FROM: ${backupFilePath}`);
  console.log(` Target DB: ${targetUrl.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`========================================`);

  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file does not exist: ${backupFilePath}`);
  }

  const raw = fs.readFileSync(backupFilePath, 'utf-8');
  const backup = JSON.parse(raw);
  const tables = backup.tables || {};

  const client = getDbClient(targetUrl);
  await ensureDatabaseReady(client);

  let totalRestored = 0;

  for (const tableName of RESTORE_TABLE_ORDER) {
    const rows = tables[tableName] || [];
    if (rows.length === 0) continue;

    console.log(`- Restoring [${tableName}] (${rows.length} records)...`);
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

      try {
        await client.execute({ sql, args: values });
        totalRestored++;
      } catch (err: any) {
        // Fallback for PG conflict
        try {
          const pgSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          await client.execute({ sql: pgSql, args: values });
          totalRestored++;
        } catch (innerErr: any) {
          console.warn(`  ! Could not insert row in ${tableName}:`, innerErr.message);
        }
      }
    }
  }

  console.log(`\n✅ Restore complete. Restored ${totalRestored} records into database.`);
}

async function main() {
  const root = findMonorepoRoot();
  loadEnvFile(root);

  const backupDir = path.join(root, 'backups');
  const targetMode = process.argv[2] || 'sqlite'; // 'sqlite' or 'postgres'

  if (targetMode === 'postgres') {
    if (!process.env.DATABASE_URL || !isPostgresUrl(process.env.DATABASE_URL)) {
      throw new Error('DATABASE_URL not configured for PostgreSQL');
    }
    const backupFile = path.join(backupDir, 'backup-supabase-postgresql-latest.json');
    await restoreFromBackup(backupFile, process.env.DATABASE_URL);
  } else {
    const sqliteUrl = `file:${path.resolve(root, 'trionyx.db')}`;
    const backupFile = path.join(backupDir, 'backup-local-sqlite-latest.json');
    await restoreFromBackup(backupFile, sqliteUrl);
  }
}

main().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
