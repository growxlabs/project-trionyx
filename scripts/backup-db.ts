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

const TABLES = [
  'users',
  'sessions',
  'audit_logs',
  'product_categories',
  'products',
  'product_specifications',
  'product_media',
  'inventory_locations',
  'serial_numbers',
  'serial_movements',
  'distributors',
  'dealers',
  'dealer_distributor_history',
  'dealer_requests',
  'dealer_request_messages',
  'internal_notes',
  'dealer_users',
  'dealer_sessions',
  'contact_enquiries',
  'enquiry_notes',
  'warranty_policies',
  'warranties'
];

async function backupSingleDatabase(label: string, dbUrl: string, backupDir: string) {
  console.log(`\n========================================`);
  console.log(` BACKING UP: ${label}`);
  console.log(` Target URL: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`========================================`);

  const client = getDbClient(dbUrl);
  await ensureDatabaseReady(client);

  const isPg = isPostgresUrl(dbUrl);
  const backupData: Record<string, any[]> = {};
  let totalRows = 0;

  for (const table of TABLES) {
    try {
      const res = await client.execute(`SELECT * FROM ${table}`);
      backupData[table] = res.rows || [];
      console.log(`  ✓ [${table}]: ${res.rows.length} rows`);
      totalRows += res.rows.length;
    } catch (err: any) {
      console.warn(`  ! Table [${table}] could not be queried:`, err.message);
      backupData[table] = [];
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `backup-${safeLabel}-${timestamp}.json`;
  const latestFilename = `backup-${safeLabel}-latest.json`;

  const backupPath = path.join(backupDir, filename);
  const latestPath = path.join(backupDir, latestFilename);

  const payload = {
    createdAt: new Date().toISOString(),
    label,
    totalRows,
    databaseUrlType: isPg ? 'PostgreSQL' : 'SQLite',
    tables: backupData,
  };

  fs.writeFileSync(backupPath, JSON.stringify(payload, null, 2), 'utf-8');
  fs.writeFileSync(latestPath, JSON.stringify(payload, null, 2), 'utf-8');

  console.log(`\n✅ ${label} successfully saved to:`);
  console.log(`   ${backupPath}`);
  console.log(`   Total records backed up: ${totalRows}`);
  return { backupPath, totalRows };
}

async function main() {
  const root = findMonorepoRoot();
  loadEnvFile(root);

  const backupDir = path.join(root, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Backup Supabase PostgreSQL if configured
  if (process.env.DATABASE_URL && isPostgresUrl(process.env.DATABASE_URL)) {
    await backupSingleDatabase('Supabase-PostgreSQL', process.env.DATABASE_URL, backupDir);
  }

  // 2. Backup Local SQLite (trionyx.db)
  const sqliteUrl = `file:${path.resolve(root, 'trionyx.db')}`;
  await backupSingleDatabase('Local-SQLite', sqliteUrl, backupDir);

  console.log('\n--- ALL BACKUPS COMPLETED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
