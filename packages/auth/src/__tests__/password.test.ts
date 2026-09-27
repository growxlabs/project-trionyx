import { test, describe } from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword } from '../crypto';

describe('Password Security (Argon2id)', () => {
  test('generates valid Argon2id hash with standard PHC prefix', async () => {
    const raw = 'SuperSecret123!';
    const hash = await hashPassword(raw);

    assert.ok(hash.startsWith('$argon2id$'), `Hash should start with $argon2id$, got: ${hash}`);
    assert.notStrictEqual(hash, raw, 'Hash must never equal plaintext');
  });

  test('verifies correct password returns true', async () => {
    const raw = 'TrionyxInternalKey2026';
    const hash = await hashPassword(raw);

    const isValid = await verifyPassword(raw, hash);
    assert.strictEqual(isValid, true);
  });

  test('verifies incorrect password returns false', async () => {
    const raw = 'CorrectPassword123';
    const hash = await hashPassword(raw);

    const isValid = await verifyPassword('WrongPassword456', hash);
    assert.strictEqual(isValid, false);
  });

  test('gracefully rejects empty or malformed hash without crashing', async () => {
    assert.strictEqual(await verifyPassword('password', ''), false);
    assert.strictEqual(await verifyPassword('', 'somehash'), false);
    assert.strictEqual(await verifyPassword('password', 'not-a-valid-argon2-hash'), false);
  });
});
