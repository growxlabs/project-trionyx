export * from './config';
export * from './crypto';
export * from './session';
export * from './lockout';
export * from './guards';
export * from './authenticate';
export * from './overview';
export * from './dealerAuth';
export * from './distributorAuth';

import type { Role } from '@trionyx/types';

export function isAuthorized(role: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(role);
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 100,
  MANAGING_DIRECTOR: 90,
  DISTRIBUTOR: 50,
  DEALER: 20,
  STAFF: 10,
};
