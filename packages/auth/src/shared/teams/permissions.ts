/**
 * Team permission utilities and role definitions
 */

export interface TeamRole {
  description?: string;
  id: string;
  level: number; // Higher level = more permissions
  name: string;
  permissions: string[];
}

/**
 * Default team roles and their permissions
 */
export const DEFAULT_TEAM_ROLES: Record<string, TeamRole> = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage team members and most settings',
    level: 75,
    permissions: [
      'team:read',
      'team:write',
      'members:read',
      'members:write',
      'members:remove',
      'invitations:create',
      'invitations:cancel',
      'settings:read',
      'settings:write',
    ],
  },
  guest: {
    id: 'guest',
    name: 'Guest',
    description: 'Limited access to basic team information',
    level: 10,
    permissions: ['team:read'],
  },
  manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Invite new members and view team information',
    level: 50,
    permissions: [
      'team:read',
      'members:read',
      'members:invite',
      'invitations:create',
      'settings:read',
    ],
  },
  member: {
    id: 'member',
    name: 'Member',
    description: 'View team information and member list',
    level: 25,
    permissions: ['team:read', 'members:read'],
  },
  owner: {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to team management and settings',
    level: 100,
    permissions: ['team:*', 'members:*', 'invitations:*', 'settings:*', 'permissions:*'],
  },
} as const;

/**
 * Team permission categories
 */
export const TEAM_PERMISSIONS = {
  INVITATIONS: {
    ALL: 'invitations:*',
    CANCEL: 'invitations:cancel',
    CREATE: 'invitations:create',
  },
  MEMBERS: {
    ALL: 'members:*',
    INVITE: 'members:invite',
    READ: 'members:read',
    REMOVE: 'members:remove',
    WRITE: 'members:write',
  },
  PERMISSIONS: {
    ALL: 'permissions:*',
    MANAGE: 'permissions:manage',
    VIEW: 'permissions:view',
  },
  SETTINGS: {
    ALL: 'settings:*',
    READ: 'settings:read',
    WRITE: 'settings:write',
  },
  TEAM: {
    ALL: 'team:*',
    DELETE: 'team:delete',
    READ: 'team:read',
    WRITE: 'team:write',
  },
} as const;

/**
 * Checks if a role has a specific permission
 */
export function roleHasPermission(role: string, permission: string): boolean {
  const roleData = DEFAULT_TEAM_ROLES[role];
  if (!roleData) {
    return false;
  }

  // Check for exact permission match
  if (roleData.permissions.includes(permission)) {
    return true;
  }

  // Check for wildcard permissions
  const [resource, action] = permission.split(':');
  const wildcardPermission = `${resource}:*`;

  if (roleData.permissions.includes(wildcardPermission)) {
    return true;
  }

  // Check for global wildcard
  if (roleData.permissions.includes('*')) {
    return true;
  }

  return false;
}

/**
 * Checks if a user can perform an action on another user based on roles
 */
export function canActOnUser(actorRole: string, targetRole: string, permission: string): boolean {
  const actor = DEFAULT_TEAM_ROLES[actorRole];
  const target = DEFAULT_TEAM_ROLES[targetRole];

  if (!actor || !target) {
    return false;
  }

  // Check if actor has the required permission
  if (!roleHasPermission(actorRole, permission)) {
    return false;
  }

  // Owners can act on anyone except other owners (unless they're the same user)
  if (actor.id === 'owner') {
    return true;
  }

  // Users cannot act on users with higher or equal level roles
  // unless they have the same role (for some actions)
  if (target.level >= actor.level) {
    return false;
  }

  return true;
}

/**
 * Gets the highest role from a list of roles
 */
export function getHighestRole(roles: string[]): string {
  let highest = 'guest';
  let highestLevel = 0;

  for (const role of roles) {
    const roleData = DEFAULT_TEAM_ROLES[role];
    if (roleData && roleData.level > highestLevel) {
      highest = role;
      highestLevel = roleData.level;
    }
  }

  return highest;
}

/**
 * Validates if a role is valid
 */
export function isValidRole(role: string): boolean {
  return role in DEFAULT_TEAM_ROLES;
}

/**
 * Gets all available roles in order of permission level
 */
export function getAllRoles(): TeamRole[] {
  return Object.values(DEFAULT_TEAM_ROLES).sort((a, b) => b.level - a.level);
}

/**
 * Gets roles that a user with a specific role can assign
 */
export function getAssignableRoles(userRole: string): TeamRole[] {
  const userRoleData = DEFAULT_TEAM_ROLES[userRole];
  if (!userRoleData) {
    return [];
  }

  // Users can only assign roles with lower levels than their own
  return getAllRoles().filter((role) => role.level < userRoleData.level);
}

/**
 * Checks if a role can be assigned by another role
 */
export function canAssignRole(assignerRole: string, targetRole: string): boolean {
  const assigner = DEFAULT_TEAM_ROLES[assignerRole];
  const target = DEFAULT_TEAM_ROLES[targetRole];

  if (!assigner || !target) {
    return false;
  }

  // Can only assign roles with lower level
  return target.level < assigner.level;
}

/**
 * Gets default permissions for team creation
 */
export function getDefaultTeamPermissions(): string[] {
  return [TEAM_PERMISSIONS.TEAM.READ, TEAM_PERMISSIONS.MEMBERS.READ];
}

/**
 * Gets permissions for a specific role
 */
export function getPermissionsForRole(role: string): string[] {
  const roleData = DEFAULT_TEAM_ROLES[role];
  return roleData ? roleData.permissions : [];
}

/**
 * Validates permission format for teams
 */
export function isValidTeamPermission(permission: string): boolean {
  const validPermissions = Object.values(TEAM_PERMISSIONS).flatMap((category) =>
    Object.values(category),
  ) as string[];

  return validPermissions.includes(permission) || permission.endsWith(':*') || permission === '*';
}
