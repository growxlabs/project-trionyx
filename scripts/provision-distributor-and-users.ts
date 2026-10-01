import { getDbClient, getDatabaseUrl, isPostgresUrl, ensureDatabaseReady } from '../packages/database/src';
import { hashPassword, verifyPassword } from '../packages/auth/src';
import { randomUUID } from 'crypto';

interface TargetDb {
  label: string;
  url: string;
}

async function provisionDatabase(target: TargetDb) {
  console.log(`\n========================================`);
  console.log(` PROVISIONING: ${target.label}`);
  console.log(` URL: ${target.url.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`========================================`);

  const client = getDbClient(target.url);
  await ensureDatabaseReady(client);

  const now = new Date().toISOString();

  // Find an admin user to use as created_by
  const adminRes = await client.execute({
    sql: `SELECT id FROM users WHERE role IN ('ADMIN', 'MANAGING_DIRECTOR') LIMIT 1`,
    args: [],
  });
  const adminId = adminRes.rows[0]?.id ? String(adminRes.rows[0].id) : randomUUID();

  // 1. Ensure at least one active official Distributor exists
  const existingDist = await client.execute({
    sql: `SELECT id, distributor_code, business_name FROM distributors WHERE status = 'ACTIVE' LIMIT 1`,
    args: [],
  });

  let distributorId: string;
  let distributorName: string;
  let distributorCode: string;

  if (existingDist.rows.length > 0) {
    distributorId = String(existingDist.rows[0].id);
    distributorName = String(existingDist.rows[0].business_name);
    distributorCode = String(existingDist.rows[0].distributor_code);
    console.log(`✓ Active distributor already exists: [${distributorCode}] ${distributorName} (${distributorId})`);
  } else {
    distributorId = 'dst-bengaluru-01';
    distributorCode = 'TRX-DST-000001';
    distributorName = 'Trionyx South Distribution Hub (Bengaluru)';

    await client.execute({
      sql: `INSERT INTO distributors (
              id, distributor_code, business_name, legal_name, contact_person,
              phone, email, address_line1, city, state, postal_code,
              country, territory, status, created_by, updated_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)`,
      args: [
        distributorId,
        distributorCode,
        distributorName,
        'Trionyx Distribution India Pvt Ltd',
        'Suresh Kumar',
        '+91 98450 12345',
        'distributor@trionyx.com',
        '42 Industrial Area, Peenya 2nd Stage',
        'Bengaluru',
        'Karnataka',
        '560058',
        'India',
        'Karnataka & Southern Region',
        adminId,
        adminId,
        now,
        now,
      ],
    });
    console.log(`✓ Created official distributor: [${distributorCode}] ${distributorName}`);
  }

  // Passwords
  const portalPassword = 'Suresh@Trionyx2026!';
  const portalHash = await hashPassword(portalPassword);

  const dealerPassword = 'Suresh@Dealer2026!';
  const dealerHash = await hashPassword(dealerPassword);

  // 2. Provision / Update suresh@trionyx.com in `users` (ADMIN linked to distributor)
  const existingSuresh = await client.execute({
    sql: `SELECT id FROM users WHERE email = ? LIMIT 1`,
    args: ['suresh@trionyx.com'],
  });

  if (existingSuresh.rows.length > 0) {
    const userId = String(existingSuresh.rows[0].id);
    await client.execute({
      sql: `UPDATE users SET 
              name = 'Suresh Kumar',
              password_hash = ?,
              role = 'ADMIN',
              distributor_id = ?,
              status = 'ACTIVE',
              failed_login_count = 0,
              locked_until = NULL,
              updated_at = ?
            WHERE id = ?`,
      args: [portalHash, distributorId, now, userId],
    });
    console.log(`✓ Updated suresh@trionyx.com in users table (ADMIN, linked to ${distributorCode})`);
  } else {
    const userId = randomUUID();
    await client.execute({
      sql: `INSERT INTO users (
              id, name, email, password_hash, role, distributor_id,
              status, failed_login_count, created_at, updated_at
            ) VALUES (?, 'Suresh Kumar', 'suresh@trionyx.com', ?, 'ADMIN', ?, 'ACTIVE', 0, ?, ?)`,
      args: [userId, portalHash, distributorId, now, now],
    });
    console.log(`✓ Created suresh@trionyx.com in users table (ADMIN, linked to ${distributorCode})`);
  }

  // 3. Provision / Update suresh.dealer@trionyx.com in `users` (DISTRIBUTOR role for distributor portal login)
  const existingDealerUserInUsers = await client.execute({
    sql: `SELECT id FROM users WHERE email = ? LIMIT 1`,
    args: ['suresh.dealer@trionyx.com'],
  });

  if (existingDealerUserInUsers.rows.length > 0) {
    const userId = String(existingDealerUserInUsers.rows[0].id);
    await client.execute({
      sql: `UPDATE users SET 
              name = 'Suresh Kumar',
              password_hash = ?,
              role = 'DISTRIBUTOR',
              distributor_id = ?,
              status = 'ACTIVE',
              failed_login_count = 0,
              locked_until = NULL,
              updated_at = ?
            WHERE id = ?`,
      args: [dealerHash, distributorId, now, userId],
    });
    console.log(`✓ Updated suresh.dealer@trionyx.com in users table (DISTRIBUTOR, linked to ${distributorCode})`);
  } else {
    const userId = randomUUID();
    await client.execute({
      sql: `INSERT INTO users (
              id, name, email, password_hash, role, distributor_id,
              status, failed_login_count, created_at, updated_at
            ) VALUES (?, 'Suresh Kumar', 'suresh.dealer@trionyx.com', ?, 'DISTRIBUTOR', ?, 'ACTIVE', 0, ?, ?)`,
      args: [userId, dealerHash, distributorId, now, now],
    });
    console.log(`✓ Created suresh.dealer@trionyx.com in users table (DISTRIBUTOR, linked to ${distributorCode})`);
  }

  // 4. Verify password in memory
  const pValid = await verifyPassword(portalPassword, portalHash);
  const dValid = await verifyPassword(dealerPassword, dealerHash);
  console.log(`✓ Passwords verified: portalValid=${pValid}, dealerValid=${dValid}`);
}

async function main() {
  const supabaseUrl = 'postgresql://postgres.xymitjtsxlffscuvbyoo:XIfs5qvD72so8Bvc@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require';
  const sqliteUrl = 'file:./trionyx.db';

  // Provision both
  try {
    await provisionDatabase({ label: 'Local SQLite (trionyx.db)', url: sqliteUrl });
  } catch (err) {
    console.error('Failed local SQLite:', err);
  }

  try {
    await provisionDatabase({ label: 'Live Supabase PostgreSQL (Cloud)', url: supabaseUrl });
  } catch (err) {
    console.error('Failed Supabase:', err);
  }

  console.log('\n========================================');
  console.log(' ALL CREDENTIALS READY FOR LOGIN');
  console.log('========================================');
}

main().catch(console.error);
