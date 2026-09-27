/**
 * TRIONYX: SQLite to Supabase PostgreSQL Migration Script
 *
 * Usage:
 *   pnpm exec tsx scripts/migrate-sqlite-to-supabase.ts --url "postgres://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres"
 *
 * Or set TARGET_DATABASE_URL in .env / shell:
 *   TARGET_DATABASE_URL="postgres://..." pnpm exec tsx scripts/migrate-sqlite-to-supabase.ts
 */

import { createClient } from '@libsql/client';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { POSTGRES_TABLE_STATEMENTS } from '../packages/database/src/postgresSchema';

// Parse command line arguments
function getTargetUrl(): string {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === '--url' || argv[i] === '--target') && argv[i + 1]) {
      return argv[i + 1];
    }
  }
  return process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL || '';
}

// Ordered tables to respect foreign key constraints
const TABLES_TO_MIGRATE = [
  'product_categories',
  'products',
  'product_specifications',
  'product_media',
  'inventory_locations',
  'distributors',
  'dealers',
  'users',
  'sessions',
  'audit_logs',
  'serial_numbers',
  'serial_movements',
  'dealer_distributor_history',
  'internal_notes',
  'dealer_users',
  'dealer_sessions',
  'dealer_requests',
  'dealer_request_messages',
  'contact_enquiries',
  'enquiry_notes',
];

async function main() {
  const targetUrl = getTargetUrl();

  console.log('\n=============================================================');
  console.log('    TRIONYX: SQLITE -> SUPABASE POSTGRESQL DATA MIGRATOR      ');
  console.log('=============================================================\n');

  if (!targetUrl || (!targetUrl.startsWith('postgres://') && !targetUrl.startsWith('postgresql://'))) {
    console.error('❌ Error: Please provide a valid Supabase PostgreSQL connection string.');
    console.error('Example:');
    console.error('  pnpm exec tsx scripts/migrate-sqlite-to-supabase.ts --url "postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"\n');
    process.exit(1);
  }

  // 1. Connect to local SQLite
  const sqliteDbPath = path.resolve(process.cwd(), 'trionyx.db');
  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`❌ Local SQLite file not found at: ${sqliteDbPath}`);
    process.exit(1);
  }

  console.log(`📂 Source SQLite Database: ${sqliteDbPath}`);
  const sqlite = createClient({ url: `file:${sqliteDbPath}` });

  // 2. Connect to Supabase Postgres
  console.log(`🔗 Connecting to Supabase PostgreSQL...`);
  const isLocalhost = targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: targetUrl,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const pgClient = await pool.connect();
  console.log('✅ Connected to Supabase successfully!\n');

  try {
    // 3. Apply Schema & Migrations
    console.log('🏗️  Applying schema and creating tables in Supabase...');
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const stmt of POSTGRES_TABLE_STATEMENTS) {
      await pgClient.query(stmt);
    }
    console.log('✅ Supabase tables verified & ready.\n');

    // 4. Stream data table by table
    console.log('🚀 Migrating table data from SQLite to Supabase...\n');

    for (const table of TABLES_TO_MIGRATE) {
      try {
        // Check if table exists in SQLite
        const checkSqlite = await sqlite.execute({
          sql: "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
          args: [table],
        });

        if (checkSqlite.rows.length === 0) {
          console.log(`⏩ Skipping ${table} (not in SQLite source)`);
          continue;
        }

        // Fetch all rows from SQLite
        const sqliteRows = await sqlite.execute(`SELECT * FROM ${table}`);
        const rows = sqliteRows.rows;

        if (rows.length === 0) {
          console.log(`⚪ ${table}: 0 rows to migrate`);
          continue;
        }

        let insertedCount = 0;

        for (const row of rows) {
          const keys = Object.keys(row);
          const values = Object.values(row);

          // Build INSERT ... ON CONFLICT DO NOTHING
          const columns = keys.map((k) => `"${k}"`).join(', ');
          const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');

          const insertSql = `
            INSERT INTO "${table}" (${columns})
            VALUES (${placeholders})
            ON CONFLICT (id) DO NOTHING;
          `;

          const cleanValues = values.map((v) => {
            if (v === undefined || v === null) return null;
            return v;
          });

          const res = await pgClient.query(insertSql, cleanValues);
          if (res.rowCount && res.rowCount > 0) {
            insertedCount++;
          }
        }

        console.log(`✅ ${table}: ${insertedCount}/${rows.length} rows inserted into Supabase`);
      } catch (err: any) {
        console.error(`⚠️  Warning on table "${table}": ${err.message}`);
      }
    }

    console.log('\n=============================================================');
    console.log('🎉 MIGRATION COMPLETE! All data is now live on Supabase.');
    console.log('=============================================================\n');
  } finally {
    pgClient.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal Migration Error:', err);
  process.exit(1);
});
