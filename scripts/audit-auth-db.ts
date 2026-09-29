import { getDbClient, ensureDatabaseReady, isPostgresUrl, getDatabaseUrl } from '@trionyx/database';

async function audit() {
  const url = getDatabaseUrl();
  console.log('Database URL type:', isPostgresUrl(url) ? 'PostgreSQL' : 'SQLite');
  const client = await ensureDatabaseReady();

  // Check tables
  console.log('\n--- EXISTING TABLES ---');
  let tables: string[] = [];
  if (isPostgresUrl(url)) {
    const res = await client.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    tables = res.rows.map((r: any) => r.table_name);
  } else {
    const res = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `);
    tables = res.rows.map((r: any) => r.name);
  }
  console.log('Tables found:', tables.join(', '));

  // Check users table
  console.log('\n--- USERS IN DB ---');
  const usersRes = await client.execute('SELECT id, name, email, role, status, distributor_id, failed_login_count, locked_until FROM users');
  console.log(`Found ${usersRes.rows.length} users:`);
  usersRes.rows.forEach((u: any) => {
    console.log(`- [${u.role}] ${u.email} (Status: ${u.status}, DistId: ${u.distributor_id || 'none'})`);
  });

  // Check dealer_users table
  if (tables.includes('dealer_users')) {
    console.log('\n--- DEALER USERS IN DB ---');
    const dUsersRes = await client.execute('SELECT id, dealer_id, name, email, status FROM dealer_users');
    console.log(`Found ${dUsersRes.rows.length} dealer_users:`);
    dUsersRes.rows.forEach((du: any) => {
      console.log(`- DealerUser: ${du.email} (DealerId: ${du.dealer_id}, Status: ${du.status})`);
    });
  }

  // Check sessions table
  if (tables.includes('sessions')) {
    const sessRes = await client.execute('SELECT count(*) as count FROM sessions');
    console.log(`Active internal sessions count: ${sessRes.rows[0].count}`);
  }

  // Check dealer_sessions table
  if (tables.includes('dealer_sessions')) {
    const dSessRes = await client.execute('SELECT count(*) as count FROM dealer_sessions');
    console.log(`Active dealer sessions count: ${dSessRes.rows[0].count}`);
  }

  // Check distributors table
  if (tables.includes('distributors')) {
    const distRes = await client.execute('SELECT count(*) as count FROM distributors');
    console.log(`Distributors count: ${distRes.rows[0].count}`);
  }

  // Check dealers table
  if (tables.includes('dealers')) {
    const dlrRes = await client.execute('SELECT count(*) as count FROM dealers');
    console.log(`Dealers count: ${dlrRes.rows[0].count}`);
  }
}

audit().catch(console.error);
