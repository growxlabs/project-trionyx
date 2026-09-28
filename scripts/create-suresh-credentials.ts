import { getDbClient, getDatabaseUrl, isPostgresUrl } from '../packages/database/src';
import { hashPassword, verifyPassword } from '../packages/auth/src';
import { randomUUID } from 'crypto';

async function main() {
  console.log('Connecting to database:', getDatabaseUrl().replace(/:[^:@]+@/, ':***@'));
  const client = getDbClient();

  const isPg = isPostgresUrl(getDatabaseUrl());
  const now = new Date().toISOString();

  // 1. CREATE / RESET PORTAL USER: suresh@trionyx.com
  const portalPassword = 'Suresh@Trionyx2026!';
  const portalPasswordHash = await hashPassword(portalPassword);

  const existingPortalUser = await client.execute({
    sql: 'SELECT id, email FROM users WHERE email = ? LIMIT 1',
    args: ['suresh@trionyx.com'],
  });

  let portalUserId: string;

  if (existingPortalUser.rows.length > 0) {
    portalUserId = String(existingPortalUser.rows[0].id);
    await client.execute({
      sql: `UPDATE users SET 
              name = ?, 
              password_hash = ?, 
              role = 'ADMIN', 
              status = 'ACTIVE', 
              failed_login_count = 0, 
              locked_until = NULL, 
              updated_at = ? 
            WHERE id = ?`,
      args: ['Suresh Kumar', portalPasswordHash, now, portalUserId],
    });
    console.log('Updated existing Portal user:', portalUserId);
  } else {
    portalUserId = randomUUID();
    await client.execute({
      sql: `INSERT INTO users (
              id, name, email, password_hash, role, status, 
              failed_login_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE', 0, ?, ?)`,
      args: [
        portalUserId,
        'Suresh Kumar',
        'suresh@trionyx.com',
        portalPasswordHash,
        now,
        now,
      ],
    });
    console.log('Created new Portal user:', portalUserId);
  }

  // 2. CREATE / RESET DEALER USER: suresh.dealer@trionyx.com
  const dealerPassword = 'Suresh@Dealer2026!';
  const dealerPasswordHash = await hashPassword(dealerPassword);

  // Find apex dealer id
  const apexDealer = await client.execute({
    sql: "SELECT id, business_name, dealer_code FROM dealers WHERE dealer_code = 'TRX-DLR-000001' OR id = 'dlr-apex-01' LIMIT 1",
    args: [],
  });
  const dealerId = apexDealer.rows[0]?.id ? String(apexDealer.rows[0].id) : 'dlr-apex-01';
  const dealerName = apexDealer.rows[0]?.business_name ? String(apexDealer.rows[0].business_name) : 'Apex Detailing Studio';
  const dealerCode = apexDealer.rows[0]?.dealer_code ? String(apexDealer.rows[0].dealer_code) : 'TRX-DLR-000001';

  const existingDealerUser = await client.execute({
    sql: 'SELECT id, email FROM dealer_users WHERE email = ? LIMIT 1',
    args: ['suresh.dealer@trionyx.com'],
  });

  let dealerUserId: string;

  if (existingDealerUser.rows.length > 0) {
    dealerUserId = String(existingDealerUser.rows[0].id);
    await client.execute({
      sql: `UPDATE dealer_users SET 
              dealer_id = ?, 
              name = ?, 
              password_hash = ?, 
              status = 'ACTIVE', 
              failed_login_count = 0, 
              locked_until = NULL, 
              updated_at = ? 
            WHERE id = ?`,
      args: [dealerId, 'Suresh Kumar (Apex Studio)', dealerPasswordHash, now, dealerUserId],
    });
    console.log('Updated existing Dealer user:', dealerUserId);
  } else {
    dealerUserId = randomUUID();
    await client.execute({
      sql: `INSERT INTO dealer_users (
              id, dealer_id, name, email, password_hash, status, 
              failed_login_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', 0, ?, ?)`,
      args: [
        dealerUserId,
        dealerId,
        'Suresh Kumar (Apex Studio)',
        'suresh.dealer@trionyx.com',
        dealerPasswordHash,
        now,
        now,
      ],
    });
    console.log('Created new Dealer user:', dealerUserId);
  }

  // 3. VERIFY BOTH PASSWORDS IN MEMORY
  const portalValid = await verifyPassword(portalPassword, portalPasswordHash);
  const dealerValid = await verifyPassword(dealerPassword, dealerPasswordHash);

  console.log('\n========================================');
  console.log(' CREDENTIALS PROVISIONED SUCCESSFULLY');
  console.log('========================================');
  console.log('1. PORTAL (OPERATIONS / ADMIN)');
  console.log('   URL:      http://localhost:3002/login (or https://portal-trionyx.growxlabs.tech/login)');
  console.log('   Name:     Suresh Kumar');
  console.log('   Email:    suresh@trionyx.com');
  console.log('   Password: ' + portalPassword);
  console.log('   Role:     ADMIN');
  console.log('   Verified: ' + (portalValid ? 'YES ✓' : 'NO ✗'));
  console.log('----------------------------------------');
  console.log('2. DEALER ACCESS (STUDIO PORTAL)');
  console.log('   URL:      http://localhost:3000/dealer-access (or http://localhost:3001/login)');
  console.log('   Name:     Suresh Kumar');
  console.log('   Studio:   ' + dealerName + ' (' + dealerCode + ')');
  console.log('   Email:    suresh.dealer@trionyx.com');
  console.log('   Password: ' + dealerPassword);
  console.log('   Verified: ' + (dealerValid ? 'YES ✓' : 'NO ✗'));
  console.log('========================================\n');
}

main().catch(console.error);
