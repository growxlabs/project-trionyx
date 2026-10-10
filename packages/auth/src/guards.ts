import type { Role, User, Session, SafeUser, Organization, OrganizationMembership } from '@trionyx/types';
import { organizationsRepository } from '@trionyx/database';
import { validateSessionToken } from './session';
import { AUTH_CONFIG } from './config';

/**
 * Strips sensitive fields (passwordHash) to return a safe user projection.
 */
export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

/**
 * Verifies if role is authorized for the internal operations portal.
 */
export function isInternalPortalRole(role: Role): boolean {
  return (AUTH_CONFIG.internalPortalRoles as readonly Role[]).includes(role);
}

/**
 * Server-side session guard.
 * Throws an error if session is missing, expired, or user is inactive.
 */
export async function requireSession(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  if (!token) {
    throw new Error('UNAUTHENTICATED');
  }
  const result = await validateSessionToken(token);
  if (!result) {
    throw new Error('UNAUTHENTICATED');
  }
  return {
    user: toSafeUser(result.user),
    session: result.session,
  };
}

/**
 * Server-side internal portal guard.
 * Enforces valid session AND role is in [DISTRIBUTOR, MANAGING_DIRECTOR, ADMIN].
 */
export async function requireInternalUser(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireSession(token);
  if (!isInternalPortalRole(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

/**
 * Server-side explicit role guard.
 */
export async function requireRole(
  allowedRoles: Role[],
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireSession(token);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

/**
 * Capability predicates based on Step 1 role foundation.
 * Managing Director & Admin have full write access.
 * Distributor has read-only access.
 */
export function canWriteProducts(role: Role): boolean {
  return role === 'MANAGING_DIRECTOR' || role === 'ADMIN';
}

export function canMutateInventory(role: Role): boolean {
  return role === 'MANAGING_DIRECTOR' || role === 'ADMIN';
}

export function canManageLocations(role: Role): boolean {
  return role === 'MANAGING_DIRECTOR' || role === 'ADMIN';
}

export function canManageDealers(role: Role): boolean {
  return role === 'MANAGING_DIRECTOR' || role === 'ADMIN';
}

export function canManageDistributors(role: Role): boolean {
  return role === 'MANAGING_DIRECTOR' || role === 'ADMIN';
}

export function canReassignDistributor(role: Role): boolean {
  return role === 'MANAGING_DIRECTOR' || role === 'ADMIN';
}

/**
 * Returns distributor ID scope if the user is scoped as a DISTRIBUTOR.
 * Managing Directors and Admins return null (unscoped / company-wide).
 */
export function getDistributorScope(user: SafeUser): string | null {
  if (user.role === 'DISTRIBUTOR') {
    return user.distributorId || 'UNASSIGNED';
  }
  return null;
}

export async function requireProductWritePermission(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireInternalUser(token);
  if (!canWriteProducts(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

export async function requireInventoryMutationPermission(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireInternalUser(token);
  if (!canMutateInventory(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

export async function requireDealerWritePermission(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireInternalUser(token);
  if (!canManageDealers(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

export async function requireDistributorWritePermission(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireInternalUser(token);
  if (!canManageDistributors(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

export function canManageEnquiries(role: Role): boolean {
  return role === 'MANAGING_DIRECTOR' || role === 'ADMIN';
}

export async function requireEnquiryReadPermission(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireInternalUser(token);
  if (user.role === 'DISTRIBUTOR') {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

export async function requireEnquiryWritePermission(
  token?: string | null
): Promise<{ user: SafeUser; session: Session }> {
  const { user, session } = await requireInternalUser(token);
  if (!canManageEnquiries(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return { user, session };
}

/**
 * Server-side active organization guard.
 * Validates session, verifies user has access to the requested organization,
 * or resolves their default/primary organization.
 * 
 * Rejects with FORBIDDEN if the user attempts to access an organization they are not a member of.
 */
export async function requireActiveOrganization(
  token?: string | null,
  options?: {
    requestedOrgIdOrSlug?: string | null;
  }
): Promise<{
  user: SafeUser;
  session: Session;
  activeOrg: Organization;
  membership: OrganizationMembership;
  memberships: OrganizationMembership[];
}> {
  const { user, session } = await requireInternalUser(token);
  const memberships = await organizationsRepository.getUserMemberships(user.id);

  if (memberships.length === 0) {
    const err = new Error('FORBIDDEN: User has no organization memberships');
    (err as any).statusCode = 403;
    (err as any).code = 'FORBIDDEN';
    throw err;
  }

  let activeMembership: (OrganizationMembership & { organization: Organization }) | undefined;

  const requested = options?.requestedOrgIdOrSlug?.trim();
  if (requested) {
    activeMembership = memberships.find(
      (m) => m.organizationId === requested || m.organization.slug.toLowerCase() === requested.toLowerCase()
    );

    if (!activeMembership) {
      // User is not authorized for requested organization
      const err = new Error('FORBIDDEN: User is not authorized for requested organization');
      (err as any).statusCode = 403;
      (err as any).code = 'FORBIDDEN';
      throw err;
    }
  } else {
    // Default to Trionyx membership or first membership
    activeMembership = memberships.find((m) => m.organization.slug === 'trionyx') || memberships[0];
  }

  if (!activeMembership || !activeMembership.organization) {
    const err = new Error('FORBIDDEN: Invalid active organization membership');
    (err as any).statusCode = 403;
    (err as any).code = 'FORBIDDEN';
    throw err;
  }

  return {
    user,
    session,
    activeOrg: activeMembership.organization,
    membership: activeMembership,
    memberships,
  };
}


