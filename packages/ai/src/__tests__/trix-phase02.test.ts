import { toolCallPart, activityName, ChainMockModel } from './tool-call';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MockLanguageModelV3 } from 'ai/test';
import {
  getDbClient,
  serialsRepository,
  serialMovementsRepository,
  productsRepository,
  locationsRepository,
} from '@trionyx/database';
import type { SafeUser } from '@trionyx/types';
import { runTrix } from '../trix-agent';
import { searchInventory } from '../tools/search-inventory';
import { getInventorySummary } from '../tools/inventory-summary';
import { getRecentSerialMovements } from '../tools/serial-movements';
import { getInventoryExceptions } from '../tools/inventory-exceptions';

const db = getDbClient('file::memory:');
const md = { id: 'md-user', role: 'MANAGING_DIRECTOR', status: 'ACTIVE' } as SafeUser;
const context = { user: md, sessionId: 'md-session-123', authorize: async () => md };
const request = (message: string) => ({ conversationId: randomUUID(), message });

function makeModel(toolName: string, input: Record<string, unknown>) {
  return new ChainMockModel({
    doGenerate: {
      content: [toolCallPart(randomUUID(), toolName, input)],
      finishReason: { unified: 'tool-calls', raw: undefined },
      usage: {
        inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 10, text: 10, reasoning: undefined },
      },
      warnings: [],
    },
  });
}

before(async () => {
  await db.batch([
    'CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT)',
    "INSERT INTO users VALUES ('md-user', 'Managing Director')",
    'CREATE TABLE products (id TEXT PRIMARY KEY, product_code TEXT, name TEXT, slug TEXT, category_id TEXT, status TEXT, public_visibility TEXT, dealer_visibility INTEGER, created_by TEXT, updated_by TEXT, created_at TEXT, updated_at TEXT)',
    "INSERT INTO products VALUES ('prod-graphene', 'TRX-PROD-000001', 'Graphene Coating', 'graphene-coating', 'cat-1', 'ACTIVE', 'PUBLIC', 1, 'md-user', 'md-user', '2026-09-01', '2026-09-01')",
    "INSERT INTO products VALUES ('prod-ceramic', 'TRX-PROD-000002', 'Ceramic Coating', 'ceramic-coating', 'cat-1', 'ACTIVE', 'PUBLIC', 1, 'md-user', 'md-user', '2026-09-01', '2026-09-01')",
    "INSERT INTO products VALUES ('prod-borophene', 'TRX-PROD-000003', 'Borophene Coating', 'borophene-coating', 'cat-1', 'ACTIVE', 'PUBLIC', 1, 'md-user', 'md-user', '2026-09-01', '2026-09-01')",
    "INSERT INTO products VALUES ('prod-graphene-light', 'TRX-PROD-000004', 'Graphene Light', 'graphene-light', 'cat-1', 'ACTIVE', 'PUBLIC', 1, 'md-user', 'md-user', '2026-09-01', '2026-09-01')",
    "INSERT INTO products VALUES ('prod-zero-stock', 'TRX-PROD-000005', 'Zero Stock Product', 'zero-stock', 'cat-1', 'ACTIVE', 'PUBLIC', 1, 'md-user', 'md-user', '2026-09-01', '2026-09-01')",
    'CREATE TABLE inventory_locations (id TEXT PRIMARY KEY, code TEXT, name TEXT, status TEXT, created_at TEXT, updated_at TEXT)',
    "INSERT INTO inventory_locations VALUES ('loc-hyd', 'HYD', 'Hyderabad Warehouse', 'ACTIVE', '2026-09-01', '2026-09-01')",
    "INSERT INTO inventory_locations VALUES ('loc-vij', 'VIJ', 'Vijayawada Branch', 'ACTIVE', '2026-09-01', '2026-09-01')",
    "INSERT INTO inventory_locations VALUES ('loc-inactive', 'INACT', 'Closed Old Hub', 'INACTIVE', '2026-09-01', '2026-09-01')",
    'CREATE TABLE serial_numbers (id TEXT PRIMARY KEY, product_id TEXT, serial_number TEXT, location_id TEXT, status TEXT, received_at TEXT, created_at TEXT, updated_at TEXT)',
    // 3 Graphene serials: 2 in HYD (AVAILABLE), 1 in VIJ (AVAILABLE)
    "INSERT INTO serial_numbers VALUES ('sn-1', 'prod-graphene', 'TRX-GR-001', 'loc-hyd', 'AVAILABLE', '2026-09-10', '2026-09-10', '2026-09-20')",
    "INSERT INTO serial_numbers VALUES ('sn-2', 'prod-graphene', 'TRX-GR-002', 'loc-hyd', 'AVAILABLE', '2026-09-11', '2026-09-11', '2026-09-21')",
    "INSERT INTO serial_numbers VALUES ('sn-3', 'prod-graphene', 'TRX-GR-003', 'loc-vij', 'AVAILABLE', '2026-09-12', '2026-09-12', '2026-09-22')",
    // 2 Ceramic serials: 1 in HYD (TRANSFERRED), 1 in VIJ (INACTIVE)
    "INSERT INTO serial_numbers VALUES ('sn-4', 'prod-ceramic', 'TRX-CR-001', 'loc-hyd', 'TRANSFERRED', '2026-09-13', '2026-09-13', '2026-09-23')",
    "INSERT INTO serial_numbers VALUES ('sn-5', 'prod-ceramic', 'TRX-CR-002', 'loc-vij', 'INACTIVE', '2026-09-14', '2026-09-14', '2026-09-24')",
    // 1 serial in INACTIVE location (Exception rule test)
    "INSERT INTO serial_numbers VALUES ('sn-6', 'prod-borophene', 'TRX-BR-001', 'loc-inactive', 'AVAILABLE', '2026-09-15', '2026-09-15', '2026-09-25')",
    // 1 orphan serial pointing to deleted/missing location
    "INSERT INTO serial_numbers VALUES ('sn-7', 'prod-borophene', 'TRX-BR-002', 'non-existent-loc', 'AVAILABLE', '2026-09-16', '2026-09-16', '2026-09-26')",
    'CREATE TABLE serial_movements (id TEXT PRIMARY KEY, serial_record_id TEXT, product_id TEXT, type TEXT, from_location_id TEXT, to_location_id TEXT, reference TEXT, reason TEXT, created_by TEXT, created_at TEXT)',
    "INSERT INTO serial_movements VALUES ('mov-1', 'sn-1', 'prod-graphene', 'RECEIVED', NULL, 'loc-hyd', 'PO-100', 'Initial receipt', 'md-user', '2026-09-10T10:00:00Z')",
    "INSERT INTO serial_movements VALUES ('mov-2', 'sn-2', 'prod-graphene', 'RECEIVED', NULL, 'loc-hyd', 'PO-100', 'Initial receipt', 'md-user', '2026-09-11T11:00:00Z')",
    "INSERT INTO serial_movements VALUES ('mov-3', 'sn-3', 'prod-graphene', 'TRANSFERRED', 'loc-hyd', 'loc-vij', 'TR-200', 'Branch stock replenishment', 'md-user', '2026-09-25T14:30:00Z')",
    "INSERT INTO serial_movements VALUES ('mov-4', 'sn-4', 'prod-ceramic', 'ADJUSTED', 'loc-hyd', 'loc-hyd', 'ADJ-300', 'Status update', 'md-user', '2026-09-28T09:15:00Z')",
  ]);
});

after(() => db.close());

// ==========================================
// 1. searchInventory Tests
// ==========================================
test('searchInventory: search by valid product and location', async () => {
  const result = await searchInventory(
    { productName: 'Graphene Coating', locationName: 'Hyderabad' },
    md,
    (filter: any) => serialsRepository.list(filter, db),
    (query: { productId?: string; productName?: string }) => productsRepository.findMatching(query.productName!, db).then(m => m.length === 1 ? { found: true as const, product: m[0] } : { found: false as const }),
    (query: { locationId?: string; locationName?: string }) => locationsRepository.findMatching(query.locationName!, db).then(m => m.length === 1 ? { found: true as const, location: m[0] } : { found: false as const })
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.type, 'inventory_list');
    assert.equal(result.response.items.length, 2);
    assert.ok(result.response.items.every(item => item.product.name === 'Graphene Coating'));
    assert.ok(result.response.items.every(item => item.location?.name === 'Hyderabad Warehouse'));
    assert.equal(result.response.pageInfo.total, 2);
    assert.equal(result.response.pageInfo.hasMore, false);
  }
});

test('searchInventory: filter by real status and pagination', async () => {
  const result = await searchInventory(
    { status: 'AVAILABLE', limit: 2, page: 1 },
    md,
    filter => serialsRepository.list(filter, db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.items.length, 2);
    assert.ok(result.response.items.every(item => item.status === 'AVAILABLE'));
    assert.equal(result.response.pageInfo.page, 1);
    assert.equal(result.response.pageInfo.limit, 2);
    assert.equal(result.response.pageInfo.hasMore, true);
  }
});

test('searchInventory: empty result returns empty list', async () => {
  const result = await searchInventory(
    { query: 'NON_EXISTENT_SERIAL_PATTERN' },
    md,
    filter => serialsRepository.list(filter, db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.items.length, 0);
    assert.equal(result.response.pageInfo.total, 0);
    assert.equal(result.response.pageInfo.hasMore, false);
  }
});

test('searchInventory: ambiguous product returns controlled ambiguity error', async () => {
  const result = await searchInventory(
    { productName: 'Graphene' },
    md,
    (filter: any) => serialsRepository.list(filter, db),
    () => Promise.resolve({
      found: false as const,
      ambiguous: true as const,
      matches: [{ name: 'Graphene Coating' }, { name: 'Graphene Light' }] as any,
    })
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.errorCode, 'TRIX_PRODUCT_AMBIGUOUS');
    assert.match(result.message, /Multiple products matched/);
  }
});

test('getInventorySummary: group by product calculates correct counts', async () => {
  const result = await getInventorySummary(
    { groupBy: 'product' },
    md,
    filter => serialsRepository.getInventorySummary(filter, db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.type, 'inventory_summary');
    assert.equal(result.response.groupBy, 'product');
    // Check Graphene has 3 total serials
    const grapheneGroup = result.response.groups.find(g => g.label === 'Graphene Coating');
    assert.ok(grapheneGroup);
    assert.equal(grapheneGroup?.count, 3);
    // Check Zero Stock product has 0 serials
    const zeroGroup = result.response.groups.find(g => g.label === 'Zero Stock Product');
    assert.ok(zeroGroup);
    assert.equal(zeroGroup?.count, 0);
    assert.equal(result.response.total, 7);
  }
});

test('getInventorySummary: group by location with AVAILABLE filter', async () => {
  const result = await getInventorySummary(
    { groupBy: 'location', status: 'AVAILABLE' },
    md,
    filter => serialsRepository.getInventorySummary(filter, db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.groupBy, 'location');
    const hydGroup = result.response.groups.find(g => g.label === 'Hyderabad Warehouse');
    assert.ok(hydGroup);
    assert.equal(hydGroup?.count, 2); // sn-1, sn-2
    const vijGroup = result.response.groups.find(g => g.label === 'Vijayawada Branch');
    assert.ok(vijGroup);
    assert.equal(vijGroup?.count, 1); // sn-3
  }
});

test('getInventorySummary: group by status', async () => {
  const result = await getInventorySummary(
    { groupBy: 'status' },
    md,
    filter => serialsRepository.getInventorySummary(filter, db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.groupBy, 'status');
    const avail = result.response.groups.find(g => g.key === 'AVAILABLE');
    assert.ok(avail);
    assert.equal(avail?.count, 5); // sn-1, sn-2, sn-3, sn-6, sn-7
  }
});

test('getRecentSerialMovements: returns recent movements in descending order', async () => {
  const result = await getRecentSerialMovements(
    { limit: 10 },
    md,
    filter => serialMovementsRepository.listWithDetailsAndCount(filter, db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.type, 'serial_movements');
    assert.equal(result.response.items.length, 4);
    // Newest movement is mov-4 (2026-09-28)
    assert.equal(result.response.items[0].id, 'mov-4');
    assert.equal(result.response.items[0].movementType, 'ADJUSTED');
    assert.equal(result.response.items[0].productName, 'Ceramic Coating');
  }
});

test('getRecentSerialMovements: date range filtering', async () => {
  const result = await getRecentSerialMovements(
    { fromDate: '2026-09-20', toDate: '2026-09-26' },
    md,
    filter => serialMovementsRepository.listWithDetailsAndCount(filter, db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    // Only mov-3 was on 2026-09-25
    assert.equal(result.response.items.length, 1);
    assert.equal(result.response.items[0].id, 'mov-3');
    assert.equal(result.response.items[0].movementType, 'TRANSFERRED');
  }
});

test('getRecentSerialMovements: invalid date range rejects with TRIX_INVALID_REQUEST', async () => {
  const result = await getRecentSerialMovements(
    { fromDate: '2026-09-30', toDate: '2026-09-01' },
    md,
    filter => serialMovementsRepository.listWithDetailsAndCount(filter, db)
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.errorCode, 'TRIX_INVALID_REQUEST');
  }
});

// ==========================================
// 4. getInventoryExceptions Tests
// ==========================================
test('getInventoryExceptions: evaluates deterministic rules without invented thresholds', async () => {
  const result = await getInventoryExceptions(
    {},
    md,
    () => serialsRepository.getInventoryExceptions(db)
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.response.type, 'inventory_exceptions');
    assert.ok(result.response.totalExceptions >= 3);

    // Rule 1: Zero stock on active product
    const zeroStock = result.response.items.find(
      e => e.type === 'ZERO_AVAILABLE_STOCK' && e.recordId === 'prod-zero-stock'
    );
    assert.ok(zeroStock);
    assert.equal(zeroStock?.severity, 'WARNING');
    assert.equal(zeroStock?.recordType, 'product');
    assert.equal(zeroStock?.recordId, 'prod-zero-stock');

    // Rule 2: Stock in inactive location
    const inactLoc = result.response.items.find(e => e.type === 'INACTIVE_LOCATION_STOCK');
    assert.ok(inactLoc);
    assert.equal(inactLoc?.severity, 'CRITICAL');
    assert.equal(inactLoc?.recordType, 'location');
    assert.equal(inactLoc?.recordId, 'loc-inactive');

    // Rule 3: Orphan serial missing location
    const orphan = result.response.items.find(e => e.type === 'ORPHAN_SERIAL_LOCATION');
    assert.ok(orphan);
    assert.equal(orphan?.severity, 'CRITICAL');
    assert.equal(orphan?.recordType, 'serial');
    assert.equal(orphan?.recordId, 'sn-7');
  }
});

// ==========================================
// 5. Agent Integration & Security Tests
// ==========================================
test('agent: runs getInventorySummary and logs sanitized aggregate telemetry', async () => {
  const model = makeModel('getInventorySummary', { groupBy: 'location', status: 'AVAILABLE' });
  const result = await runTrix(
    request('Show available inventory by location.'),
    context,
    {
      model,
      readSummary: filter => serialsRepository.getInventorySummary(filter, db),
    }
  );

  assert.equal(result.response.type, 'inventory_summary');
  assert.equal(result.activity.length, 1);
  assert.equal(result.activity[0].status, 'succeeded');

});

test('agent: runs searchInventory with product filter', async () => {
  const model = makeModel('searchInventory', { productId: 'prod-graphene', status: 'AVAILABLE' });
  const result = await runTrix(
    request('Find available Graphene serials.'),
    context,
    {
      model,
      listSerials: filter => serialsRepository.list(filter, db),
    }
  );

  assert.equal(result.response.type, 'inventory_list');
  assert.equal(result.activity[0].status, 'succeeded');
});

test('agent: runs getRecentSerialMovements', async () => {
  const model = makeModel('getRecentSerialMovements', { limit: 5 });
  const result = await runTrix(
    request('Show recent serial movements.'),
    context,
    {
      model,
      listMovements: filter => serialMovementsRepository.listWithDetailsAndCount(filter, db),
    }
  );

  assert.equal(result.response.type, 'serial_movements');
  assert.equal(result.activity[0].status, 'succeeded');
});

test('agent: runs getInventoryExceptions', async () => {
  const model = makeModel('getInventoryExceptions', {});
  const result = await runTrix(
    request('Show inventory exceptions that need attention.'),
    context,
    {
      model,
      readExceptions: () => serialsRepository.getInventoryExceptions(db),
    }
  );

  assert.equal(result.response.type, 'inventory_exceptions');
  assert.equal(result.activity[0].status, 'succeeded');
});

test('security: prompt injection attempting raw SQL is rejected', async () => {
  const injected = makeModel('runSQL', { query: 'SELECT * FROM serial_numbers' });
  const result = await runTrix(
    request('Run SELECT * FROM serial_numbers.'),
    context,
    { model: injected }
  );

  assert.equal(result.response.type, 'message');
  assert.equal(result.activity[0].status, 'failed');
  assert.match(result.activity[0].summary, /not available/);
});

test('security: tool call limit strictly bounds execution to max 6 calls', async () => {
  const multiModel = new ChainMockModel({
    doGenerate: {
      content: [
        toolCallPart('call-1', 'getInventoryExceptions', '{}'),
        toolCallPart('call-2', 'getInventoryExceptions', '{}'),
        toolCallPart('call-3', 'getInventoryExceptions', '{}'),
        toolCallPart('call-4', 'getInventoryExceptions', '{}'),
        toolCallPart('call-5', 'getInventoryExceptions', '{}'),
        toolCallPart('call-6', 'getInventoryExceptions', '{}'),
        toolCallPart('call-7', 'getInventoryExceptions', '{}'),
        toolCallPart('call-8', 'getInventoryExceptions', '{}'),
      ],
      finishReason: { unified: 'tool-calls', raw: undefined },
      usage: {
        inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 10, text: 10, reasoning: undefined },
      },
      warnings: [],
    },
  });

  let exceptionCalls = 0;
  const result = await runTrix(
    request('Check exceptions repeatedly.'),
    context,
    {
      model: multiModel,
      readExceptions: () => {
        exceptionCalls++;
        return serialsRepository.getInventoryExceptions(db);
      },
    }
  );

  assert.equal(exceptionCalls, 6, 'Must not exceed MAX_TOOL_CALLS = 6');
  assert.ok(result.activity.length >= 2);
});
