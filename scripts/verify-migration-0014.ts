import { ensureDatabaseReady, getDbClient } from '../packages/database/src';

async function main() {
  const client = await ensureDatabaseReady();
  
  console.log('--- ORGANIZATIONS ---');
  const orgs = await client.execute('SELECT id, slug, name, status FROM organizations');
  console.log(orgs.rows);

  console.log('\n--- MEMBERSHIPS ---');
  const memberships = await client.execute('SELECT organization_id, role, count(*) as count FROM organization_memberships GROUP BY organization_id, role');
  console.log(memberships.rows);

  console.log('\n--- PRODUCTS BY ORG ---');
  const prods = await client.execute('SELECT organization_id, count(*) as count FROM products GROUP BY organization_id');
  console.log(prods.rows);

  console.log('\n--- LAKSHMI PRODUCTS ---');
  const lakProds = await client.execute("SELECT id, product_code, name, organization_id FROM products WHERE organization_id = 'org-lakshmi'");
  console.log(lakProds.rows);

  console.log('\n--- BRANDS BY ORG ---');
  const brands = await client.execute('SELECT organization_id, slug, name FROM brands');
  console.log(brands.rows);

  console.log('\n--- INVENTORY LOCATIONS BY ORG ---');
  const locs = await client.execute('SELECT organization_id, count(*) as count FROM inventory_locations GROUP BY organization_id');
  console.log(locs.rows);

  console.log('\n--- DEALERS BY ORG ---');
  const dealers = await client.execute('SELECT organization_id, count(*) as count FROM dealers GROUP BY organization_id');
  console.log(dealers.rows);

  console.log('\n--- DISTRIBUTORS BY ORG ---');
  const distributors = await client.execute('SELECT organization_id, count(*) as count FROM distributors GROUP BY organization_id');
  console.log(distributors.rows);
}

main().catch(console.error);
