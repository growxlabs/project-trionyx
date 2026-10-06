import { createClient, type Client } from '@libsql/client';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { POSTGRES_TABLE_STATEMENTS } from './postgresSchema';
import { TRIX_TABLE_STATEMENTS } from './trixSchema';
import {SUPABASE_PROD_CA} from './supabaseCa';

let globalClient: Client | null = null;
let globalPostgresAdapter: PostgresClientAdapter | null = null;
let migrationPromise: Promise<void> | null = null;

export function isPostgresUrl(url: string): boolean {
  return url.startsWith('postgres://') || url.startsWith('postgresql://');
}

export function translateSqliteToPostgres(sql: string): string {
  let paramIndex = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let result = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const prev = i > 0 ? sql[i - 1] : '';

    if (char === "'" && prev !== '\\') {
      inSingleQuote = !inSingleQuote;
      result += char;
    } else if (char === '"' && prev !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      result += char;
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      result += `$${paramIndex++}`;
    } else {
      result += char;
    }
  }

  return result
    .replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/PRAGMA[^;]+;/gi, '')
    .replace(/\bLIKE\b/g, 'ILIKE');
}

export class PostgresClientAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    const parsedConnection = new URL(connectionString);
    const isLocalhost = ['localhost','127.0.0.1','[::1]'].includes(parsedConnection.hostname);
    const trustedCa=process.env.TRIONYX_DATABASE_CA_PEM??(/\.(?:pooler\.supabase\.com|supabase\.co)$/.test(parsedConnection.hostname)?SUPABASE_PROD_CA:undefined);
    // URL SSL flags must not override certificate verification. Trust an explicit CA when required.
    for(const option of ['sslmode','sslcert','sslkey','sslrootcert'])parsedConnection.searchParams.delete(option);
    this.pool = new Pool({
      connectionString: parsedConnection.toString(),
      ssl: isLocalhost ? false : { rejectUnauthorized: true, ...(trustedCa ? {ca:trustedCa} : {}) },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  async execute(statement: string | { sql: string; args?: unknown[] }): Promise<{ rows: any[]; rowsAffected: number; columns: string[] }> {
    const rawSql = typeof statement === 'string' ? statement : statement.sql;
    const args = typeof statement === 'string' ? [] : (statement.args || []);

    const pgSql = translateSqliteToPostgres(rawSql);
    if (!pgSql.trim()) {
      return { rows: [], rowsAffected: 0, columns: [] };
    }
    const res = await this.pool.query(pgSql, args as any[]);
    return {
      rows: res.rows || [],
      rowsAffected: res.rowCount ?? 0,
      columns: res.fields ? res.fields.map((f) => f.name) : [],
    };
  }

  async batch(statements: Array<string | { sql: string; args?: unknown[] }>, _mode: string = 'write'): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const stmt of statements) {
        const rawSql = typeof stmt === 'string' ? stmt : stmt.sql;
        const args = typeof stmt === 'string' ? [] : (stmt.args || []);
        const pgSql = translateSqliteToPostgres(rawSql);
        if (pgSql.trim()) {
          const res = await client.query(pgSql, args as any[]);
          results.push({
            rows: res.rows || [],
            rowsAffected: res.rowCount ?? 0,
            columns: res.fields ? res.fields.map((f) => f.name) : [],
          });
        }
      }
      await client.query('COMMIT');
      return results;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async withTransaction<T>(run: (client: Client) => Promise<T>): Promise<T> {
    const connection = await this.pool.connect();
    const execute = async (statement: string | { sql: string; args?: unknown[] }) => {
      const sql = typeof statement === 'string' ? statement : statement.sql;
      const args = typeof statement === 'string' ? [] : statement.args ?? [];
      const result = await connection.query(translateSqliteToPostgres(sql), args);
      return { rows: result.rows, rowsAffected: result.rowCount ?? 0, columns: result.fields.map(field => field.name) };
    };
    const client = { execute, batch: async (statements: Array<string | {sql:string;args?:unknown[]}>) => {
      const results = []; for (const statement of statements) results.push(await execute(statement)); return results;
    } } as unknown as Client;
    try { await connection.query('BEGIN'); const result = await run(client); await connection.query('COMMIT'); return result; }
    catch (error) { await connection.query('ROLLBACK'); throw error; }
    finally { connection.release(); }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export function findMonorepoRoot(startDir: string = process.cwd()): string {
  let curr = path.resolve(startDir);
  while (curr && curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, 'pnpm-workspace.yaml'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return startDir;
}

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Always locate trionyx.db in the monorepo root
  const root = findMonorepoRoot();
  const dbPath = path.resolve(root, 'trionyx.db');
  return `file:${dbPath}`;
}

export function getDbClient(customUrl?: string): Client {
  const url = customUrl || getDatabaseUrl();
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (isPostgresUrl(url)) {
    if (!globalPostgresAdapter) {
      globalPostgresAdapter = new PostgresClientAdapter(url);
    }
    return globalPostgresAdapter as unknown as Client;
  }

  if (customUrl) {
    return createClient({ url: customUrl, ...(authToken ? { authToken } : {}) });
  }
  if (!globalClient) {
    globalClient = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
  }
  return globalClient;
}

export async function ensureDatabaseReady(client: Client = getDbClient()): Promise<Client> {
  if (!migrationPromise) {
    migrationPromise = runMigrations(client);
  }
  await migrationPromise;
  await ensureTrixSchema(client);
  return client;
}

let trixSchemaPromise: Promise<void> | null = null;
async function ensureTrixSchema(client: Client): Promise<void> {
  if (!trixSchemaPromise) {
    trixSchemaPromise = (async () => {
      for (const statement of TRIX_TABLE_STATEMENTS) await client.execute(statement);
      if (isPostgresUrl(getDatabaseUrl())) {
        // No public Supabase policy: these tables are accessible only through the server DB role.
        for (const table of ['trix_prepared_actions', 'trix_request_limits', 'trix_conversations', 'trix_messages']) await client.execute(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      }
    })().catch((error) => { trixSchemaPromise = null; throw error; });
  }
  await trixSchemaPromise;
}

export async function runPostgresMigrations(client: Client = getDbClient()): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const check = await client.execute({
    sql: 'SELECT name FROM _migrations WHERE name = ?',
    args: ['0010_warranties_and_policies'],
  });

  if (check.rows.length === 0) {
    for (const stmt of POSTGRES_TABLE_STATEMENTS) {
      await client.execute(stmt);
    }
  }
}

export async function runMigrations(client: Client = getDbClient()): Promise<void> {
  const url = getDatabaseUrl();
  if (isPostgresUrl(url)) {
    await runPostgresMigrations(client);
    return;
  }

  // Configure SQLite journal mode and busy timeout for concurrent safety
  try {
    await client.execute('PRAGMA journal_mode = WAL;');
    await client.execute('PRAGMA busy_timeout = 5000;');
    await client.execute('PRAGMA synchronous = NORMAL;');
  } catch {
    // Silently continue if pragma is unsupported
  }

  // Ensure migration tracking table exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Check if initial schema migration has been applied
  const existing = await client.execute({
    sql: 'SELECT name FROM _migrations WHERE name = ?',
    args: ['0001_initial_auth_schema'],
  });

  if (existing.rows.length === 0) {
    // Run initial schema migration
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          last_login_at TEXT,
          failed_login_count INTEGER NOT NULL DEFAULT 0,
          locked_until TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
        `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
        `CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`,
        `CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);`,
        `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);`,
        `CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          event TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          metadata TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);`,
        `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`,
        {
          sql: 'INSERT INTO _migrations (name) VALUES (?)',
          args: ['0001_initial_auth_schema'],
        },
      ],
      'write'
    );
  }

  // Check if products and inventory migration has been applied
  const existingProductsMigration = await client.execute({
    sql: 'SELECT name FROM _migrations WHERE name = ?',
    args: ['0002_products_and_inventory'],
  });

  if (existingProductsMigration.rows.length === 0) {
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS product_categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);`,
        `CREATE INDEX IF NOT EXISTS idx_product_categories_status ON product_categories(status);`,

        `CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          product_code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          category_id TEXT NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
          short_description TEXT,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED')),
          public_visibility TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (public_visibility IN ('PRIVATE', 'PUBLIC')),
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);`,
        `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);`,
        `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);`,
        `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`,
        `CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(public_visibility);`,

        `CREATE TABLE IF NOT EXISTS product_variants (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
          sku TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          pack_size TEXT,
          unit TEXT,
          barcode TEXT,
          status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);`,
        `CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);`,
        `CREATE INDEX IF NOT EXISTS idx_variants_status ON product_variants(status);`,

        `CREATE TABLE IF NOT EXISTS product_specifications (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          label TEXT NOT NULL,
          value TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0
        );`,
        `CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specifications(product_id);`,

        `CREATE TABLE IF NOT EXISTS product_media (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('IMAGE', 'DOCUMENT')),
          storage_path TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          alt_text TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media(product_id);`,

        `CREATE TABLE IF NOT EXISTS inventory_locations (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_inventory_locations_code ON inventory_locations(code);`,
        `CREATE INDEX IF NOT EXISTS idx_inventory_locations_status ON inventory_locations(status);`,

        `CREATE TABLE IF NOT EXISTS inventory_items (
          id TEXT PRIMARY KEY,
          variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
          location_id TEXT NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
          on_hand INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
          reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
          reorder_level INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(variant_id, location_id)
        );`,
        `CREATE INDEX IF NOT EXISTS idx_inventory_items_variant ON inventory_items(variant_id);`,
        `CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location_id);`,

        `CREATE TABLE IF NOT EXISTS stock_movements (
          id TEXT PRIMARY KEY,
          movement_code TEXT NOT NULL UNIQUE,
          variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
          location_id TEXT NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
          type TEXT NOT NULL CHECK (type IN ('OPENING_BALANCE', 'RECEIVE', 'ADJUST_INCREASE', 'ADJUST_DECREASE', 'TRANSFER_IN', 'TRANSFER_OUT')),
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          quantity_before INTEGER NOT NULL CHECK (quantity_before >= 0),
          quantity_after INTEGER NOT NULL CHECK (quantity_after >= 0),
          reason TEXT,
          reference TEXT,
          notes TEXT,
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);`,
        `CREATE INDEX IF NOT EXISTS idx_stock_movements_location ON stock_movements(location_id);`,
        `CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);`,
        `CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);`,
        `CREATE INDEX IF NOT EXISTS idx_stock_movements_code ON stock_movements(movement_code);`,

        {
          sql: 'INSERT INTO _migrations (name) VALUES (?)',
          args: ['0002_products_and_inventory'],
        },
      ],
      'write'
    );
  }

  // Check if serial number inventory migration has been applied
  const existingSerialMigration = await client.execute({
    sql: 'SELECT name FROM _migrations WHERE name = ?',
    args: ['0003_serial_number_inventory'],
  });

  if (existingSerialMigration.rows.length === 0) {
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS serial_numbers (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
          serial_number TEXT NOT NULL UNIQUE,
          location_id TEXT NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
          status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'TRANSFERRED', 'INACTIVE')),
          received_at TEXT NOT NULL DEFAULT (datetime('now')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_serial_numbers_sn ON serial_numbers(serial_number);`,
        `CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON serial_numbers(product_id);`,
        `CREATE INDEX IF NOT EXISTS idx_serial_numbers_location ON serial_numbers(location_id);`,
        `CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);`,

        `CREATE TABLE IF NOT EXISTS serial_movements (
          id TEXT PRIMARY KEY,
          serial_record_id TEXT NOT NULL REFERENCES serial_numbers(id) ON DELETE CASCADE,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
          type TEXT NOT NULL CHECK (type IN ('RECEIVED', 'TRANSFERRED', 'ADJUSTED')),
          from_location_id TEXT REFERENCES inventory_locations(id) ON DELETE SET NULL,
          to_location_id TEXT REFERENCES inventory_locations(id) ON DELETE SET NULL,
          reference TEXT,
          reason TEXT,
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_serial_movements_record ON serial_movements(serial_record_id);`,
        `CREATE INDEX IF NOT EXISTS idx_serial_movements_product ON serial_movements(product_id);`,
        `CREATE INDEX IF NOT EXISTS idx_serial_movements_type ON serial_movements(type);`,
        `CREATE INDEX IF NOT EXISTS idx_serial_movements_created ON serial_movements(created_at);`,

        `DROP TABLE IF EXISTS inventory_items;`,
        `DROP TABLE IF EXISTS stock_movements;`,
        `DROP TABLE IF EXISTS product_variants;`,

        {
          sql: 'INSERT INTO _migrations (name) VALUES (?)',
          args: ['0003_serial_number_inventory'],
        },
      ],
      'write'
    );
  }

  // Check if dealers and distributors migration has been applied
  const existingDealersMigration = await client.execute({
    sql: 'SELECT name FROM _migrations WHERE name = ?',
    args: ['0004_dealers_distributors'],
  });

  if (existingDealersMigration.rows.length === 0) {
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS distributors (
          id TEXT PRIMARY KEY,
          distributor_code TEXT NOT NULL UNIQUE,
          business_name TEXT NOT NULL,
          legal_name TEXT,
          contact_person TEXT NOT NULL,
          phone TEXT NOT NULL,
          alternate_phone TEXT,
          email TEXT,
          address_line1 TEXT,
          address_line2 TEXT,
          city TEXT NOT NULL,
          district TEXT,
          state TEXT NOT NULL,
          postal_code TEXT,
          country TEXT NOT NULL DEFAULT 'India',
          territory TEXT,
          status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
          gstin TEXT,
          notes TEXT,
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          updated_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_distributors_code ON distributors(distributor_code);`,
        `CREATE INDEX IF NOT EXISTS idx_distributors_name ON distributors(business_name);`,
        `CREATE INDEX IF NOT EXISTS idx_distributors_status ON distributors(status);`,
        `CREATE INDEX IF NOT EXISTS idx_distributors_state ON distributors(state);`,
        `CREATE INDEX IF NOT EXISTS idx_distributors_phone ON distributors(phone);`,
        `CREATE INDEX IF NOT EXISTS idx_distributors_email ON distributors(email);`,

        `CREATE TABLE IF NOT EXISTS dealers (
          id TEXT PRIMARY KEY,
          dealer_code TEXT NOT NULL UNIQUE,
          business_name TEXT NOT NULL,
          legal_name TEXT,
          contact_person TEXT NOT NULL,
          phone TEXT NOT NULL,
          alternate_phone TEXT,
          email TEXT,
          address_line1 TEXT,
          address_line2 TEXT,
          city TEXT NOT NULL,
          district TEXT,
          state TEXT NOT NULL,
          postal_code TEXT,
          country TEXT NOT NULL DEFAULT 'India',
          distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
          gstin TEXT,
          notes TEXT,
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          updated_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_code ON dealers(dealer_code);`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_distributor ON dealers(distributor_id);`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_name ON dealers(business_name);`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_state ON dealers(state);`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_city ON dealers(city);`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_phone ON dealers(phone);`,
        `CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealers(email);`,

        `CREATE TABLE IF NOT EXISTS dealer_distributor_history (
          id TEXT PRIMARY KEY,
          dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
          previous_distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
          new_distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
          reason TEXT,
          changed_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          changed_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_history_dealer ON dealer_distributor_history(dealer_id);`,
        `CREATE INDEX IF NOT EXISTS idx_history_prev_dst ON dealer_distributor_history(previous_distributor_id);`,
        `CREATE INDEX IF NOT EXISTS idx_history_new_dst ON dealer_distributor_history(new_distributor_id);`,
        `CREATE INDEX IF NOT EXISTS idx_history_date ON dealer_distributor_history(changed_at);`,

        `CREATE TABLE IF NOT EXISTS dealer_requests (
          id TEXT PRIMARY KEY,
          request_code TEXT NOT NULL UNIQUE,
          dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('PRODUCT_ENQUIRY', 'AVAILABILITY', 'GENERAL_SUPPORT', 'OTHER')),
          subject TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
          priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
          assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          resolved_at TEXT
        );`,
        `CREATE INDEX IF NOT EXISTS idx_requests_code ON dealer_requests(request_code);`,
        `CREATE INDEX IF NOT EXISTS idx_requests_dealer ON dealer_requests(dealer_id);`,
        `CREATE INDEX IF NOT EXISTS idx_requests_status ON dealer_requests(status);`,
        `CREATE INDEX IF NOT EXISTS idx_requests_type ON dealer_requests(type);`,

        `CREATE TABLE IF NOT EXISTS internal_notes (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL CHECK (entity_type IN ('DEALER', 'DISTRIBUTOR')),
          entity_id TEXT NOT NULL,
          body TEXT NOT NULL,
          created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_internal_notes_target ON internal_notes(entity_type, entity_id);`,
        `CREATE INDEX IF NOT EXISTS idx_internal_notes_date ON internal_notes(created_at);`,

        {
          sql: 'INSERT INTO _migrations (name) VALUES (?)',
          args: ['0004_dealers_distributors'],
        },
      ],
      'write'
    );

    // Safely add distributor_id to users if not present
    try {
      await client.execute('ALTER TABLE users ADD COLUMN distributor_id TEXT REFERENCES distributors(id);');
    } catch {
      // Column might already exist
    }
  }

  // Check if dealer portal migration has been applied
  const existingDealerPortalMigration = await client.execute({
    sql: 'SELECT name FROM _migrations WHERE name = ?',
    args: ['0005_dealer_portal'],
  });

  if (existingDealerPortalMigration.rows.length === 0) {
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS dealer_users (
          id TEXT PRIMARY KEY,
          dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT,
          status TEXT NOT NULL DEFAULT 'INVITED' CHECK (status IN ('INVITED', 'ACTIVE', 'DISABLED')),
          invitation_token_hash TEXT,
          invitation_expires_at TEXT,
          reset_token_hash TEXT,
          reset_expires_at TEXT,
          failed_login_count INTEGER NOT NULL DEFAULT 0,
          locked_until TEXT,
          last_login_at TEXT,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_dealer_users_email ON dealer_users(email);`,
        `CREATE INDEX IF NOT EXISTS idx_dealer_users_dealer ON dealer_users(dealer_id);`,
        `CREATE INDEX IF NOT EXISTS idx_dealer_users_status ON dealer_users(status);`,
        `CREATE INDEX IF NOT EXISTS idx_dealer_users_invite ON dealer_users(invitation_token_hash);`,
        `CREATE INDEX IF NOT EXISTS idx_dealer_users_reset ON dealer_users(reset_token_hash);`,

        `CREATE TABLE IF NOT EXISTS dealer_sessions (
          id TEXT PRIMARY KEY,
          dealer_user_id TEXT NOT NULL REFERENCES dealer_users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_dealer_sessions_token_hash ON dealer_sessions(token_hash);`,
        `CREATE INDEX IF NOT EXISTS idx_dealer_sessions_user ON dealer_sessions(dealer_user_id);`,

        `CREATE TABLE IF NOT EXISTS dealer_request_messages (
          id TEXT PRIMARY KEY,
          request_id TEXT NOT NULL REFERENCES dealer_requests(id) ON DELETE CASCADE,
          sender_type TEXT NOT NULL CHECK (sender_type IN ('DEALER', 'INTERNAL')),
          sender_id TEXT NOT NULL,
          sender_name TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );`,
        `CREATE INDEX IF NOT EXISTS idx_drm_request ON dealer_request_messages(request_id);`,
        `CREATE INDEX IF NOT EXISTS idx_drm_created ON dealer_request_messages(created_at);`,

        {
          sql: 'INSERT INTO _migrations (name) VALUES (?)',
          args: ['0005_dealer_portal'],
        },
      ],
      'write'
    );

    // Safely add product_id to dealer_requests
    try {
      await client.execute('ALTER TABLE dealer_requests ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE SET NULL;');
    } catch {
      // Column might already exist
    }

      // Safely add dealer_visibility to products
      try {
        await client.execute('ALTER TABLE products ADD COLUMN dealer_visibility INTEGER NOT NULL DEFAULT 1;');
      } catch {
        // Column might already exist
      }
    }

    // Check if dealer requests created_by FK migration has been applied
    const existingRelaxFkMigration = await client.execute({
      sql: 'SELECT name FROM _migrations WHERE name = ?',
      args: ['0006_dealer_requests_created_by'],
    });

    if (existingRelaxFkMigration.rows.length === 0) {
      await client.batch(
        [
          `CREATE TABLE IF NOT EXISTS dealer_requests_v2 (
            id TEXT PRIMARY KEY,
            request_code TEXT NOT NULL UNIQUE,
            dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
            product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
            type TEXT NOT NULL CHECK (type IN ('PRODUCT_ENQUIRY', 'AVAILABILITY', 'GENERAL_SUPPORT', 'OTHER')),
            subject TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
            priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
            assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            resolved_at TEXT
          );`,
          `INSERT OR IGNORE INTO dealer_requests_v2 (id, request_code, dealer_id, product_id, type, subject, description, status, priority, assigned_to, created_by, created_at, updated_at, resolved_at)
           SELECT id, request_code, dealer_id, product_id, type, subject, description, status, priority, assigned_to, created_by, created_at, updated_at, resolved_at FROM dealer_requests;`,
          `DROP TABLE dealer_requests;`,
          `ALTER TABLE dealer_requests_v2 RENAME TO dealer_requests;`,
          `CREATE INDEX IF NOT EXISTS idx_requests_code ON dealer_requests(request_code);`,
          `CREATE INDEX IF NOT EXISTS idx_requests_dealer ON dealer_requests(dealer_id);`,
          `CREATE INDEX IF NOT EXISTS idx_requests_status ON dealer_requests(status);`,
          `CREATE INDEX IF NOT EXISTS idx_requests_type ON dealer_requests(type);`,
          {
            sql: 'INSERT INTO _migrations (name) VALUES (?)',
            args: ['0006_dealer_requests_created_by'],
          },
        ],
        'write'
      );
    }

    // Check if contact enquiries migration has been applied
    const existingContactEnquiriesMigration = await client.execute({
      sql: 'SELECT name FROM _migrations WHERE name = ?',
      args: ['0007_contact_enquiries'],
    });

    if (existingContactEnquiriesMigration.rows.length === 0) {
      await client.batch(
        [
          `CREATE TABLE IF NOT EXISTS contact_enquiries (
            id TEXT PRIMARY KEY,
            enquiry_code TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL CHECK (type IN ('PRODUCT_ENQUIRY', 'DEALER_ENQUIRY', 'DISTRIBUTION_ENQUIRY', 'PRODUCT_SUPPORT', 'GENERAL_ENQUIRY')),
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            company_name TEXT,
            business_type TEXT,
            city TEXT,
            state TEXT,
            territory TEXT,
            product_id TEXT,
            purchase_dealer_details TEXT,
            message TEXT,
            status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'REVIEWED', 'RESPONDED', 'CLOSED')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          );`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_code ON contact_enquiries(enquiry_code);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_type ON contact_enquiries(type);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON contact_enquiries(status);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_email ON contact_enquiries(email);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created ON contact_enquiries(created_at);`,
          {
            sql: 'INSERT INTO _migrations (name) VALUES (?)',
            args: ['0007_contact_enquiries'],
          },
        ],
        'write'
      );
    }

    // Check if contact enquiries management migration has been applied
    const existingEnquiryManagementMigration = await client.execute({
      sql: 'SELECT name FROM _migrations WHERE name = ?',
      args: ['0008_contact_enquiries_management'],
    });

    if (existingEnquiryManagementMigration.rows.length === 0) {
      // Safely alter table to add columns if they don't already exist
      try {
        await client.execute('ALTER TABLE contact_enquiries ADD COLUMN business_address TEXT;');
      } catch {
        // column may exist
      }
      try {
        await client.execute('ALTER TABLE contact_enquiries ADD COLUMN pincode TEXT;');
      } catch {
        // column may exist
      }
      try {
        await client.execute('ALTER TABLE contact_enquiries ADD COLUMN assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL;');
      } catch {
        // column may exist
      }

      await client.batch(
        [
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_assigned ON contact_enquiries(assigned_to);`,
          `CREATE TABLE IF NOT EXISTS enquiry_notes (
            id TEXT PRIMARY KEY,
            enquiry_id TEXT NOT NULL REFERENCES contact_enquiries(id) ON DELETE CASCADE,
            body TEXT NOT NULL,
            created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          );`,
          `CREATE INDEX IF NOT EXISTS idx_enquiry_notes_enquiry ON enquiry_notes(enquiry_id);`,
          `CREATE INDEX IF NOT EXISTS idx_enquiry_notes_created ON enquiry_notes(created_at);`,
          {
            sql: 'INSERT INTO _migrations (name) VALUES (?)',
            args: ['0008_contact_enquiries_management'],
          },
        ],
        'write'
      );
    }

    // Check if status constraint migration has been applied
    const existingStatusMigration = await client.execute({
      sql: 'SELECT name FROM _migrations WHERE name = ?',
      args: ['0009_contact_enquiries_status_constraint'],
    });

    if (existingStatusMigration.rows.length === 0) {
      await client.batch(
        [
          `CREATE TABLE IF NOT EXISTS contact_enquiries_v2 (
            id TEXT PRIMARY KEY,
            enquiry_code TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL CHECK (type IN ('PRODUCT_ENQUIRY', 'DEALER_ENQUIRY', 'DISTRIBUTION_ENQUIRY', 'PRODUCT_SUPPORT', 'GENERAL_ENQUIRY')),
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            company_name TEXT,
            business_address TEXT,
            business_type TEXT,
            city TEXT,
            state TEXT,
            pincode TEXT,
            territory TEXT,
            product_id TEXT,
            purchase_dealer_details TEXT,
            message TEXT,
            status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'CLOSED', 'REVIEWED', 'RESPONDED')),
            assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          );`,
          `INSERT OR IGNORE INTO contact_enquiries_v2 (
            id, enquiry_code, type, full_name, phone, email,
            company_name, business_address, business_type, city, state, pincode, territory,
            product_id, purchase_dealer_details, message,
            status, assigned_to, created_at, updated_at
          )
          SELECT 
            id, enquiry_code, type, full_name, phone, email,
            company_name, business_address, business_type, city, state, pincode, territory,
            product_id, purchase_dealer_details, message,
            CASE WHEN status = 'REVIEWED' THEN 'IN_PROGRESS' WHEN status = 'RESPONDED' THEN 'CLOSED' ELSE status END,
            assigned_to, created_at, updated_at
          FROM contact_enquiries;`,
          `DROP TABLE contact_enquiries;`,
          `ALTER TABLE contact_enquiries_v2 RENAME TO contact_enquiries;`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_code ON contact_enquiries(enquiry_code);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_type ON contact_enquiries(type);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON contact_enquiries(status);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_email ON contact_enquiries(email);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created ON contact_enquiries(created_at);`,
          `CREATE INDEX IF NOT EXISTS idx_contact_enquiries_assigned ON contact_enquiries(assigned_to);`,
          {
            sql: 'INSERT INTO _migrations (name) VALUES (?)',
            args: ['0009_contact_enquiries_status_constraint'],
          },
        ],
        'write'
      );
    }

    // Check if warranties and policies migration has been applied
    const existingWarrantyMigration = await client.execute({
      sql: 'SELECT name FROM _migrations WHERE name = ?',
      args: ['0010_warranties_and_policies'],
    });

    if (existingWarrantyMigration.rows.length === 0) {
      await client.batch(
        [
          `CREATE TABLE IF NOT EXISTS warranty_policies (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
            duration_months INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          );`,
          `CREATE INDEX IF NOT EXISTS idx_warranty_policies_product ON warranty_policies(product_id);`,
          `CREATE TABLE IF NOT EXISTS warranties (
            id TEXT PRIMARY KEY,
            serial_record_id TEXT NOT NULL UNIQUE REFERENCES serial_numbers(id) ON DELETE RESTRICT,
            product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
            dealer_id TEXT REFERENCES dealers(id) ON DELETE SET NULL,
            installation_date TEXT NOT NULL,
            warranty_start_date TEXT NOT NULL,
            warranty_end_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VOID')),
            activated_by TEXT NOT NULL,
            activated_by_type TEXT NOT NULL CHECK (activated_by_type IN ('INTERNAL', 'DEALER')),
            activated_at TEXT NOT NULL DEFAULT (datetime('now')),
            voided_at TEXT,
            voided_by TEXT,
            void_reason TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          );`,
          `CREATE INDEX IF NOT EXISTS idx_warranties_serial ON warranties(serial_record_id);`,
          `CREATE INDEX IF NOT EXISTS idx_warranties_product ON warranties(product_id);`,
          `CREATE INDEX IF NOT EXISTS idx_warranties_dealer ON warranties(dealer_id);`,
          `CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);`,
          `CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(warranty_end_date);`,
          {
            sql: 'INSERT INTO _migrations (name) VALUES (?)',
            args: ['0010_warranties_and_policies'],
          },
        ],
        'write'
      );
    }
  }

export async function withDatabaseTransaction<T>(client: Client, run: (transaction: Client) => Promise<T>): Promise<T> {
  if (client instanceof PostgresClientAdapter) return client.withTransaction(run);
  const transaction = await client.transaction('write');
  try { const result = await run(transaction as unknown as Client); await transaction.commit(); return result; }
  catch (error) { await transaction.rollback(); throw error; }
  finally { transaction.close(); }
}
