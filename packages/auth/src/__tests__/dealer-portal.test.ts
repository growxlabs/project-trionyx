import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import {
  runMigrations,
  usersRepository,
  distributorsRepository,
  dealersRepository,
  dealerUsersRepository,
  dealerSessionsRepository,
  dealerRequestsRepository,
  dealerRequestMessagesRepository,
  productsRepository,
  categoriesRepository,
  serialsRepository,
  locationsRepository,
} from '@trionyx/database';
import {
  inviteDealerUser,
  activateDealerUser,
  authenticateDealerUser,
  validateDealerSessionToken,
  requireDealerSession,
  invalidateDealerSession,
  changeDealerPassword,
  requestDealerPasswordReset,
  resetDealerPassword,
  createSession,
  validateSessionToken,
} from '../index';
import { hashPassword } from '../crypto';
import type { SafeUser, DealerWithRelations } from '@trionyx/types';

describe('Dealer Portal Production Test Suite (Step 4)', () => {
  let mdUser: SafeUser;
  let dealer1: DealerWithRelations;
  let dealer2: DealerWithRelations;
  const unique = Date.now().toString().slice(-6);

  before(async () => {
    await runMigrations();

    // 1. Create Internal MD user for invitations
    const pwd = await hashPassword('OperatorPass123!');
    const u = await usersRepository.create({
      name: 'Operations Lead',
      email: `ops_lead_${unique}@trionyx.com`,
      passwordHash: pwd,
      role: 'MANAGING_DIRECTOR',
      status: 'ACTIVE',
    });
    mdUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      failedLoginCount: u.failedLoginCount,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };

    // 2. Create Distributor
    const dst = await distributorsRepository.create({
      businessName: `Apex Distribution ${unique}`,
      contactPerson: 'Arun Kumar',
      phone: `98000${unique}`,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      status: 'ACTIVE',
      createdBy: mdUser.id,
    });

    // 3. Create Dealer 1 (Active)
    const d1 = await dealersRepository.create({
      businessName: `Velocita Studio ${unique}`,
      legalName: `Velocita Auto Studio LLP`,
      contactPerson: 'Vikram Seth',
      phone: `99111${unique}`,
      email: `contact@velocita_${unique}.in`,
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      distributorId: dst.id,
      status: 'ACTIVE',
      createdBy: mdUser.id,
    });
    dealer1 = (await dealersRepository.findById(d1.id))!;

    // 4. Create Dealer 2 (Will test inactive dealer restriction)
    const d2 = await dealersRepository.create({
      businessName: `Speedline Detailing ${unique}`,
      contactPerson: 'Karan Mehra',
      phone: `99222${unique}`,
      city: 'Madurai',
      state: 'Tamil Nadu',
      country: 'India',
      status: 'INACTIVE',
      createdBy: mdUser.id,
    });
    dealer2 = (await dealersRepository.findById(d2.id))!;
  });

  test('Invitation and Activation lifecycle', async () => {
    const inviteEmail = `vikram_${unique}@velocitadetail.com`;

    // 1. Generate invitation
    const inviteResult = await inviteDealerUser(dealer1.id, 'Vikram Seth', inviteEmail, mdUser.id);
    assert.strictEqual(inviteResult.user.status, 'INVITED');
    assert.strictEqual(inviteResult.user.email, inviteEmail);
    assert.ok(inviteResult.rawToken, 'Should generate a raw invitation token');
    assert.ok(inviteResult.activationPath.includes(inviteResult.rawToken));

    // 2. Lookup user by invitation token hash
    const invitedUserRecord = await dealerUsersRepository.findByEmail(inviteEmail);
    assert.ok(invitedUserRecord);
    assert.strictEqual(invitedUserRecord.status, 'INVITED');
    assert.ok(invitedUserRecord.invitationTokenHash);

    // 3. Re-invite pending user generates fresh token
    const reinviteResult = await inviteDealerUser(dealer1.id, 'Vikram Seth', inviteEmail, mdUser.id);
    assert.notStrictEqual(reinviteResult.rawToken, inviteResult.rawToken);

    // 4. Activate user with valid token
    const activationResult = await activateDealerUser(reinviteResult.rawToken, 'VelocitaPass2026!');
    assert.strictEqual(activationResult.dealerUser.status, 'ACTIVE');
    assert.strictEqual(activationResult.dealerUser.email, inviteEmail);
    assert.ok(activationResult.session);
    assert.ok(activationResult.rawToken);
    assert.strictEqual(activationResult.dealer.id, dealer1.id);

    // Verify token was cleared upon activation
    const activeUserRecord = await dealerUsersRepository.findById(activationResult.dealerUser.id);
    assert.strictEqual(activeUserRecord?.status, 'ACTIVE');
    assert.strictEqual(activeUserRecord?.invitationTokenHash, null);

    // Verify old token cannot be reused
    await assert.rejects(
      () => activateDealerUser(reinviteResult.rawToken, 'AnotherPass123!'),
      /invalid or has expired/i
    );
  });

  test('Authentication, invalid credentials, and 5-attempt lockout', async () => {
    const email = `tech_${unique}@velocitadetail.com`;
    const { rawToken } = await inviteDealerUser(dealer1.id, 'Sanjay Tech', email, mdUser.id);
    await activateDealerUser(rawToken, 'SecurePass987!');

    // 1. Successful authentication
    const authSuccess = await authenticateDealerUser(email, 'SecurePass987!');
    assert.strictEqual(authSuccess.success, true);
    if (authSuccess.success) {
      assert.strictEqual(authSuccess.dealerUser.email, email);
      assert.strictEqual(authSuccess.dealer.id, dealer1.id);
      assert.ok(authSuccess.rawToken);
    }

    // 2. Failed attempts increment counter
    const f1 = await authenticateDealerUser(email, 'WrongPass1');
    assert.strictEqual(f1.success, false);
    assert.strictEqual(f1.statusCode, 401);

    const f2 = await authenticateDealerUser(email, 'WrongPass2');
    const f3 = await authenticateDealerUser(email, 'WrongPass3');
    const f4 = await authenticateDealerUser(email, 'WrongPass4');
    assert.strictEqual(f4.success, false);

    // 5th failed attempt triggers lockout
    const f5 = await authenticateDealerUser(email, 'WrongPass5');
    assert.strictEqual(f5.success, false);

    // User is now locked out
    const lockedUser = await dealerUsersRepository.findByEmail(email);
    assert.ok(lockedUser?.lockedUntil);
    assert.ok(new Date(lockedUser.lockedUntil).getTime() > Date.now());

    // Even with the CORRECT password, locked user is rejected with 429
    const lockedAttempt = await authenticateDealerUser(email, 'SecurePass987!');
    assert.strictEqual(lockedAttempt.success, false);
    assert.strictEqual(lockedAttempt.statusCode, 429);
    assert.strictEqual(lockedAttempt.error, 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.');

    // Reset lockout
    await dealerUsersRepository.resetLockout(lockedUser.id);
    const unlockedAuth = await authenticateDealerUser(email, 'SecurePass987!');
    assert.strictEqual(unlockedAuth.success, true);
  });

  test('Account status enforcement (DISABLED user rejected)', async () => {
    const email = `disabled_${unique}@velocitadetail.com`;
    const { rawToken } = await inviteDealerUser(dealer1.id, 'Disabled Rep', email, mdUser.id);
    await activateDealerUser(rawToken, 'PassDisabled123!');

    // Disable user
    const u = await dealerUsersRepository.findByEmail(email);
    await dealerUsersRepository.updateStatus(u!.id, 'DISABLED');

    const authDisabled = await authenticateDealerUser(email, 'PassDisabled123!');
    assert.strictEqual(authDisabled.success, false);
    assert.strictEqual(authDisabled.statusCode, 403);
    assert.strictEqual(authDisabled.error, 'Account has been disabled. Contact Trionyx administrator.');
  });

  test('Dealer business status enforcement (INACTIVE dealership rejected)', async () => {
    // Dealer 2 was created with status: INACTIVE
    const email = `dealer2_user_${unique}@speedline.com`;
    const { rawToken } = await inviteDealerUser(dealer2.id, 'Karan Staff', email, mdUser.id);
    await activateDealerUser(rawToken, 'SpeedPass456!');

    const authResult = await authenticateDealerUser(email, 'SpeedPass456!');
    assert.strictEqual(authResult.success, false);
    assert.strictEqual(authResult.statusCode, 403);
    assert.strictEqual(authResult.error, 'Dealership account is not active. Please contact Trionyx.');
  });

  test('Session validation, deletion, and cross-portal session isolation', async () => {
    const email = `session_user_${unique}@velocitadetail.com`;
    const { rawToken: inviteToken } = await inviteDealerUser(dealer1.id, 'Session User', email, mdUser.id);
    const { rawToken: sessionToken } = await activateDealerUser(inviteToken, 'SessionPass123!');

    // 1. Valid dealer session lookup
    const sessionRes = await validateDealerSessionToken(sessionToken);
    assert.ok(sessionRes);
    assert.strictEqual(sessionRes.dealerUser.email, email);
    assert.strictEqual(sessionRes.dealer.id, dealer1.id);

    // 2. requireDealerSession succeeds
    const guarded = await requireDealerSession(sessionToken);
    assert.strictEqual(guarded.dealerUser.email, email);

    // 3. Strict Session Isolation:
    // Dealer session token must NOT be accepted by Internal Portal session validator
    const internalCheck = await validateSessionToken(sessionToken);
    assert.strictEqual(internalCheck, null, 'Internal portal must reject dealer session tokens');

    // Internal portal session token must NOT be accepted by Dealer Portal validator
    const internalSession = await createSession(mdUser.id);
    const dealerCheck = await validateDealerSessionToken(internalSession.rawToken);
    assert.strictEqual(dealerCheck, null, 'Dealer portal must reject internal portal session tokens');

    // 4. Invalidate dealer session
    await invalidateDealerSession(sessionToken);
    const afterLogout = await validateDealerSessionToken(sessionToken);
    assert.strictEqual(afterLogout, null);
    await assert.rejects(() => requireDealerSession(sessionToken), /UNAUTHENTICATED/);
  });

  test('Password change and reset workflows', async () => {
    const email = `pwd_user_${unique}@velocitadetail.com`;
    const { rawToken } = await inviteDealerUser(dealer1.id, 'Password User', email, mdUser.id);
    await activateDealerUser(rawToken, 'InitialPass123!');
    const u = (await dealerUsersRepository.findByEmail(email))!;

    // 1. Change password with incorrect current password fails
    await assert.rejects(
      () => changeDealerPassword(u.id, 'WrongCurrentPass', 'BrandNewPass2026!'),
      /incorrect/i
    );

    // 2. Change password with correct current password succeeds
    await changeDealerPassword(u.id, 'InitialPass123!', 'BrandNewPass2026!');
    const authWithOld = await authenticateDealerUser(email, 'InitialPass123!');
    assert.strictEqual(authWithOld.success, false);
    const authWithNew = await authenticateDealerUser(email, 'BrandNewPass2026!');
    assert.strictEqual(authWithNew.success, true);

    // 3. Forgot password reset flow
    const resetRes = await requestDealerPasswordReset(email);
    assert.ok(resetRes?.rawToken);

    await resetDealerPassword(resetRes.rawToken, 'ResetPasswordFinal789!');
    const authAfterReset = await authenticateDealerUser(email, 'ResetPasswordFinal789!');
    assert.strictEqual(authAfterReset.success, true);
  });

  test('Product availability derivation and information leakage protection', async () => {
    // Create a test product
    const cat = await categoriesRepository.create({
      name: `Coatings ${unique}`,
      slug: `coatings-${unique}`,
      status: 'ACTIVE',
    });

    const prod = await productsRepository.create({
      categoryId: cat.id,
      name: `Graphene Matrix Pro ${unique}`,
      slug: `graphene-matrix-pro-${unique}`,
      dealerVisibility: true,
      status: 'ACTIVE',
    });

    const loc = await locationsRepository.create({
      code: `LOC-${unique}`,
      name: `Central Warehouse ${unique}`,
      status: 'ACTIVE',
    });

    // 0 serial numbers -> UNAVAILABLE
    let dealerProducts = await productsRepository.listDealerProducts();
    let target = dealerProducts.find((p) => p.id === prod.id);
    assert.ok(target);
    assert.strictEqual(target.availability, 'UNAVAILABLE');
    assert.strictEqual((target as any).serialNumber, undefined);
    assert.strictEqual((target as any).warehouseName, undefined);

    // Add 2 serial numbers -> LIMITED (1..5)
    await serialsRepository.receiveBatch({
      productId: prod.id,
      locationId: loc.id,
      serialNumbers: [`SN-${unique}-001`, `SN-${unique}-002`],
      actorId: mdUser.id,
    });

    dealerProducts = await productsRepository.listDealerProducts();
    target = dealerProducts.find((p) => p.id === prod.id);
    assert.strictEqual(target?.availability, 'LIMITED');

    // Add 4 more serial numbers (total 6) -> AVAILABLE (> 5)
    await serialsRepository.receiveBatch({
      productId: prod.id,
      locationId: loc.id,
      serialNumbers: [
        `SN-${unique}-003`,
        `SN-${unique}-004`,
        `SN-${unique}-005`,
        `SN-${unique}-006`,
      ],
      actorId: mdUser.id,
    });

    dealerProducts = await productsRepository.listDealerProducts();
    target = dealerProducts.find((p) => p.id === prod.id);
    assert.strictEqual(target?.availability, 'AVAILABLE');

    // Verify hidden products with dealerVisibility === false do not appear
    await productsRepository.update(prod.id, { dealerVisibility: false });
    dealerProducts = await productsRepository.listDealerProducts();
    assert.strictEqual(dealerProducts.find((p) => p.id === prod.id), undefined);
  });

  test('Dealer requests and conversation thread multi-tenancy', async () => {
    // Create request for dealer 1
    const req1 = await dealerRequestsRepository.create({
      dealerId: dealer1.id,
      type: 'PRODUCT_ENQUIRY',
      subject: `Urgent stock query ${unique}`,
      description: 'Need 10 units for customer delivery next Monday.',
      priority: 'HIGH',
      createdBy: dealer1.id,
    });

    assert.ok(req1.requestCode.startsWith('TRX-REQ-'));
    assert.strictEqual(req1.dealerId, dealer1.id);

    // Add conversation messages
    const msg1 = await dealerRequestMessagesRepository.create({
      requestId: req1.id,
      senderType: 'DEALER',
      senderId: 'dealer-user-1',
      senderName: 'Vikram Seth',
      body: 'Can we expedite this shipment?',
    });
    assert.strictEqual(msg1.senderType, 'DEALER');

    const msg2 = await dealerRequestMessagesRepository.create({
      requestId: req1.id,
      senderType: 'INTERNAL',
      senderId: mdUser.id,
      senderName: 'Operations Lead',
      body: 'Shipment scheduled for Friday via regional transit hub.',
    });
    assert.strictEqual(msg2.senderType, 'INTERNAL');

    // Fetch conversation thread
    const thread = await dealerRequestMessagesRepository.listByRequest(req1.id);
    assert.strictEqual(thread.length, 2);
    assert.strictEqual(thread[0].body, 'Can we expedite this shipment?');
    assert.strictEqual(thread[1].body, 'Shipment scheduled for Friday via regional transit hub.');

    // Multi-tenant isolation: dealer 2 querying list({ dealerId: dealer2.id }) must NOT see req1
    const dealer2Requests = await dealerRequestsRepository.list({ dealerId: dealer2.id });
    assert.strictEqual(dealer2Requests.items.find((r) => r.id === req1.id), undefined);
  });
});
