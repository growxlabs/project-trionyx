import { toolCallPart, activityName, ChainMockModel, textResult } from './tool-call';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MockLanguageModelV3 } from 'ai/test';
import { getDbClient, dealersRepository, distributorsRepository, dealerNetworkRepository } from '@trionyx/database';
import { createDealerNetworkService } from '@trionyx/api';
import type { SafeUser } from '@trionyx/types';
import { runTrix } from '../trix-agent';
import { searchDealers, searchDistributors, getDealerNetworkSummary, getDealerAssignmentHistory, getDealerNetworkExceptions } from '../tools/dealer-network';
import { dealerNetworkResponseSchema } from '../responses/dealer-network';

const db = getDbClient('file::memory:');
const md = { id: 'md', role: 'MANAGING_DIRECTOR', status: 'ACTIVE' } as SafeUser;
const context = { user: md, sessionId: 'session-secret', authorize: async () => md };
const service = createDealerNetworkService({
  listDealers: async query => {
    const result = await dealersRepository.list({ ...query, limit: query.pageSize }, db);
    return { items: result.items, meta: { total: result.total, page: result.page, pageSize: result.limit } };
  },
  listDistributors: async query => {
    const result = await distributorsRepository.list({ ...query, limit: query.pageSize }, db);
    return { items: result.items, meta: { total: result.total, page: result.page, pageSize: result.limit } };
  },
  summary: query => dealerNetworkRepository.summary(query, db), history: query => dealerNetworkRepository.history(query, db),
  exceptions: query => dealerNetworkRepository.exceptions(query, db),
});
let abc: string, paused: string, ravi: string, raviCode: string, abcCode: string, unassigned: string, orphan: string;
let businessSnapshot: string;
async function snapshot() { return JSON.stringify(await Promise.all(['dealers', 'distributors', 'dealer_distributor_history'].map(table => db.execute(`SELECT * FROM ${table} ORDER BY id`)))); }
function model(toolName: string, input: unknown) {
  return new ChainMockModel({ doGenerate: {
    content: [toolCallPart(randomUUID(), toolName, input)],
    finishReason: { unified: 'tool-calls', raw: undefined },
    usage: { inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 10, text: 10, reasoning: undefined } }, warnings: [],
  } });
}
const request = (message: string) => ({ conversationId: randomUUID(), message });
before(async () => {
  await db.batch(['CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT)', "INSERT INTO users VALUES ('md', 'MD')", 'CREATE TABLE _migrations (name TEXT UNIQUE)']);
  const migration = readFileSync(new URL('../../../database/migrations/0004_dealers_distributors.sql', import.meta.url), 'utf8');
  await db.batch(migration.split(';').filter(sql => sql.trim()));
  for (const [name, status] of [['ABC Distribution', 'ACTIVE'], ['Paused Distribution', 'INACTIVE'], ['Duplicate Distribution', 'ACTIVE'], ['Duplicate Distribution', 'ACTIVE'], ['Empty Distribution', 'SUSPENDED']] as const) {
    const record = await distributorsRepository.create({ businessName: name, status, city: 'Hyderabad', state: 'Telangana', contactPerson: 'Private contact', phone: 'secret-phone', email: 'private@example.test', createdBy: 'md' }, db);
    if (name === 'ABC Distribution') { abc = record.id; abcCode = record.distributorCode; } if (name === 'Paused Distribution') paused = record.id;
  }
  const fixtures = [
    ['Ravi Motors', 'ACTIVE', 'Telangana', abc], ['Unassigned Motors', 'ACTIVE', 'Telangana', null], ['Inactive Motors', 'INACTIVE', 'Telangana', abc],
    ['Suspended Motors', 'SUSPENDED', 'Telangana', paused], ['Paused Dealer', 'ACTIVE', 'Telangana', paused], ['Duplicate Motors', 'ACTIVE', 'Telangana', abc],
    ['Duplicate Motors', 'ACTIVE', 'Telangana', abc], ['Coastal Motors', 'ACTIVE', 'Goa', abc],
    ...Array.from({ length: 6 }, (_, i) => [`Preview ${i}`, 'ACTIVE', 'Telangana', abc]), ['Orphan Motors', 'ACTIVE', 'Telangana', null],
  ];
  for (const [name, status, state, distributorId] of fixtures) {
    const record = await dealersRepository.create({ businessName: name!, status: status as 'ACTIVE', city: state === 'Goa' ? 'Panaji' : 'Hyderabad', state: state!, distributorId,
      contactPerson: 'Private contact', phone: randomUUID(), email: 'private@example.test', createdBy: 'md' }, db);
    if (name === 'Ravi Motors') { ravi = record.id; raviCode = record.dealerCode; } if (name === 'Unassigned Motors') unassigned = record.id; if (name === 'Orphan Motors') orphan = record.id;
  }
  // Deliberately corrupt only this isolated fixture to exercise the integrity exception.
  await db.execute('PRAGMA foreign_keys = OFF');
  await db.execute({ sql: 'UPDATE dealers SET distributor_id = ? WHERE id = ?', args: ['missing-distributor', orphan] });
  await db.execute('PRAGMA foreign_keys = ON');
  await db.execute({ sql: 'INSERT INTO dealer_distributor_history (id, dealer_id, previous_distributor_id, new_distributor_id, reason, changed_by, changed_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['history-previous', ravi, paused, abc, 'private reason', 'md', '2026-09-01T12:00:00.000Z'] });
  businessSnapshot = await snapshot();
});
after(async () => { assert.equal(await snapshot(), businessSnapshot, 'Phase 03 must leave all business records unchanged'); db.close(); });

test('unassigned detail preserves null; unresolved reference never fabricates a distributor', async () => {
  const result = await searchDealers({ dealerId: unassigned }, md, service); assert.ok(result.success);
  if (result.success && result.response.type === 'dealer_list') assert.equal(result.response.items[0].assignedDistributor, null);
  const missing = await searchDealers({ dealerId: orphan }, md, service); assert.ok(!missing.success);
  if (!missing.success) assert.equal(missing.errorCode, 'TRIX_RELATIONSHIP_UNAVAILABLE');
});
for (const [label, input, expected] of [
  ['exact name', () => ({ query: 'Ravi Motors' }), 1], ['normalized name', () => ({ query: ' ravi motors ' }), 1], ['code', () => ({ dealerCode: raviCode }), 1],
  ['status', () => ({ status: 'INACTIVE' as const }), 1], ['city/state', () => ({ city: 'Panaji', state: 'goa' }), 1], ['distributor name', () => ({ distributorName: 'ABC Distribution' }), 11],
  ['distributor ID', () => ({ distributorId: abc }), 11], ['unassigned', () => ({ hasDistributor: false }), 1], ['empty', () => ({ query: 'Does not exist' }), 0],
] as const) test(`dealer search ${label}`, async () => {
  const result = await searchDealers(input(), md, service); assert.ok(result.success);
  if (!result.success || result.response.type !== 'dealer_list') return assert.fail(); assert.equal(result.response.pageInfo.total, expected);
});
test('dealer pagination is stable and bounded', async () => {
  const first = await searchDealers({ distributorId: abc, limit: 2 }, md, service); const second = await searchDealers({ distributorId: abc, limit: 2, page: 2 }, md, service);
  assert.ok(first.success && second.success);
  if (first.success && second.success && first.response.type === 'dealer_list' && second.response.type === 'dealer_list') {
    assert.equal(first.response.items.length, 2); assert.equal(first.response.pageInfo.hasMore, true);
    const secondItems = second.response.items;
    assert.ok(first.response.items.every(item => !secondItems.some(other => other.id === item.id)));
  }
});
for (const [name, invoke, code] of [
  ['ambiguous dealer search', () => searchDealers({ query: 'Duplicate Motors' }, md, service), 'TRIX_DEALER_AMBIGUOUS'],
  ['ambiguous distributor filter', () => searchDealers({ distributorName: 'Duplicate Distribution' }, md, service), 'TRIX_DISTRIBUTOR_AMBIGUOUS'],
  ['ambiguous distributor search', () => searchDistributors({ query: 'Duplicate Distribution' }, md, service), 'TRIX_DISTRIBUTOR_AMBIGUOUS'],
  ['missing distributor', () => searchDealers({ distributorName: 'Missing' }, md, service), 'TRIX_DISTRIBUTOR_NOT_FOUND'],
] as const) test(name, async () => { const result = await invoke(); assert.ok(!result.success); if (!result.success) assert.equal(result.errorCode, code); });
for (const [label, input, expected] of [
  ['exact name', () => ({ query: 'ABC Distribution' }), 1], ['code', () => ({ distributorCode: abcCode }), 1], ['status', () => ({ status: 'INACTIVE' as const }), 1],
  ['city/state', () => ({ city: 'hyderabad', state: 'telangana' }), 5], ['has dealers', () => ({ hasDealers: true }), 2], ['no dealers', () => ({ hasDealers: false }), 3], ['empty', () => ({ query: 'Missing' }), 0],
] as const) test(`distributor search ${label}`, async () => {
  const result = await searchDistributors(input(), md, service); assert.ok(result.success);
  if (result.success && result.response.type === 'distributor_list') assert.equal(result.response.pageInfo.total, expected);
});
test('distributor pagination/count and preview are bounded', async () => {
  const list = await searchDistributors({ limit: 2, page: 2 }, md, service); assert.ok(list.success);
  if (list.success && list.response.type === 'distributor_list') { assert.equal(list.response.items.length, 2); assert.equal(list.response.pageInfo.hasMore, true); }
  const abcResult = await searchDistributors({ distributorId: abc }, md, service); assert.ok(abcResult.success);
  if (abcResult.success && abcResult.response.type === 'distributor_list') assert.equal(abcResult.response.items[0].dealerCount, 11);
});
for (const groupBy of ['distributor', 'dealer_status', 'state', 'assignment_status'] as const) test(`summary ${groupBy} computes exact counts with bounded groups`, async () => {
  const result = await getDealerNetworkSummary({ groupBy }, md, service); assert.ok(result.success);
  if (!result.success || result.response.type !== 'dealer_network_summary') return assert.fail();
  assert.equal(result.response.totalDealers, 15); assert.equal(result.response.totalDistributors, 5); assert.equal(result.response.groups.reduce((sum, group) => sum + group.count, 0), 15);
  const groups: Record<string, number> = Object.fromEntries(result.response.groups.map(group => [group.key, group.count]));
  if (groupBy === 'dealer_status') assert.deepEqual(groups, { ACTIVE: 13, INACTIVE: 1, SUSPENDED: 1 });
  if (groupBy === 'state') assert.deepEqual(groups, { Telangana: 14, Goa: 1 });
  if (groupBy === 'assignment_status') assert.deepEqual(groups, { assigned: 14, unassigned: 1 });
  if (groupBy === 'distributor') {
    const distributorGroups: Record<string, number> = Object.fromEntries(result.response.groups.map(group => [group.key, group.count]));
    assert.equal(distributorGroups[abc], 11); assert.equal(distributorGroups[paused], 2); assert.equal(distributorGroups.unassigned, 1);
  }
  const paged = await getDealerNetworkSummary({ groupBy, limit: 1 }, md, service); assert.ok(paged.success);
  if (paged.success && paged.response.type === 'dealer_network_summary') { assert.equal(paged.response.groups.length, 1); assert.equal(paged.response.totalDealers, 15); assert.equal(paged.response.pageInfo.hasMore, true); }
});
test('filtered and zero-record summaries stay grounded', async () => {
  for (const [state, expected] of [['Telangana', 12], ['Missing state', 0]] as const) {
    const result = await getDealerNetworkSummary({ groupBy: 'state', dealerStatus: 'ACTIVE', state }, md, service); assert.ok(result.success);
    if (result.success && result.response.type === 'dealer_network_summary') assert.equal(result.response.totalDealers, expected);
  }
  const result = await getDealerNetworkSummary({ groupBy: 'distributor', distributorId: abc }, md, service); assert.ok(result.success);
  if (result.success && result.response.type === 'dealer_network_summary') assert.equal(result.response.totalDealers, 11);
});
test('history uses real ledger, dates, previous/new relationships, order and pagination', async () => {
  const result = await getDealerAssignmentHistory({ dealerId: ravi, from: '2026-09-01', to: '2026-09-01' }, md, service); assert.ok(result.success);
  if (!result.success || result.response.type !== 'dealer_assignment_history') return assert.fail();
  assert.equal(result.response.items.length, 1); assert.equal(result.response.items[0].previousDistributorName, 'Paused Distribution'); assert.equal(result.response.items[0].newDistributorName, 'ABC Distribution');
  assert.doesNotMatch(JSON.stringify(result), /private reason|changedBy/);
  const byDistributor = await getDealerAssignmentHistory({ distributorId: paused, limit: 1 }, md, service); assert.ok(byDistributor.success);
  if (byDistributor.success && byDistributor.response.type === 'dealer_assignment_history') { assert.equal(byDistributor.response.items.length, 1); assert.equal(byDistributor.response.pageInfo.total, 3); assert.equal(byDistributor.response.pageInfo.hasMore, true); }
  const history = await service.history({ dealerId: ravi }); assert.ok(history.items[0].changedAt >= history.items[1].changedAt);
  const page = await service.history({ dealerId: ravi, page: 2, limit: 1 }); assert.equal(page.items[0].id, 'history-previous');
});
test('missing assignment ledger is capability-unavailable', async () => {
  const missing = createDealerNetworkService({ ...service, history: async () => { throw new Error('no such table: dealer_distributor_history'); } });
  const result = await getDealerAssignmentHistory({}, md, missing);
  assert.deepEqual(result, { success: false, errorCode: 'TRIX_ASSIGNMENT_HISTORY_UNAVAILABLE', message: 'Dealer assignment history is unavailable in the current database.' });
});
for (const [type, severity] of [['ACTIVE_DEALER_UNASSIGNED', 'WARNING'], ['MISSING_DISTRIBUTOR', 'CRITICAL'], ['ACTIVE_DEALER_NON_ACTIVE_DISTRIBUTOR', 'WARNING']] as const) test(`exception ${type} is deterministic`, async () => {
  const result = await getDealerNetworkExceptions({ type }, md, service); assert.ok(result.success);
  if (!result.success || result.response.type !== 'dealer_network_exceptions') return assert.fail();
  assert.equal(result.response.totalExceptions, 1); assert.equal(result.response.items[0].severity, severity); assert.ok(await dealersRepository.findById(result.response.items[0].recordId, db));
  assert.doesNotMatch(JSON.stringify(result), /revenue|sales|score|poor/i);
});
test('exceptions are paginated', async () => {
  const result = await getDealerNetworkExceptions({ limit: 1 }, md, service); assert.ok(result.success);
  if (result.success && result.response.type === 'dealer_network_exceptions') { assert.equal(result.response.items.length, 1); assert.equal(result.response.totalExceptions, 3); assert.equal(result.response.pageInfo.hasMore, true); }
});
test('strict direct validation rejects identity, unsupported metrics, dates/limits and conflicting filters', async () => {
  const pending = [searchDealers({ limit: 1000 }, md, service), searchDealers({ page: 0 }, md, service), searchDealers({ role: 'MANAGING_DIRECTOR' } as never, md, service),
    searchDealers({ hasDistributor: false, distributorId: abc }, md, service), searchDistributors({ status: 'FAKE' } as never, md, service),
    getDealerNetworkSummary({ groupBy: 'revenue' } as never, md, service), getDealerAssignmentHistory({ from: '2026-02-30' }, md, service),
    getDealerAssignmentHistory({ from: '2026-10-01', to: '2026-09-01' }, md, service), getDealerNetworkExceptions({ type: 'POOR_SALES' } as never, md, service)];
  for (const result of await Promise.all(pending)) { assert.ok(!result.success); if (!result.success) assert.equal(result.errorCode, 'TRIX_INVALID_REQUEST'); }
});
test('database errors and malformed output are sanitized', async () => {
  const result = await searchDealers({}, md, { ...service, listDealers: async () => { throw new Error('postgres://secret password=secret'); } }); assert.ok(!result.success); assert.doesNotMatch(JSON.stringify(result), /postgres|password|secret/);
  const invalid = { ...service, summary: async () => ({ totalDealers: 1, totalDistributors: 1, groups: [{ key: 'x', label: 'x', count: -1 }], total: 1, page: 1, limit: 20 }) };
  assert.equal((await getDealerNetworkSummary({ groupBy: 'state' }, md, invalid)).success, false);
  assert.equal(dealerNetworkResponseSchema.safeParse({ type: 'dealer_detail', dealer: { revenue: 123 } }).success, false);
});
for (const [toolName, input, responseType] of [
  ['searchDealers', () => ({ dealerCode: raviCode }), 'dealer_list'], ['searchDistributors', () => ({}), 'distributor_list'],
   ['getDealerNetworkSummary', () => ({ groupBy: 'distributor' }), 'dealer_network_summary'],
  ['getDealerAssignmentHistory', () => ({ dealerId: ravi }), 'dealer_assignment_history'], ['getDealerNetworkExceptions', () => ({}), 'dealer_network_exceptions'],
] as const) test(`runtime ${toolName} persists sanitized telemetry`, async () => {
  const req = request('Read stored dealer network information.'); const mocked = model(toolName, input()); const first = mocked.doGenerate.bind(mocked); let step = 0;
  mocked.doGenerate = async options => step++ === 0 ? first(options) : { content: [{ type: 'text', text: 'done' }], finishReason: { unified: 'stop', raw: undefined }, usage: { inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 1, text: 1, reasoning: undefined } }, warnings: [] };
  const result = await runTrix(req, context, { model: mocked, dealerNetwork: service });
  assert.equal(result.response.type, responseType); assert.equal(result.activity.length, 1);
  assert.doesNotMatch(JSON.stringify(result), /session-secret|secret-phone|private@example|contactPerson|password/);
});
test('tool limit records excess calls and permits only six domain reads', async () => {
  const mocked = model('getDealerNetworkExceptions', {}); let reads = 0;
  let calls = 0; mocked.doGenerate = async options => calls++ ? textResult as never : ({ ...await model('getDealerNetworkExceptions', {}).doGenerate(options), content: [1, 2, 3, 4, 5, 6, 7, 8].map(i => (toolCallPart(`call-${i}`, 'getDealerNetworkExceptions', '{}'))) });
  const result = await runTrix(request('Read network exceptions.'), context, { model: mocked, dealerNetwork: { ...service, exceptions: async query => { reads++; return service.exceptions(query); } } });
  assert.equal(reads, 6); assert.equal(result.activity.length, 8);
});
test('named history resolves then reads real history within two calls', async () => {
  let step = 0; const mocked = model('getDealerDetails', { dealerName: 'Ravi Motors' });
  mocked.doGenerate = async options => { step++; if (step > 2) return textResult as never; return model(step === 1 ? 'getDealerDetails' : 'getDealerAssignmentHistory', step === 1 ? { dealerName: 'Ravi Motors' } : { dealerId: ravi }).doGenerate(options); };
  const result = await runTrix(request('Who was Ravi Motors assigned to before?'), context, { model: mocked, dealerNetwork: service });
  assert.equal(step, 3); assert.equal(result.response.type, 'dealer_assignment_history'); assert.equal(result.activity.length, 2);
});
