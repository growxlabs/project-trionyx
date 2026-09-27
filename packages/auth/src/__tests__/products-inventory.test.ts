import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import {
  runMigrations,
  usersRepository,
  categoriesRepository,
  productsRepository,
  specificationsRepository,
  locationsRepository,
  serialsRepository,
  serialMovementsRepository,
} from '@trionyx/database';
import {
  canWriteProducts,
  canMutateInventory,
  canManageLocations,
  getInternalOverview,
} from '../index';
import { hashPassword } from '../crypto';
import type { SafeUser } from '@trionyx/types';

describe('Products & Serial Number Inventory Production Suite', () => {
  let mdUser: SafeUser;
  let categoryId: string;
  let locationAId: string;
  let locationBId: string;
  let productId: string;
  const uniquePrefix = Date.now().toString().slice(-6);

  const testSerial1 = `TRX-SN1-${uniquePrefix}`;
  const testSerial2 = `TRX-SN2-${uniquePrefix}`;
  const testSerial3 = `TRX-SN3-${uniquePrefix}`;

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

    // Create test category
    const cat = await categoriesRepository.create({
      name: `Ceramics Category ${uniquePrefix}`,
      slug: `ceramics-${uniquePrefix}`,
      description: 'Advanced ceramic and graphene formulas',
    });
    categoryId = cat.id;

    // Create two test facilities / locations
    const locA = await locationsRepository.create({
      code: `LOC-WH-A-${uniquePrefix}`,
      name: `Central Warehouse ${uniquePrefix}`,
      status: 'ACTIVE',
    });
    locationAId = locA.id;

    const locB = await locationsRepository.create({
      code: `LOC-WH-B-${uniquePrefix}`,
      name: `Regional Depot ${uniquePrefix}`,
      status: 'ACTIVE',
    });
    locationBId = locB.id;
  });

  test('1. Role authorization guards check correct permissions', () => {
    assert.strictEqual(canWriteProducts('MANAGING_DIRECTOR'), true);
    assert.strictEqual(canWriteProducts('ADMIN'), true);
    assert.strictEqual(canWriteProducts('DISTRIBUTOR'), false);

    assert.strictEqual(canMutateInventory('MANAGING_DIRECTOR'), true);
    assert.strictEqual(canMutateInventory('ADMIN'), true);
    assert.strictEqual(canMutateInventory('DISTRIBUTOR'), false);

    assert.strictEqual(canManageLocations('MANAGING_DIRECTOR'), true);
    assert.strictEqual(canManageLocations('ADMIN'), true);
    assert.strictEqual(canManageLocations('DISTRIBUTOR'), false);
  });

  test('2. Product creation without SKUs or variants', async () => {
    const product = await productsRepository.create({
      name: `Graphene Diamond Shield ${uniquePrefix}`,
      slug: `graphene-shield-${uniquePrefix}`,
      categoryId,
      shortDescription: '10H Hardness ceramic formula',
      description: 'Engineered for extreme Indian weather conditions.',
      status: 'ACTIVE',
      publicVisibility: 'PUBLIC',
      createdBy: mdUser.id,
    });

    productId = product.id;
    assert.ok(product.id);
    assert.match(product.productCode, /^TRX-PROD-\d{6}$/);
    assert.strictEqual(product.name, `Graphene Diamond Shield ${uniquePrefix}`);

    // Add specifications
    await specificationsRepository.replaceForProduct(productId, [
      { label: 'Hardness', value: '10H Certified', sortOrder: 0 },
      { label: 'Durability', value: '5 Years', sortOrder: 1 },
    ]);

    const specs = await specificationsRepository.listByProduct(productId);
    assert.strictEqual(specs.length, 2);
  });

  test('3. Batch receive physical serial numbers into location A', async () => {
    const createdSerials = await serialsRepository.receiveBatch({
      productId,
      locationId: locationAId,
      serialNumbers: [testSerial1, testSerial2, testSerial3],
      reference: 'PO-TEST-1001',
      notes: 'Initial production line receipt',
      actorId: mdUser.id,
    });

    assert.strictEqual(createdSerials.length, 3);
    assert.strictEqual(createdSerials[0].status, 'AVAILABLE');
    assert.strictEqual(createdSerials[0].locationId, locationAId);

    // Verify derived available count
    const availableCount = await serialsRepository.countAvailableForProduct(productId);
    assert.strictEqual(availableCount, 3);
  });

  test('4. Reject duplicate serial numbers in batch and across database', async () => {
    // Within batch duplicate
    await assert.rejects(
      async () => {
        await serialsRepository.receiveBatch({
          productId,
          locationId: locationAId,
          serialNumbers: ['DUP-001', 'DUP-001'],
          actorId: mdUser.id,
        });
      },
      /Duplicate serial numbers in batch/
    );

    // Collision with already existing serial number
    await assert.rejects(
      async () => {
        await serialsRepository.receiveBatch({
          productId,
          locationId: locationAId,
          serialNumbers: [testSerial1],
          actorId: mdUser.id,
        });
      },
      /already exist in system/
    );
  });

  test('5. Direct serial number lookup with full lineage and movements', async () => {
    const details = await serialsRepository.findBySerialNumber(testSerial1);
    assert.ok(details);
    assert.strictEqual(details.serialNumber, testSerial1);
    assert.strictEqual(details.status, 'AVAILABLE');
    assert.strictEqual(details.product?.id, productId);
    assert.strictEqual(details.location?.id, locationAId);

    assert.ok(details.movements && details.movements.length >= 1);
    assert.strictEqual(details.movements[0].type, 'RECEIVED');
    assert.strictEqual(details.movements[0].reference, 'PO-TEST-1001');
  });

  test('6. Transfer serial number from location A to location B', async () => {
    const transferred = await serialsRepository.transferBatch({
      serialNumbers: [testSerial1],
      sourceLocationId: locationAId,
      destinationLocationId: locationBId,
      reference: 'TRF-TEST-2001',
      notes: 'Replenishment transfer',
      actorId: mdUser.id,
    });

    assert.strictEqual(transferred.length, 1);
    assert.strictEqual(transferred[0].locationId, locationBId);

    // Verify updated location via lookup
    const lookedUp = await serialsRepository.findBySerialNumber(testSerial1);
    assert.ok(lookedUp);
    assert.strictEqual(lookedUp.locationId, locationBId);
    assert.ok(lookedUp.movements && lookedUp.movements.length === 2);
    assert.strictEqual(lookedUp.movements[0].type, 'TRANSFERRED');
  });

  test('7. Adjust serial status with mandatory audit reason', async () => {
    const serialRecord = await serialsRepository.findBySerialNumber(testSerial2);
    assert.ok(serialRecord);

    const updated = await serialsRepository.adjustStatus({
      serialRecordId: serialRecord.id,
      newStatus: 'INACTIVE',
      reason: 'Physical inspection detected broken seal',
      notes: 'Transferred to containment bay',
      actorId: mdUser.id,
    });

    assert.strictEqual(updated.status, 'INACTIVE');

    // Available count should now be 2 (testSerial1 + testSerial3)
    const availableCount = await serialsRepository.countAvailableForProduct(productId);
    assert.strictEqual(availableCount, 2);

    // Verify movement recorded
    const lookedUp = await serialsRepository.findBySerialNumber(testSerial2);
    assert.ok(lookedUp);
    assert.strictEqual(lookedUp.status, 'INACTIVE');
    assert.ok(lookedUp.movements && lookedUp.movements.length > 0);
    assert.strictEqual(lookedUp.movements[0].type, 'ADJUSTED');
    assert.match(lookedUp.movements[0].reason || '', /broken seal/);
  });

  test('8. Serial movements ledger audit history', async () => {
    const movements = await serialMovementsRepository.listWithDetails({ productId });
    assert.ok(movements.length >= 4);

    const types = movements.map((m) => m.type);
    assert.ok(types.includes('RECEIVED'));
    assert.ok(types.includes('TRANSFERRED'));
    assert.ok(types.includes('ADJUSTED'));
  });

  test('9. Overview aggregates live serial inventory metrics', async () => {
    const overview = await getInternalOverview(mdUser);
    assert.ok(overview);
    assert.strictEqual(typeof overview.summary.lowStock, 'number');
    assert.ok(Array.isArray(overview.recentActivity));
    assert.ok(Array.isArray(overview.attentionItems));
  });
});
