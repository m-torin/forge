/**
 * Shared role hierarchy utilities
 */

export type UserRole = 'user' | 'admin' | 'super-admin';
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'guest';
export type TeamRole = 'owner' | 'admin' | 'member';

/**
 * Role hierarchy for different contexts
 */
const ORGANIZATION_ROLE_HIERARCHY: OrganizationRole[] = ['owner', 'admin', 'member', 'guest'];
const TEAM_ROLE_HIERARCHY: TeamRole[] = ['owner', 'admin', 'member'];
const USER_ROLE_HIERARCHY: UserRole[] = ['super-admin', 'admin', 'user'];

/**
 * Checks if a role has sufficient permissions (is equal or higher in hierarchy)
 */
export function hasRolePermission<T extends string>(
  userRole: T,
  requiredRole: T,
  hierarchy: T[],
): boolean {
  const userRoleIndex = hierarchy.indexOf(userRole);
  const requiredRoleIndex = hierarchy.indexOf(requiredRole);

  // Unknown roles are denied
  if (userRoleIndex === -1 || requiredRoleIndex === -1) {
    return false;
  }

  // Lower index = higher permission
  return userRoleIndex <= requiredRoleIndex;
}

/**
 * Organization role checking
 */
export function hasOrganizationPermission(
  userRole: OrganizationRole,
  requiredRole: OrganizationRole,
): boolean {
  return hasRolePermission(userRole, requiredRole, ORGANIZATION_ROLE_HIERARCHY);
}

/**
 * Team role checking
 */
export function hasTeamPermission(userRole: TeamRole, requiredRole: TeamRole): boolean {
  return hasRolePermission(userRole, requiredRole, TEAM_ROLE_HIERARCHY);
}

/**
 * User role checking
 */
export function hasUserPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return hasRolePermission(userRole, requiredRole, USER_ROLE_HIERARCHY);
}

/**
 * Convenience functions for common checks
 */
export function isOrganizationOwner(role: OrganizationRole): boolean {
  return role === 'owner';
}

export function isOrganizationAdmin(role: OrganizationRole): boolean {
  return hasOrganizationPermission(role, 'admin');
}

export function isTeamOwner(role: TeamRole): boolean {
  return role === 'owner';
}

export function isTeamAdmin(role: TeamRole): boolean {
  return hasTeamPermission(role, 'admin');
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super-admin';
}

export function isAdmin(role: UserRole): boolean {
  return hasUserPermission(role, 'admin');
}
