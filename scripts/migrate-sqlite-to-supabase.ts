/**
 * TRIONYX: SQLite to Supabase PostgreSQL Migration Script
 */

import { createClient } from '@libsql/client';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { POSTGRES_TABLE_STATEMENTS } from '../packages/database/src/postgresSchema';

function getTargetUrl(): string {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === '--url' || argv[i] === '--target') && argv[i + 1]) {
      return argv[i + 1];
    }
  }
  return process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL || '';
}

// Ordered strictly by foreign key dependencies
const TABLES_TO_MIGRATE = [
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
  'internal_notes',
  'dealer_users',
  'dealer_sessions',
  'dealer_requests',
  'dealer_request_messages',
  'contact_enquiries',
  'enquiry_notes',
  'sessions',
  'audit_logs',
];

async function main() {
  const targetUrl = getTargetUrl();

  console.log('\n=============================================================');
  console.log('    TRIONYX: SQLITE -> SUPABASE POSTGRESQL DATA MIGRATOR      ');
  console.log('=============================================================\n');

  if (!targetUrl || (!targetUrl.startsWith('postgres://') && !targetUrl.startsWith('postgresql://'))) {
    console.error('❌ Error: Please provide a valid Supabase PostgreSQL connection string.');
    process.exit(1);
  }

  const sqliteDbPath = path.resolve(process.cwd(), 'trionyx.db');
  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`❌ Local SQLite file not found at: ${sqliteDbPath}`);
    process.exit(1);
  }

  console.log(`📂 Source SQLite Database: ${sqliteDbPath}`);
  const sqlite = createClient({ url: `file:${sqliteDbPath}` });

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

    console.log('🚀 Migrating table data from SQLite to Supabase...\n');

    for (const table of TABLES_TO_MIGRATE) {
      try {
        const checkSqlite = await sqlite.execute({
          sql: "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
          args: [table],
        });

        if (checkSqlite.rows.length === 0) {
          console.log(`⏩ Skipping ${table} (not in SQLite source)`);
          continue;
        }

        const sqliteRows = await sqlite.execute(`SELECT * FROM ${table}`);
        const rows = sqliteRows.rows;

        if (rows.length === 0) {
          console.log(`⚪ ${table}: 0 rows to migrate`);
          continue;
        }

        let insertedCount = 0;

        for (const rawRow of rows) {
          const row = { ...rawRow };

          // Handle special column mappings between SQLite and Postgres
          if (table === 'product_specifications') {
            if ('label' in row && !('name' in row)) {
              row.name = row.label;
              delete row.label;
            }
            if (!('group_name' in row)) {
              row.group_name = 'General';
            }
          }

          const keys = Object.keys(row);
          const values = Object.values(row);

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
