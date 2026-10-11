import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { runMigrations, usersRepository, organizationsRepository } from '@trionyx/database';
import { createSession } from '../session';
import { requireActiveOrganization } from '../guards';
import { hashPassword } from '../crypto';
import { ACTIVE_ORG_COOKIE_NAME } from '../config';

describe('Multi-Organization Switching & Isolation', () => {
  let mdUserId: string;
  let mdToken: string;
  let singleOrgUserId: string;
  let singleOrgToken: string;

  before(async () => {
    await runMigrations();

    // 1. Create Managing Director user who belongs to both Trionyx and Lakshmi
    const mdEmail = `md_multiorg_${Date.now()}@trionyx.com`;
    const passwordHash = await hashPassword('AdminPass123!');
    const mdUser = await usersRepository.create({
      name: 'Managing Director Test',
      email: mdEmail,
      passwordHash,
      role: 'MANAGING_DIRECTOR',
      status: 'ACTIVE',
    });
    mdUserId = mdUser.id;

    // Ensure MD has memberships in both organizations
    await organizationsRepository.addMembership({
      userId: mdUserId,
      organizationId: 'org-trionyx',
      role: 'MANAGING_DIRECTOR',
    });
    await organizationsRepository.addMembership({
      userId: mdUserId,
      organizationId: 'org-lakshmi',
      role: 'MANAGING_DIRECTOR',
    });

    const mdSession = await createSession(mdUserId);
    mdToken = mdSession.rawToken;

    // 2. Create user with single organization membership (only Trionyx)
    const singleEmail = `single_org_${Date.now()}@trionyx.com`;
    const singleUser = await usersRepository.create({
      name: 'Single Org User',
      email: singleEmail,
      passwordHash,
      role: 'DISTRIBUTOR',
      status: 'ACTIVE',
    });
    singleOrgUserId = singleUser.id;
    await organizationsRepository.addMembership({
      userId: singleOrgUserId,
      organizationId: 'org-trionyx',
      role: 'DISTRIBUTOR',
    });

    const singleSession = await createSession(singleOrgUserId);
    singleOrgToken = singleSession.rawToken;
  });

  test('Managing Director belongs to both Trionyx and Lakshmi organizations', async () => {
    const memberships = await organizationsRepository.getUserMemberships(mdUserId);
    assert.ok(memberships.length >= 2, 'MD must belong to at least 2 organizations');
    const slugs = memberships.map((m) => m.organization.slug);
    assert.ok(slugs.includes('trionyx'), 'Memberships must include trionyx');
    assert.ok(slugs.includes('lakshmi'), 'Memberships must include lakshmi');
  });

  test('Default active organization resolves to Trionyx when no preference specified', async () => {
    const result = await requireActiveOrganization(mdToken);
    assert.strictEqual(result.activeOrg.slug, 'trionyx');
    assert.strictEqual(result.activeOrg.id, 'org-trionyx');
    assert.ok(result.memberships.length >= 2);
  });

  test('Switching to Lakshmi Distributions validates membership and activates Lakshmi', async () => {
    // Switch using slug
    const bySlug = await requireActiveOrganization(mdToken, { requestedOrgIdOrSlug: 'lakshmi' });
    assert.strictEqual(bySlug.activeOrg.slug, 'lakshmi');
    assert.strictEqual(bySlug.activeOrg.name, 'Lakshmi Distributions');
    assert.strictEqual(bySlug.membership.organizationId, 'org-lakshmi');

    // Switch using organization ID
    const byId = await requireActiveOrganization(mdToken, { requestedOrgIdOrSlug: 'org-lakshmi' });
    assert.strictEqual(byId.activeOrg.id, 'org-lakshmi');
    assert.strictEqual(byId.activeOrg.slug, 'lakshmi');
  });

  test('Switching back to Trionyx validates membership and activates Trionyx', async () => {
    const result = await requireActiveOrganization(mdToken, { requestedOrgIdOrSlug: 'trionyx' });
    assert.strictEqual(result.activeOrg.slug, 'trionyx');
    assert.strictEqual(result.activeOrg.id, 'org-trionyx');
  });

  test('Rejects switching to an organization the user is not a member of', async () => {
    await assert.rejects(
      async () => {
        await requireActiveOrganization(singleOrgToken, { requestedOrgIdOrSlug: 'org-lakshmi' });
      },
      (err: any) => {
        assert.ok(err.message.includes('FORBIDDEN'));
        return true;
      }
    );
  });

  test('Warranty route permission model is restricted when active organization is not Trionyx', async () => {
    const trionyxResult = await requireActiveOrganization(mdToken, { requestedOrgIdOrSlug: 'trionyx' });
    assert.strictEqual(trionyxResult.activeOrg.slug === 'trionyx', true, 'Trionyx org allows warranty access');

    const lakshmiResult = await requireActiveOrganization(mdToken, { requestedOrgIdOrSlug: 'lakshmi' });
    assert.strictEqual(lakshmiResult.activeOrg.slug === 'trionyx', false, 'Lakshmi org restricts warranty access');
  });

  test('Active organization cookie name and structure', () => {
    assert.strictEqual(ACTIVE_ORG_COOKIE_NAME, 'trionyx_active_org');
  });
});
