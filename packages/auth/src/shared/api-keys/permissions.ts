/**
 * Shared API key permission utilities
 */

import type { ApiKeyPermissions, PermissionCheck } from './types';

/**
 * Default API key permissions for different roles
 */
export const DEFAULT_API_PERMISSIONS = {
  admin: ['users:*', 'organizations:*', 'teams:*', 'api-keys:*'],
  read: ['users:read', 'organizations:read', 'teams:read'],
  service: ['service:*'],
  write: ['users:write', 'organizations:write', 'teams:write'],
} as const;

/**
 * Checks if a set of permissions includes the required permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Check for exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check for wildcard permissions
  const [resource, action] = requiredPermission.split(':');

  // Check for resource-level wildcard (e.g., "users:*")
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  // Check for global wildcard
  if (userPermissions.includes('*:*') || userPermissions.includes('*')) {
    return true;
  }

  return false;
}

/**
 * Checks if API key permissions satisfy the required permission check
 */
export function checkApiKeyPermissions(
  keyPermissions: ApiKeyPermissions,
  requiredPermissions: PermissionCheck,
): boolean {
  for (const [resource, actions] of Object.entries(requiredPermissions)) {
    for (const action of actions) {
      const permission = `${resource}:${action}`;

      // Convert ApiKeyPermissions to string array for compatibility
      const permissionStrings = keyPermissions.actions
        .map((action) => keyPermissions.resources.map((res) => `${res}:${action}`).join(','))
        .join(',')
        .split(',')
        .filter(Boolean);

      if (!hasPermission(permissionStrings, permission)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Normalizes permission strings to a consistent format
 */
export function normalizePermission(permission: string): string {
  const [resource, action] = permission.split(':');
  return `${resource.toLowerCase()}:${action.toLowerCase()}`;
}

/**
 * Validates permission format
 */
export function isValidPermission(permission: string): boolean {
  const parts = permission.split(':');
  if (parts.length !== 2) return false;

  const [resource, action] = parts;

  // Resource and action must be non-empty
  if (!resource || !action) return false;

  // Check for valid characters (alphanumeric, underscore, hyphen, wildcard)
  const validPattern = /^[a-zA-Z0-9_\-*]+$/;
  return validPattern.test(resource) && validPattern.test(action);
}

/**
 * Converts array of permission strings to ApiKeyPermissions structure
 */
export function permissionsArrayToStructure(permissions: string[]): ApiKeyPermissions {
  const resources = new Set<string>();
  const actions = new Set<string>();

  for (const permission of permissions) {
    if (!isValidPermission(permission)) {
      continue;
    }

    const [resource, action] = permission.split(':');
    resources.add(resource);
    actions.add(action);
  }

  return {
    actions: Array.from(actions),
    resources: Array.from(resources),
  };
}

/**
 * Converts ApiKeyPermissions structure to array of permission strings
 */
export function permissionsStructureToArray(permissions: ApiKeyPermissions): string[] {
  const result: string[] = [];

  for (const resource of permissions.resources) {
    for (const action of permissions.actions) {
      result.push(`${resource}:${action}`);
    }
  }

  return result;
}

/**
 * Merges multiple permission arrays, removing duplicates
 */
export function mergePermissions(...permissionArrays: string[][]): string[] {
  const merged = new Set<string>();

  for (const permissions of permissionArrays) {
    for (const permission of permissions) {
      if (isValidPermission(permission)) {
        merged.add(normalizePermission(permission));
      }
    }
  }

  return Array.from(merged);
}

/**
 * Gets the maximum permission level for a resource
 */
export function getMaxPermissionLevel(permissions: string[], resource: string): string | null {
  const resourcePermissions = permissions
    .filter((p) => p.startsWith(`${resource}:`))
    .map((p) => p.split(':')[1]);

  if (resourcePermissions.includes('*')) return '*';
  if (resourcePermissions.includes('admin')) return 'admin';
  if (resourcePermissions.includes('write')) return 'write';
  if (resourcePermissions.includes('read')) return 'read';

  return null;
}
