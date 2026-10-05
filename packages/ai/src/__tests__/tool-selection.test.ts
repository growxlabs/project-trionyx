import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockLanguageModelV3 } from 'ai/test';
import { runTrix } from '../trix-agent';
import type { SafeUser } from '@trionyx/types';
const user = { id: 'test-md', role: 'MANAGING_DIRECTOR', status: 'ACTIVE' } as SafeUser;
const context = { user, sessionId: 'test-session', authorize: async () => user };
test('provider 402 returns a safe actionable limit error', async () => {
  const model = new MockLanguageModelV3({ doGenerate: async () => { throw Object.assign(new Error('private provider key URL'), { statusCode: 402 }); } });
  const result = await runTrix({ conversationId: crypto.randomUUID(), message: 'Show inventory summary' }, context, { model });
  assert.equal(result.response.type, 'message');
  if (result.response.type === 'message') { assert.equal(result.response.errorCode, 'PROVIDER_LIMIT_REACHED'); assert.doesNotMatch(result.response.summary, /private/); }
});
