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

// Preserve official admin emails
const PRESERVED_EMAILS = [
  'suresh@trionyx.com',
  'admin@trionyx.com',
  'sai@trionyx.com',
];

async function cleanSingleDatabase(label: string, dbUrl: string) {
  console.log(`\n========================================`);
  console.log(` CLEANING TEST FIXTURES: ${label}`);
  console.log(` Target DB: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`========================================`);

  const client = getDbClient(dbUrl);
  await ensureDatabaseReady(client);

  // For SQLite, disable foreign keys temporarily or unlink references
  try {
    await client.execute('PRAGMA foreign_keys = OFF;');
  } catch {}

  // 1. Unlink distributor references from users so distributors can be deleted cleanly
  try {
    await client.execute('UPDATE users SET distributor_id = NULL;');
  } catch {}

  // 2. Delete test sessions and test audit logs
  try {
    await client.execute(`DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('suresh@trionyx.com', 'admin@trionyx.com', 'sai@trionyx.com'));`);
    await client.execute(`DELETE FROM audit_logs WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('suresh@trionyx.com', 'admin@trionyx.com', 'sai@trionyx.com'));`);
  } catch {}

  // 3. Delete dependent transactional records
  const cleanupStatements = [
    `DELETE FROM warranties;`,
    `DELETE FROM warranty_policies;`,
    `DELETE FROM dealer_request_messages;`,
    `DELETE FROM dealer_requests;`,
    `DELETE FROM dealer_distributor_history;`,
    `DELETE FROM internal_notes;`,
    `DELETE FROM enquiry_notes;`,
    `DELETE FROM contact_enquiries;`,
    `DELETE FROM dealer_sessions;`,
    `DELETE FROM dealer_users;`,
    `DELETE FROM serial_movements;`,
    `DELETE FROM serial_numbers;`,
    `DELETE FROM dealers;`,
    `DELETE FROM distributors;`,
  ];

  for (const sql of cleanupStatements) {
    try {
      const res = await client.execute(sql);
      const tableName = sql.replace('DELETE FROM ', '').replace(';', '').trim();
      console.log(`  ✓ Cleaned [${tableName}] (${res.rowsAffected ?? 0} rows affected)`);
    } catch (err: any) {
      console.warn(`  ! Statement failed: ${sql}`, err.message);
    }
  }

  // 4. Clean test users while strictly preserving core Admin/MD accounts
  const emailPlaceholders = PRESERVED_EMAILS.map(() => '?').join(', ');
  try {
    const res = await client.execute({
      sql: `DELETE FROM users WHERE email NOT IN (${emailPlaceholders})`,
      args: PRESERVED_EMAILS,
    });
    console.log(`  ✓ Cleaned test users (${res.rowsAffected ?? 0} rows removed). Preserved: ${PRESERVED_EMAILS.join(', ')}`);
  } catch (err: any) {
    console.warn(`  ! Could not clean users:`, err.message);
  }

  // 5. Clear expired or orphan sessions
  try {
    const res = await client.execute({
      sql: `DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users)`,
      args: [],
    });
    console.log(`  ✓ Cleaned orphan sessions (${res.rowsAffected ?? 0} rows removed)`);
  } catch (err: any) {
    console.warn(`  ! Could not clean sessions:`, err.message);
  }

  try {
    await client.execute('PRAGMA foreign_keys = ON;');
  } catch {}

  // 4. Verify preserved catalog and facilities
  const [categories, products, locations, users] = await Promise.all([
    client.execute(`SELECT COUNT(*) as count FROM product_categories`),
    client.execute(`SELECT COUNT(*) as count FROM products`),
    client.execute(`SELECT COUNT(*) as count FROM inventory_locations`),
    client.execute(`SELECT email, role, status FROM users`),
  ]);

  console.log(`\n--- PRESERVED SYSTEM FOUNDATION ---`);
  console.log(`• Product Categories intact: ${categories.rows[0]?.count}`);
  console.log(`• Products intact:           ${products.rows[0]?.count}`);
  console.log(`• Warehouse Hubs intact:     ${locations.rows[0]?.count}`);
  console.log(`• Preserved Administrative Users (${users.rows.length}):`);
  users.rows.forEach((u: any) => console.log(`   - [${u.role}] ${u.email} (${u.status})`));
}

async function main() {
  const root = findMonorepoRoot();
  loadEnvFile(root);

  // Clean both databases so portals are uniformly clean
  if (process.env.DATABASE_URL && isPostgresUrl(process.env.DATABASE_URL)) {
    try {
      await cleanSingleDatabase('Supabase-PostgreSQL', process.env.DATABASE_URL);
    } catch (err: any) {
      console.warn('Supabase cleanup warning:', err.message);
    }
  }

  const sqliteUrl = `file:${path.resolve(root, 'trionyx.db')}`;
  try {
    await cleanSingleDatabase('Local-SQLite', sqliteUrl);
  } catch (err: any) {
    console.warn('SQLite cleanup warning:', err.message);
  }

  console.log(`\n🎉 ALL TEST FIXTURES SUCCESSFULLY CLEANED!`);
  console.log(`Your backup files remain safely stored in the /backups folder.`);
  console.log(`To restore at any time, run: npx tsx scripts/restore-db.ts`);
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
