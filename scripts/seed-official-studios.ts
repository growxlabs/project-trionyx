import { getDbClient, ensureDatabaseReady, isPostgresUrl } from '../packages/database/src';

interface TargetDb {
  label: string;
  url: string;
}

const OFFICIAL_STUDIOS = [
  {
    id: 'dlr-apex-01',
    code: 'TRX-DLR-000001',
    name: 'Apex Detailing Studio',
    legalName: 'Apex Detailing Studio Pvt Ltd',
    contact: 'Vikram Seth',
    phone: '+91 98450 88201',
    email: 'contact@apexdetailing.in',
    address: '102, 100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
  },
  {
    id: 'dlr-velocita-02',
    code: 'TRX-DLR-000002',
    name: 'Velocita Auto Craft',
    legalName: 'Velocita Automotive Services LLP',
    contact: 'Karthik Rao',
    phone: '+91 98860 44102',
    email: 'info@velocitacraft.com',
    address: '45, 5th Block, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560095',
  },
  {
    id: 'dlr-speedline-03',
    code: 'TRX-DLR-000003',
    name: 'Speedline Ceramic Works',
    legalName: 'Speedline Detailing Hub',
    contact: 'Rahul Verma',
    phone: '+91 99000 77303',
    email: 'support@speedlineworks.in',
    address: '88 ITPL Main Road, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560066',
  },
  {
    id: 'dlr-precision-04',
    code: 'TRX-DLR-000004',
    name: 'Precision Detailing Lounge',
    legalName: 'Precision Auto Aesthetic Care',
    contact: 'Siddharth Nair',
    phone: '+91 98440 22404',
    email: 'bookings@precisionlounge.in',
    address: '12 Industrial Suburb, Yeshwanthpur / Peenya',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560022',
  },
  {
    id: 'dlr-grandtourer-05',
    code: 'TRX-DLR-000005',
    name: 'Grand Tourer Surface Care',
    legalName: 'GT Detailing Studios India',
    contact: 'Anand Kumar',
    phone: '+91 98200 99505',
    email: 'hello@grandtourerdetail.com',
    address: '24, 11th Main, 4th Block, Jayanagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560011',
  },
];

async function seedStudiosForDb(target: TargetDb) {
  console.log(`\n========================================`);
  console.log(` SEEDING STUDIOS: ${target.label}`);
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
  const adminId = adminRes.rows[0]?.id ? String(adminRes.rows[0].id) : 'usr-admin-01';

  // Find the primary active distributor (Trionyx South Hub)
  const distRes = await client.execute({
    sql: `SELECT id, distributor_code, business_name FROM distributors WHERE status = 'ACTIVE' LIMIT 1`,
    args: [],
  });
  const distId = distRes.rows[0]?.id ? String(distRes.rows[0].id) : 'dst-bengaluru-01';
  const distName = distRes.rows[0]?.business_name ? String(distRes.rows[0].business_name) : 'Trionyx South Distribution Hub';

  console.log(`Linking studios to Regional Hub: ${distName} (${distId})`);

  for (const s of OFFICIAL_STUDIOS) {
    const existing = await client.execute({
      sql: `SELECT id FROM dealers WHERE dealer_code = ? OR id = ? LIMIT 1`,
      args: [s.code, s.id],
    });

    if (existing.rows.length > 0) {
      await client.execute({
        sql: `UPDATE dealers SET
                business_name = ?,
                legal_name = ?,
                contact_person = ?,
                phone = ?,
                email = ?,
                address_line1 = ?,
                city = ?,
                state = ?,
                postal_code = ?,
                distributor_id = ?,
                status = 'ACTIVE',
                updated_at = ?
              WHERE id = ?`,
        args: [
          s.name,
          s.legalName,
          s.contact,
          s.phone,
          s.email,
          s.address,
          s.city,
          s.state,
          s.postalCode,
          distId,
          now,
          String(existing.rows[0].id),
        ],
      });
      console.log(`✓ Updated Studio: [${s.code}] ${s.name}`);
    } else {
      await client.execute({
        sql: `INSERT INTO dealers (
                id, dealer_code, business_name, legal_name, contact_person,
                phone, email, address_line1, city, state, postal_code,
                country, distributor_id, status, created_by, updated_by, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, 'ACTIVE', ?, ?, ?, ?)`,
        args: [
          s.id,
          s.code,
          s.name,
          s.legalName,
          s.contact,
          s.phone,
          s.email,
          s.address,
          s.city,
          s.state,
          s.postalCode,
          distId,
          adminId,
          adminId,
          now,
          now,
        ],
      });
      console.log(`✓ Inserted Studio: [${s.code}] ${s.name}`);
    }
  }

  // Count total dealers now
  const countRes = await client.execute(`SELECT count(*) as count FROM dealers WHERE status = 'ACTIVE'`);
  console.log(`Total active studios in ${target.label}: ${countRes.rows[0].count}`);
}

async function main() {
  const supabaseUrl = 'postgresql://postgres.xymitjtsxlffscuvbyoo:XIfs5qvD72so8Bvc@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require';
  const sqliteUrl = 'file:./trionyx.db';

  try {
    await seedStudiosForDb({ label: 'Local SQLite (trionyx.db)', url: sqliteUrl });
  } catch (err) {
    console.error('Local SQLite error:', err);
  }

  try {
    await seedStudiosForDb({ label: 'Live Supabase PostgreSQL (Cloud)', url: supabaseUrl });
  } catch (err) {
    console.error('Supabase error:', err);
  }

  console.log('\n========================================');
  console.log(' ALL STUDIOS SEEDED SUCCESSFULLY');
  console.log('========================================');
}

main().catch(console.error);
