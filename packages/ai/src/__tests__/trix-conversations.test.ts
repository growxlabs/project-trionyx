import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { getDbClient, trixConversationsRepository } from '@trionyx/database';
import { POSTGRES_TABLE_STATEMENTS } from '../../../database/src/postgresSchema';
import { TRIX_TABLE_STATEMENTS } from '../../../database/src/trixSchema';

async function setupTestDb() {
  const db = getDbClient('file::memory:');
  await db.batch(['PRAGMA foreign_keys=ON', 'CREATE TABLE IF NOT EXISTS _migrations (name TEXT UNIQUE)', ...POSTGRES_TABLE_STATEMENTS]);
  await db.batch(TRIX_TABLE_STATEMENTS);
  return db;
}

test('trixConversationsRepository lifecycle and multi-tenancy isolation', async () => {
  const db = await setupTestDb();

  const userA = 'user-a-' + randomUUID();
  const userB = 'user-b-' + randomUUID();
  const now = new Date().toISOString();

  await db.execute({
    sql: 'INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [userA, 'User A', `${userA}@test.com`, 'hash', 'MANAGING_DIRECTOR', 'ACTIVE', now, now],
  });
  await db.execute({
    sql: 'INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [userB, 'User B', `${userB}@test.com`, 'hash', 'MANAGING_DIRECTOR', 'ACTIVE', now, now],
  });

  const convId = randomUUID();

  // 1. Ensure conversation creates a record
  const conv = await trixConversationsRepository.ensureConversation(convId, userA, 'Where is serial TRX-100?', db);
  assert.equal(conv.id, convId);
  assert.equal(conv.userId, userA);
  assert.equal(conv.title, 'Where is serial TRX-100?');

  // 2. Save user message
  const msgUser = await trixConversationsRepository.saveMessage({
    id: randomUUID(),
    conversationId: convId,
    role: 'user',
    content: 'Where is serial TRX-100?',
  }, db);
  assert.equal(msgUser.conversationId, convId);
  assert.equal(msgUser.role, 'user');

  // 3. Save assistant message with payload and activity
  const samplePayload = JSON.stringify({ type: 'product', serial: 'TRX-100', model: 'Pro 100' });
  const sampleActivity = JSON.stringify([{ toolName: 'lookupSerial', status: 'succeeded', durationMs: 12 }]);
  const msgAssistant = await trixConversationsRepository.saveMessage({
    id: randomUUID(),
    conversationId: convId,
    role: 'assistant',
    content: 'Found serial TRX-100 in Sydney Warehouse.',
    resultPayload: samplePayload,
    activity: sampleActivity,
  }, db);
  assert.equal(msgAssistant.role, 'assistant');
  assert.equal(msgAssistant.resultPayload, samplePayload);

  // 4. List conversations for userA
  const listA = await trixConversationsRepository.listConversations(userA, 50, db);
  assert.equal(listA.length, 1);
  assert.equal(listA[0].id, convId);
  assert.equal(listA[0].title, 'Where is serial TRX-100?');
  assert.equal(listA[0].messageCount, 2);

  // 5. Multi-tenancy isolation: userB cannot see userA's conversation
  const listB = await trixConversationsRepository.listConversations(userB, 50, db);
  assert.equal(listB.length, 0);

  const getB = await trixConversationsRepository.getConversation(convId, userB, db);
  assert.equal(getB, null);

  const deleteB = await trixConversationsRepository.deleteConversation(convId, userB, db);
  assert.equal(deleteB, false);

  // 6. Retrieve conversation for userA with its messages
  const getA = await trixConversationsRepository.getConversation(convId, userA, db);
  assert.ok(getA);
  assert.equal(getA.id, convId);
  assert.equal(getA.messages?.length, 2);
  assert.equal(getA.messages?.[0].role, 'user');
  assert.equal(getA.messages?.[0].content, 'Where is serial TRX-100?');
  assert.equal(getA.messages?.[1].role, 'assistant');
  assert.equal(getA.messages?.[1].resultPayload, samplePayload);
  assert.equal(getA.messages?.[1].activity, sampleActivity);

  // 7. Delete conversation for userA
  const deleteA = await trixConversationsRepository.deleteConversation(convId, userA, db);
  assert.equal(deleteA, true);

  // Verify deletion
  const getAfterDelete = await trixConversationsRepository.getConversation(convId, userA, db);
  assert.equal(getAfterDelete, null);

  // Verify messages cascaded
  const msgResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM trix_messages WHERE conversation_id = ?',
    args: [convId],
  });
  const count = Number(msgResult.rows[0].count);
  assert.equal(count, 0, 'Messages must cascade delete when conversation is deleted');
});
