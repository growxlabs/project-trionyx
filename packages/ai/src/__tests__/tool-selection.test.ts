import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeTrixTools } from '../tool-selection';
import { MockLanguageModelV3 } from 'ai/test';
import { runTrix } from '../trix-agent';
import type { SafeUser } from '@trionyx/types';
test('module-specific requests omit unrelated tools to reduce provider prompt cost', () => {
  assert.deepEqual(activeTrixTools('Where is serial TRIX?'), ['lookupSerial']);
  assert.deepEqual(activeTrixTools('Show inventory by location'), ['lookupSerial', 'searchInventory', 'getInventorySummary', 'getRecentSerialMovements', 'getInventoryExceptions']);
  const enquiries = activeTrixTools('Show unassigned dealer enquiries about products.')!;
  assert.equal(enquiries.length, 5); assert.ok(enquiries.includes('searchEnquiries')); assert.ok(!enquiries.includes('searchDealers'));
  const network = activeTrixTools('Who was this dealer assigned to before?')!;
  assert.ok(network.includes('getDealerAssignmentHistory')); assert.ok(network.includes('getDealerDetails'));
  assert.equal(activeTrixTools('Explain supported capabilities'), undefined);
});
const user = { id: 'test-md', role: 'MANAGING_DIRECTOR', status: 'ACTIVE' } as SafeUser;
const context = { user, sessionId: 'test-session', authorize: async () => user };
test('greetings and missing serial numbers do not consume provider credit', async () => {
  const model = new MockLanguageModelV3({ doGenerate: async () => { assert.fail('No provider call needed'); } });
  for (const message of ['hii', 'Where is serial', 'Check serial number?']) {
    const result = await runTrix({ conversationId: crypto.randomUUID(), message }, context, { model, logs: { create: async () => {}, update: async () => {} } });
    assert.equal(result.response.type, 'message'); assert.equal(result.activity.length, 0);
    if (result.response.type === 'message') { assert.equal(result.response.errorCode, undefined); assert.match(result.response.summary, /full serial number/); }
  }
});
test('provider 402 returns a safe actionable limit error', async () => {
  const model = new MockLanguageModelV3({ doGenerate: async () => { throw Object.assign(new Error('private provider key URL'), { statusCode: 402 }); } });
  const result = await runTrix({ conversationId: crypto.randomUUID(), message: 'Show inventory summary' }, context, { model, logs: { create: async () => {}, update: async () => {} } });
  assert.equal(result.response.type, 'message');
  if (result.response.type === 'message') { assert.equal(result.response.errorCode, 'PROVIDER_LIMIT_REACHED'); assert.doesNotMatch(result.response.summary, /private/); }
});
