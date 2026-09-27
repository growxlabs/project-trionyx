import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { runMigrations, usersRepository } from '@trionyx/database';
import { authenticateInternalUser } from '../authenticate';
import { hashPassword } from '../crypto';
import { SAFE_AUTH_ERRORS } from '../config';

describe('Authentication & Brute-Force Lockout', () => {
  const activeEmail = `auth_test_active_${Date.now()}@trionyx.com`;
  const disabledEmail = `auth_test_disabled_${Date.now()}@trionyx.com`;
  const lockoutEmail = `auth_test_lockout_${Date.now()}@trionyx.com`;
  const rawPassword = 'ValidSecret123!';

  before(async () => {
    await runMigrations();
    const passwordHash = await hashPassword(rawPassword);

    await usersRepository.create({
      name: 'Active Tester',
      email: activeEmail,
      passwordHash,
      role: 'DISTRIBUTOR',
      status: 'ACTIVE',
    });

    await usersRepository.create({
      name: 'Disabled Tester',
      email: disabledEmail,
      passwordHash,
      role: 'DISTRIBUTOR',
      status: 'DISABLED',
    });

    await usersRepository.create({
      name: 'Lockout Tester',
      email: lockoutEmail,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });
  });

  test('valid credentials authenticate successfully and return session and token', async () => {
    const result = await authenticateInternalUser({
      email: activeEmail,
      password: rawPassword,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.statusCode, 200);
    assert.ok(result.user, 'Safe user must be returned');
    assert.strictEqual(result.user?.email, activeEmail.toLowerCase());
    assert.ok(result.rawToken, 'Session token must be generated');
  });

  test('incorrect password returns generic safe failure error', async () => {
    const result = await authenticateInternalUser({
      email: activeEmail,
      password: 'IncorrectPassword999',
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.statusCode, 401);
    assert.strictEqual(result.error, SAFE_AUTH_ERRORS.invalidCredentials);
  });

  test('unknown email returns identical generic safe failure error (no account enumeration)', async () => {
    const result = await authenticateInternalUser({
      email: 'nonexistent_user_9999@trionyx.com',
      password: 'AnyPassword123!',
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.statusCode, 401);
    assert.strictEqual(result.error, SAFE_AUTH_ERRORS.invalidCredentials);
  });

  test('disabled user is rejected safely', async () => {
    const result = await authenticateInternalUser({
      email: disabledEmail,
      password: rawPassword,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.statusCode, 401);
    assert.strictEqual(result.error, SAFE_AUTH_ERRORS.invalidCredentials);
  });

  test('repeated failed login attempts trigger 15-minute account lockout on 5th attempt', async () => {
    // Attempts 1 to 4 fail with standard 401
    for (let i = 1; i <= 4; i++) {
      const res = await authenticateInternalUser({
        email: lockoutEmail,
        password: `WrongPass_${i}`,
      });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.error, SAFE_AUTH_ERRORS.invalidCredentials);
    }

    // 5th attempt triggers lockout
    const fifthAttempt = await authenticateInternalUser({
      email: lockoutEmail,
      password: 'WrongPass_5',
    });
    assert.strictEqual(fifthAttempt.statusCode, 429);
    assert.strictEqual(fifthAttempt.error, SAFE_AUTH_ERRORS.accountLocked);

    // Subsequent attempt even with correct password is still locked
    const lockedAttempt = await authenticateInternalUser({
      email: lockoutEmail,
      password: rawPassword,
    });
    assert.strictEqual(lockedAttempt.statusCode, 429);
    assert.strictEqual(lockedAttempt.error, SAFE_AUTH_ERRORS.accountLocked);
  });
});
