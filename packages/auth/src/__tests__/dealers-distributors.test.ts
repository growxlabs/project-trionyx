import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import {
  runMigrations,
  usersRepository,
  distributorsRepository,
  dealersRepository,
  dealerRequestsRepository,
  internalNotesRepository,
  auditLogsRepository,
} from '@trionyx/database';
import {
  canManageDealers,
  canManageDistributors,
  canReassignDistributor,
  getDistributorScope,
  getInternalOverview,
  formatActivityLabel,
} from '../index';
import { hashPassword } from '../crypto';
import type { SafeUser } from '@trionyx/types';

describe('Dealer & Distributor Management Production Suite', () => {
  let mdUser: SafeUser;
  let dstUser: SafeUser;
  let distributor1Id: string;
  let distributor2Id: string;
  let dealer1Id: string;
  let dealer2Id: string;
  const uniquePrefix = Date.now().toString().slice(-6);

  before(async () => {
    await runMigrations();

    const pwd = await hashPassword('OperatorPass123!');
    const user = await usersRepository.create({
      name: 'Director Ops',
      email: `director_${uniquePrefix}@trionyx.com`,
      passwordHash: pwd,
      role: 'MANAGING_DIRECTOR',
      status: 'ACTIVE',
    });

    mdUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      failedLoginCount: user.failedLoginCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });

  test('Distributor creation, code generation, and relations', async () => {
    const dst1 = await distributorsRepository.create({
      businessName: `Bengaluru Auto Tech ${uniquePrefix}`,
      legalName: `Bengaluru Auto Tech Pvt Ltd`,
      contactPerson: 'Suresh Raina',
      phone: `98450${uniquePrefix}`,
      email: `suresh_${uniquePrefix}@autotech.in`,
      addressLine1: '42 Industrial Area, Peenya',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560058',
      country: 'India',
      territory: 'Karnataka & Goa',
      status: 'ACTIVE',
      gstin: `29AAACR${uniquePrefix.slice(0, 4)}A1Z5`,
      notes: 'Premier southern regional distributor',
      createdBy: mdUser.id,
    });

    assert.ok(dst1.id);
    assert.match(dst1.distributorCode, /^TRX-DST-\d{6}$/);
    assert.strictEqual(dst1.businessName, `Bengaluru Auto Tech ${uniquePrefix}`);
    distributor1Id = dst1.id;

    const dst2 = await distributorsRepository.create({
      businessName: `Mumbai Pro Detail Supply ${uniquePrefix}`,
      contactPerson: 'Kunal Verma',
      phone: `98200${uniquePrefix}`,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      territory: 'Maharashtra & Gujarat',
      status: 'ACTIVE',
      createdBy: mdUser.id,
    });

    assert.ok(dst2.id);
    assert.match(dst2.distributorCode, /^TRX-DST-\d{6}$/);
    assert.notStrictEqual(dst1.distributorCode, dst2.distributorCode);
    distributor2Id = dst2.id;

    // Check findById & findByCode
    const foundById = await distributorsRepository.findById(distributor1Id);
    assert.ok(foundById);
    assert.strictEqual(foundById.businessName, dst1.businessName);
    assert.strictEqual(foundById.dealerCount, 0);

    const foundByCode = await distributorsRepository.findByCode(dst1.distributorCode);
    assert.ok(foundByCode);
    assert.strictEqual(foundByCode.id, dst1.id);

    // Update details
    const updated = await distributorsRepository.update(distributor1Id, {
      territory: 'Karnataka, Goa, and South Maharashtra',
      updatedBy: mdUser.id,
    });
    assert.strictEqual(updated.territory, 'Karnataka, Goa, and South Maharashtra');

    // Update status
    const statusUpdated = await distributorsRepository.updateStatus(distributor1Id, 'SUSPENDED', mdUser.id);
    assert.strictEqual(statusUpdated.status, 'SUSPENDED');

    // Restore to ACTIVE
    await distributorsRepository.updateStatus(distributor1Id, 'ACTIVE', mdUser.id);
  });

  test('Dealer creation with initial assignment and duplicate validation', async () => {
    // 1. Create first dealer assigned to distributor1
    const dl1 = await dealersRepository.create({
      businessName: `Zenith Car Studio ${uniquePrefix}`,
      legalName: `Zenith Detailing LLP`,
      contactPerson: 'Vikram Seth',
      phone: `99000${uniquePrefix}`,
      email: `vikram_${uniquePrefix}@zenithstudio.in`,
      addressLine1: '12 Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      distributorId: distributor1Id,
      status: 'ACTIVE',
      gstin: `29AAECZ${uniquePrefix.slice(0, 4)}K1ZX`,
      notes: 'Equipped with 3 PPF bays and ceramic curing booth',
      createdBy: mdUser.id,
    });

    assert.ok(dl1.id);
    assert.match(dl1.dealerCode, /^TRX-DLR-\d{6}$/);
    assert.strictEqual(dl1.distributorId, distributor1Id);
    dealer1Id = dl1.id;

    // Verify initial distributor assignment history was logged
    const history1 = await dealersRepository.getDistributorHistory(dl1.id);
    assert.strictEqual(history1.length, 1);
    assert.strictEqual(history1[0].previousDistributorId, null);
    assert.strictEqual(history1[0].newDistributorId, distributor1Id);

    // 2. Duplicate detection check
    const dupPhone = await dealersRepository.checkDuplicates({ phone: dl1.phone });
    assert.ok(dupPhone);
    assert.strictEqual(dupPhone.duplicateField, 'Phone number');

    const dupEmail = await dealersRepository.checkDuplicates({
      phone: '9111111111',
      email: dl1.email,
    });
    assert.ok(dupEmail);
    assert.strictEqual(dupEmail.duplicateField, 'Email address');

    const dupGstin = await dealersRepository.checkDuplicates({
      phone: '9111111111',
      gstin: dl1.gstin,
    });
    assert.ok(dupGstin);
    assert.strictEqual(dupGstin.duplicateField, 'GSTIN');

    // When excluding own ID, duplicates should return null
    const noDupSelf = await dealersRepository.checkDuplicates({
      phone: dl1.phone,
      email: dl1.email,
      gstin: dl1.gstin,
      excludeId: dl1.id,
    });
    assert.strictEqual(noDupSelf, null);

    // 3. Create unassigned dealer
    const dl2 = await dealersRepository.create({
      businessName: `Royal Gloss Garage ${uniquePrefix}`,
      contactPerson: 'Farhan Akhtar',
      phone: `98888${uniquePrefix}`,
      city: 'Mysuru',
      state: 'Karnataka',
      country: 'India',
      distributorId: null,
      status: 'ACTIVE',
      createdBy: mdUser.id,
    });

    assert.ok(dl2.id);
    assert.strictEqual(dl2.distributorId, null);
    dealer2Id = dl2.id;
  });

  test('Dealer distributor reassignment with immutable audit trail', async () => {
    // Reassign dealer1 from distributor1 to distributor2
    const reason = 'Strategic territory realignment for northern Bengaluru';
    const reassigned = await dealersRepository.reassignDistributor(
      dealer1Id,
      distributor2Id,
      reason,
      mdUser.id
    );

    assert.strictEqual(reassigned.dealer.distributorId, distributor2Id);
    assert.strictEqual(reassigned.history.previousDistributorId, distributor1Id);
    assert.strictEqual(reassigned.history.newDistributorId, distributor2Id);
    assert.strictEqual(reassigned.history.reason, reason);

    // Check full history ledger
    const fullHistory = await dealersRepository.getDistributorHistory(dealer1Id);
    assert.strictEqual(fullHistory.length, 2);
    assert.strictEqual(fullHistory[0].newDistributorId, distributor2Id);
    assert.strictEqual(fullHistory[1].newDistributorId, distributor1Id);

    // Unassign dealer from distributor2 to null
    const unassignReason = 'Dealer transitioned to direct factory supply account';
    const unassigned = await dealersRepository.reassignDistributor(
      dealer1Id,
      null,
      unassignReason,
      mdUser.id
    );

    assert.strictEqual(unassigned.dealer.distributorId, null);
    const afterUnassignHistory = await dealersRepository.getDistributorHistory(dealer1Id);
    assert.strictEqual(afterUnassignHistory.length, 3);
    assert.strictEqual(afterUnassignHistory[0].previousDistributorId, distributor2Id);
    assert.strictEqual(afterUnassignHistory[0].newDistributorId, null);

    // Reassign dealer2 from null to distributor1
    await dealersRepository.reassignDistributor(
      dealer2Id,
      distributor1Id,
      'Initial allocation to Karnataka distributor',
      mdUser.id
    );

    const d1Relations = await distributorsRepository.findById(distributor1Id);
    assert.ok(d1Relations);
    assert.strictEqual(d1Relations.dealerCount, 1);
    assert.strictEqual(d1Relations.activeDealerCount, 1);
  });

  test('Dealer requests creation and lifecycle state transitions', async () => {
    const request = await dealerRequestsRepository.create({
      dealerId: dealer2Id,
      type: 'AVAILABILITY',
      subject: 'Urgent stock needed for Ceramic Topcoat 50ml',
      description: 'Requires 20 bottles by Friday for a fleet booking',
      priority: 'HIGH',
      createdBy: mdUser.id,
    });

    assert.ok(request.id);
    assert.match(request.requestCode, /^TRX-REQ-\d{6}$/);
    assert.strictEqual(request.status, 'OPEN');
    assert.strictEqual(request.priority, 'HIGH');
    assert.strictEqual(request.resolvedAt, null);

    // Transition to IN_PROGRESS
    const inProgress = await dealerRequestsRepository.updateStatus(request.id, {
      status: 'IN_PROGRESS',
      assignedTo: mdUser.id,
    });
    assert.strictEqual(inProgress.status, 'IN_PROGRESS');
    assert.strictEqual(inProgress.assignedTo, mdUser.id);
    assert.strictEqual(inProgress.resolvedAt, null);

    // Transition to RESOLVED
    const resolved = await dealerRequestsRepository.updateStatus(request.id, {
      status: 'RESOLVED',
    });
    assert.strictEqual(resolved.status, 'RESOLVED');
    assert.ok(resolved.resolvedAt);

    // List requests for dealer2
    const listRes = await dealerRequestsRepository.list({ dealerId: dealer2Id });
    assert.strictEqual(listRes.total, 1);
    assert.strictEqual(listRes.items[0].id, request.id);
  });

  test('Internal notes creation for dealers and distributors', async () => {
    const noteDst = await internalNotesRepository.create({
      entityType: 'DISTRIBUTOR',
      entityId: distributor1Id,
      body: 'Verified warehouse humidity control for ceramic coatings storage.',
      createdBy: mdUser.id,
    });
    assert.ok(noteDst.id);
    assert.strictEqual(noteDst.entityType, 'DISTRIBUTOR');

    const noteDlr = await internalNotesRepository.create({
      entityType: 'DEALER',
      entityId: dealer1Id,
      body: 'Studio completed advanced PPF application certification training.',
      createdBy: mdUser.id,
    });
    assert.ok(noteDlr.id);
    assert.strictEqual(noteDlr.entityType, 'DEALER');

    const notesList = await internalNotesRepository.listForEntity('DEALER', dealer1Id);
    assert.strictEqual(notesList.length, 1);
    assert.strictEqual(notesList[0].body, noteDlr.body);
  });

  test('Role permissions and distributor scoping enforcement', async () => {
    assert.strictEqual(canManageDealers('MANAGING_DIRECTOR'), true);
    assert.strictEqual(canManageDealers('ADMIN'), true);
    assert.strictEqual(canManageDealers('DISTRIBUTOR'), false);

    assert.strictEqual(canManageDistributors('MANAGING_DIRECTOR'), true);
    assert.strictEqual(canManageDistributors('ADMIN'), true);
    assert.strictEqual(canManageDistributors('DISTRIBUTOR'), false);

    assert.strictEqual(canReassignDistributor('MANAGING_DIRECTOR'), true);
    assert.strictEqual(canReassignDistributor('DISTRIBUTOR'), false);

    // Managing director scope is null (company-wide)
    assert.strictEqual(getDistributorScope(mdUser), null);

    // Distributor user scope returns distributorId
    const scopedUser: SafeUser = {
      ...mdUser,
      id: 'dst-user-1',
      role: 'DISTRIBUTOR',
      distributorId: distributor1Id,
    };
    assert.strictEqual(getDistributorScope(scopedUser), distributor1Id);
  });

  test('Overview integration: activeDealers KPI and audit event formatting', async () => {
    // 1. Audit labels formatting
    assert.strictEqual(formatActivityLabel('DEALER_CREATED'), 'Dealer registered');
    assert.strictEqual(formatActivityLabel('DEALER_DISTRIBUTOR_REASSIGNED'), 'Dealer distributor reassigned');
    assert.strictEqual(formatActivityLabel('DISTRIBUTOR_CREATED'), 'Distributor registered');
    assert.strictEqual(formatActivityLabel('DEALER_REQUEST_CREATED'), 'Dealer request logged');
    assert.strictEqual(formatActivityLabel('DEALER_REQUEST_RESOLVED'), 'Dealer request resolved');

    // 2. MD overview includes real activeDealers count
    const mdOverview = await getInternalOverview(mdUser);
    assert.notStrictEqual(mdOverview.summary.activeDealers, null);
    assert.ok(typeof mdOverview.summary.activeDealers === 'number');
    assert.ok(mdOverview.summary.activeDealers! >= 2);

    // 3. Distributor overview scopes activeDealers count
    const dstScopedUser: SafeUser = {
      ...mdUser,
      id: 'dst-user-scoped',
      role: 'DISTRIBUTOR',
      distributorId: distributor1Id,
    };
    const dstOverview = await getInternalOverview(dstScopedUser);
    assert.notStrictEqual(dstOverview.summary.activeDealers, null);
    assert.strictEqual(dstOverview.summary.activeDealers, 1);
  });
});
