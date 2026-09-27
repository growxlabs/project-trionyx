import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { runMigrations, usersRepository } from '@trionyx/database';
import { authenticateInternalUser } from '../authenticate';
import { requireInternalUser } from '../guards';
import { hashPassword } from '../crypto';

describe('Role Authorization Foundation', () => {
  const roles = [
    { role: 'DISTRIBUTOR', name: 'Distributor User', email: `dist_${Date.now()}@trionyx.com` },
    { role: 'MANAGING_DIRECTOR', name: 'MD User', email: `md_${Date.now()}@trionyx.com` },
    { role: 'ADMIN', name: 'Admin User', email: `admin_${Date.now()}@trionyx.com` },
  ] as const;

  const dealerEmail = `dealer_${Date.now()}@trionyx.com`;
  const password = 'RolePassword123!';

  before(async () => {
    await runMigrations();
    const passwordHash = await hashPassword(password);

    for (const r of roles) {
      await usersRepository.create({
        name: r.name,
        email: r.email,
        passwordHash,
        role: r.role,
        status: 'ACTIVE',
      });
    }

    // Create a non-internal dealer user
    await usersRepository.create({
      name: 'Dealer User',
      email: dealerEmail,
      passwordHash,
      role: 'DEALER',
      status: 'ACTIVE',
    });
  });

  test('DISTRIBUTOR, MANAGING_DIRECTOR, and ADMIN authenticate and satisfy requireInternalUser', async () => {
    for (const r of roles) {
      const auth = await authenticateInternalUser({
        email: r.email,
        password,
      });

      assert.strictEqual(auth.success, true, `Role ${r.role} should authenticate`);
      assert.strictEqual(auth.user?.role, r.role);

      // Verify server-side requireInternalUser guard
      const guarded = await requireInternalUser(auth.rawToken);
      assert.strictEqual(guarded.user.role, r.role);
    }
  });

  test('DEALER user is rejected from internal portal authentication', async () => {
    const auth = await authenticateInternalUser({
      email: dealerEmail,
      password,
    });

    assert.strictEqual(auth.success, false);
    assert.strictEqual(auth.statusCode, 401);
  });
});
