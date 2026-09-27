import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { runMigrations, usersRepository } from '@trionyx/database';
import { createSession, validateSessionToken, invalidateSession } from '../session';
import { hashPassword } from '../crypto';

describe('Session Model & Storage', () => {
  let testUserId: string;

  before(async () => {
    await runMigrations();
    const email = `session_test_${Date.now()}@trionyx.com`;
    const passwordHash = await hashPassword('TestPass123!');
    const user = await usersRepository.create({
      name: 'Session Test User',
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    testUserId = user.id;
  });

  test('creates session with opaque token and SHA-256 hash in database', async () => {
    const { session, rawToken } = await createSession(testUserId);

    assert.ok(session.id, 'Session must have an ID');
    assert.strictEqual(session.userId, testUserId);
    assert.ok(rawToken, 'Raw token must be returned for cookie');
    assert.notStrictEqual(session.tokenHash, rawToken, 'Stored tokenHash must not equal raw token');

    // Validating with raw token succeeds
    const validated = await validateSessionToken(rawToken);
    assert.ok(validated, 'Session must validate successfully');
    assert.strictEqual(validated?.user.id, testUserId);
  });

  test('rejects non-existent or invalid session token', async () => {
    const validated = await validateSessionToken('completely-fake-session-token-12345');
    assert.strictEqual(validated, null);
  });

  test('invalidateSession removes session from database', async () => {
    const { rawToken } = await createSession(testUserId);
    const beforeLogout = await validateSessionToken(rawToken);
    assert.ok(beforeLogout, 'Session should be valid before logout');

    await invalidateSession(rawToken);

    const afterLogout = await validateSessionToken(rawToken);
    assert.strictEqual(afterLogout, null, 'Session should be null after logout');
  });
});
