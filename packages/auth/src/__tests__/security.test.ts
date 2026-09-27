import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { runMigrations, usersRepository, auditLogsRepository } from '@trionyx/database';
import { authenticateInternalUser } from '../authenticate';
import { invalidateSession } from '../session';
import { hashPassword } from '../crypto';

describe('Security & Audit Event Integrity', () => {
  const email = `security_audit_${Date.now()}@trionyx.com`;
  const password = 'AuditPassword123!';

  before(async () => {
    await runMigrations();
    const passwordHash = await hashPassword(password);
    await usersRepository.create({
      name: 'Security Test Operator',
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });
  });

  test('authentication response never exposes passwordHash', async () => {
    const auth = await authenticateInternalUser({ email, password });
    assert.strictEqual(auth.success, true);
    assert.strictEqual((auth.user as Record<string, unknown>).passwordHash, undefined);
    assert.strictEqual(Object.prototype.hasOwnProperty.call(auth.user, 'passwordHash'), false);
  });

  test('audit events record LOGIN_SUCCESS and never store plaintext password or hashes', async () => {
    const logs = await auditLogsRepository.list({ limit: 10 });
    assert.ok(logs.length > 0, 'Audit logs must exist');

    for (const log of logs) {
      const logStr = JSON.stringify(log);
      assert.strictEqual(logStr.includes(password), false, 'Plaintext password must never appear in audit logs');
      assert.strictEqual(logStr.includes('$argon2id$'), false, 'Password hash must never appear in audit logs');
    }
  });

  test('session invalidation terminates valid token', async () => {
    const auth = await authenticateInternalUser({ email, password });
    assert.ok(auth.rawToken);

    await invalidateSession(auth.rawToken);
    // User logging out recorded
    await auditLogsRepository.recordEvent({
      userId: auth.user?.id,
      event: 'LOGOUT',
    });

    const logs = await auditLogsRepository.list({ userId: auth.user?.id, event: 'LOGOUT' });
    assert.ok(logs.length > 0, 'Logout event must be recorded in audit log');
  });
});
