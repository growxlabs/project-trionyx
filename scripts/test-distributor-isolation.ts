import {
  usersRepository,
  distributorsRepository,
  dealersRepository,
  dealerRequestsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import {
  authenticateDistributorUser,
  requireDistributorSession,
  invalidateDistributorSession,
} from '@trionyx/auth';
import { hashPassword } from '../packages/auth/src/crypto';

async function main() {
  console.log('--- STARTING DISTRIBUTOR ISOLATION & OVERVIEW AUDIT ---');
  await ensureDatabaseReady();

  // 1. Fetch available distributors in database
  const activeDistributors = await distributorsRepository.listAllActive();
  console.log(`Found ${activeDistributors.length} active distributors in DB.`);

  if (activeDistributors.length < 2) {
    throw new Error('Need at least 2 distributors in DB to test isolation.');
  }

  const distA = activeDistributors[0];
  const distB = activeDistributors[1];

  console.log(`Distributor A: [${distA.distributorCode}] ${distA.businessName} (ID: ${distA.id})`);
  console.log(`Distributor B: [${distB.distributorCode}] ${distB.businessName} (ID: ${distB.id})`);

  // 2. Ensure test user accounts for Distributor A and B
  const testPassword = 'DistributorPassword123!';
  const hashedPassword = await hashPassword(testPassword);

  const emailA = `test.dist.a@trionyx.com`;
  const emailB = `test.dist.b@trionyx.com`;
  const emailNoDist = `test.dist.nodist@trionyx.com`;

  // Upsert or create test user A
  let userA = await usersRepository.findByEmail(emailA);
  if (!userA) {
    userA = await usersRepository.create({
      name: `${distA.businessName} Lead`,
      email: emailA,
      role: 'DISTRIBUTOR',
      passwordHash: hashedPassword,
      distributorId: distA.id,
      status: 'ACTIVE',
    });
  } else {
    await usersRepository.update(userA.id, {
      distributorId: distA.id,
      role: 'DISTRIBUTOR',
      status: 'ACTIVE',
      passwordHash: hashedPassword,
    });
    userA = (await usersRepository.findById(userA.id))!;
  }

  // Upsert or create test user B
  let userB = await usersRepository.findByEmail(emailB);
  if (!userB) {
    userB = await usersRepository.create({
      name: `${distB.businessName} Lead`,
      email: emailB,
      role: 'DISTRIBUTOR',
      passwordHash: hashedPassword,
      distributorId: distB.id,
      status: 'ACTIVE',
    });
  } else {
    await usersRepository.update(userB.id, {
      distributorId: distB.id,
      role: 'DISTRIBUTOR',
      status: 'ACTIVE',
      passwordHash: hashedPassword,
    });
    userB = (await usersRepository.findById(userB.id))!;
  }

  // Upsert or create test user with DISTRIBUTOR role but NO distributor assigned
  let userNoDist = await usersRepository.findByEmail(emailNoDist);
  if (!userNoDist) {
    userNoDist = await usersRepository.create({
      name: 'Unassigned Distributor Rep',
      email: emailNoDist,
      role: 'DISTRIBUTOR',
      passwordHash: hashedPassword,
      distributorId: null,
      status: 'ACTIVE',
    });
  } else {
    await usersRepository.update(userNoDist.id, {
      distributorId: null,
      role: 'DISTRIBUTOR',
      status: 'ACTIVE',
      passwordHash: hashedPassword,
    });
  }

  console.log('\n--- TEST CASE 1: Authentication & Territory Resolution ---');
  // Authenticate Distributor A
  const authResA = await authenticateDistributorUser({
    email: emailA,
    password: testPassword,
  });
  console.log('Distributor A login success:', authResA.success);
  console.log('Distributor A resolved code:', authResA.distributor?.distributorCode);
  if (!authResA.success || authResA.distributor?.id !== distA.id) {
    throw new Error('Distributor A authentication failed or resolved wrong territory!');
  }

  // Authenticate Distributor B
  const authResB = await authenticateDistributorUser({
    email: emailB,
    password: testPassword,
  });
  console.log('Distributor B login success:', authResB.success);
  console.log('Distributor B resolved code:', authResB.distributor?.distributorCode);
  if (!authResB.success || authResB.distributor?.id !== distB.id) {
    throw new Error('Distributor B authentication failed or resolved wrong territory!');
  }

  // Attempt login for unassigned distributor user -> Must be rejected
  const authResNoDist = await authenticateDistributorUser({
    email: emailNoDist,
    password: testPassword,
  });
  console.log('Unassigned distributor login blocked (expected false):', authResNoDist.success);
  console.log('Status code (expected 403):', authResNoDist.statusCode);
  console.log('Error message:', authResNoDist.error);
  if (authResNoDist.success || authResNoDist.statusCode !== 403) {
    throw new Error('Unassigned distributor was not rejected with 403!');
  }

  console.log('\n--- TEST CASE 2: Session Guard Verification (`requireDistributorSession`) ---');
  const sessionDataA = await requireDistributorSession(authResA.rawToken);
  console.log('Session A validated for user:', sessionDataA.user.email);
  console.log('Session A territory:', sessionDataA.distributor.businessName);

  const sessionDataB = await requireDistributorSession(authResB.rawToken);
  console.log('Session B validated for user:', sessionDataB.user.email);
  console.log('Session B territory:', sessionDataB.distributor.businessName);

  // Invalidate Session A
  await invalidateDistributorSession(authResA.rawToken!);
  let rejected = false;
  try {
    await requireDistributorSession(authResA.rawToken);
  } catch (err: any) {
    rejected = true;
    console.log('Invalidated session rejected properly:', err.message);
  }
  if (!rejected) {
    throw new Error('Invalidated session was still accepted!');
  }

  // Re-login Distributor A for data isolation tests
  const freshAuthA = await authenticateDistributorUser({
    email: emailA,
    password: testPassword,
  });

  console.log('\n--- TEST CASE 3: Data Scoping & Multi-Tenant Role Isolation ---');
  // Query dealers assigned to Distributor A vs Distributor B
  const dealersA = await dealersRepository.list({ distributorId: distA.id });
  const dealersB = await dealersRepository.list({ distributorId: distB.id });

  console.log(`Distributor A [${distA.distributorCode}] assigned dealers count:`, dealersA.total);
  dealersA.items.forEach((d) => {
    console.log(`  - Dealer: [${d.dealerCode}] ${d.businessName} (Distributor ID: ${d.distributorId})`);
    if (d.distributorId !== distA.id) {
      throw new Error(`LEAK: Dealer ${d.dealerCode} has distributorId ${d.distributorId} but was returned for ${distA.id}!`);
    }
  });

  console.log(`Distributor B [${distB.distributorCode}] assigned dealers count:`, dealersB.total);
  dealersB.items.forEach((d) => {
    console.log(`  - Dealer: [${d.dealerCode}] ${d.businessName} (Distributor ID: ${d.distributorId})`);
    if (d.distributorId !== distB.id) {
      throw new Error(`LEAK: Dealer ${d.dealerCode} has distributorId ${d.distributorId} but was returned for ${distB.id}!`);
    }
  });

  // Query requests assigned to Distributor A vs Distributor B
  const requestsA = await dealerRequestsRepository.list({ distributorId: distA.id });
  const requestsB = await dealerRequestsRepository.list({ distributorId: distB.id });

  console.log(`Distributor A [${distA.distributorCode}] requests count:`, requestsA.total);
  requestsA.items.forEach((r) => {
    console.log(`  - Request: [${r.requestCode}] ${r.subject} (Dealer: ${r.dealerName})`);
  });

  console.log(`Distributor B [${distB.distributorCode}] requests count:`, requestsB.total);
  requestsB.items.forEach((r) => {
    console.log(`  - Request: [${r.requestCode}] ${r.subject} (Dealer: ${r.dealerName})`);
  });

  // Check cross-leakage: dealers in A should NEVER appear in dealers in B
  const dealerIdsA = new Set(dealersA.items.map((d) => d.id));
  for (const dealerB of dealersB.items) {
    if (dealerIdsA.has(dealerB.id)) {
      throw new Error(`CROSS-TENANT LEAK: Dealer ${dealerB.id} is shared between Distributor A and B!`);
    }
  }

  // Check request cross-leakage
  const requestIdsA = new Set(requestsA.items.map((r) => r.id));
  for (const reqB of requestsB.items) {
    if (requestIdsA.has(reqB.id)) {
      throw new Error(`CROSS-TENANT LEAK: Request ${reqB.id} appeared in both territories!`);
    }
  }

  console.log('\n✅ ALL ISOLATION CHECKS PASSED: Zero cross-tenant data leaks.');
  console.log('--- DISTRIBUTOR ISOLATION & OVERVIEW AUDIT COMPLETED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
