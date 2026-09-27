import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { runMigrations, usersRepository, auditLogsRepository } from '@trionyx/database';
import { hashPassword } from '../crypto';
import { formatRoleLabel, formatActivityLabel, getInternalOverview } from '../overview';
import type { SafeUser, Role } from '@trionyx/types';

describe('Internal Overview Domain Service (Step 2)', () => {
  let testUser: SafeUser;
  const password = 'TestOverviewPassword123!';

  before(async () => {
    await runMigrations();
    const passwordHash = await hashPassword(password);
    const email = `overview_operator_${Date.now()}@trionyx.com`;

    const user = await usersRepository.create({
      name: 'Operations Lead',
      email,
      passwordHash,
      role: 'MANAGING_DIRECTOR',
      status: 'ACTIVE',
    });

    testUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      failedLoginCount: user.failedLoginCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Log a sample persisted audit event using recordEvent
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'LOGIN_SUCCESS',
      metadata: { email },
    });
  });

  test('formatRoleLabel produces human-readable titles for all roles', () => {
    assert.strictEqual(formatRoleLabel('DISTRIBUTOR'), 'Distributor');
    assert.strictEqual(formatRoleLabel('MANAGING_DIRECTOR'), 'Managing Director');
    assert.strictEqual(formatRoleLabel('ADMIN'), 'Administrator');
    assert.strictEqual(formatRoleLabel('STAFF'), 'Staff');
    assert.strictEqual(formatRoleLabel('DEALER'), 'Dealer');
  });

  test('formatActivityLabel produces human-readable descriptions for audit events', () => {
    assert.strictEqual(formatActivityLabel('LOGIN_SUCCESS'), 'Signed in to Operations');
    assert.strictEqual(formatActivityLabel('LOGOUT'), 'Signed out');
    assert.strictEqual(formatActivityLabel('USER_BOOTSTRAPPED'), 'Internal account provisioned via CLI');
    assert.strictEqual(formatActivityLabel('ACCOUNT_LOCKED'), 'Temporary lockout triggered (security policy)');
    assert.strictEqual(formatActivityLabel('LOGIN_FAILURE'), 'Failed sign-in attempt recorded');
  });

  test('getInternalOverview returns valid structure with strictly null unbuilt metrics', async () => {
    const overview = await getInternalOverview(testUser);

    assert.ok(overview);
    assert.strictEqual(overview.user.id, testUser.id);
    assert.strictEqual(overview.user.email, testUser.email);

    // VERIFICATION:
    // activeDealers and lowStock are live numeric counts; orders and pendingActions remain strictly null
    assert.ok(typeof overview.summary.activeDealers === 'number', 'Active dealers must be a live numeric count now that dealers is built');
    assert.strictEqual(overview.summary.orders, null, 'Orders must be null until orders module');
    assert.ok(typeof overview.summary.lowStock === 'number', 'Low stock must be a live numeric count now that inventory is built');
    assert.strictEqual(overview.summary.pendingActions, null, 'Pending actions must be null until workflow module');

    // Recent activity must contain real persisted events
    assert.ok(Array.isArray(overview.recentActivity));
    assert.ok(overview.recentActivity.length > 0, 'Recent activity should reflect real audit logs');

    const firstActivity = overview.recentActivity[0];
    assert.ok(firstActivity.id);
    assert.ok(firstActivity.label);
    assert.ok(firstActivity.createdAt);

    // Attention items should be an array (calm empty state)
    assert.ok(Array.isArray(overview.attentionItems));
  });

  test('getInternalOverview succeeds equally for DISTRIBUTOR, MANAGING_DIRECTOR, and ADMIN', async () => {
    const roles: Role[] = ['DISTRIBUTOR', 'MANAGING_DIRECTOR', 'ADMIN'];

    for (const r of roles) {
      const userCopy: SafeUser = {
        ...testUser,
        id: `mock_${r.toLowerCase()}_${Date.now()}`,
        role: r,
      };

      const overview = await getInternalOverview(userCopy);
      assert.strictEqual(overview.user.role, r);
      assert.ok(typeof overview.summary.activeDealers === 'number');
      assert.strictEqual(overview.summary.orders, null);
      assert.ok(typeof overview.summary.lowStock === 'number');
      assert.strictEqual(overview.summary.pendingActions, null);
    }
  });
});
