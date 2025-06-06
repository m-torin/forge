/**
 * Shared authentication utilities and types
 */

export * from './types';
export * from './config';
export * from './permissions';
export * from './admin-permissions';
export * from './email';

// Shared API key types and utilities - export what actually exists
export {
  // Types
  type ApiKeyPermissions,
  checkApiKeyPermissions,
  DEFAULT_API_PERMISSIONS,
  getMaxPermissionLevel,
  // Permissions
  hasPermission,
  isValidPermission,
  mergePermissions,
  normalizePermission,
  type PermissionCheck,
  permissionsArrayToStructure,
  permissionsStructureToArray,
} from './api-keys';

// Shared team types and utilities - export what actually exists
export {
  canAssignRole,
  // Permissions
  DEFAULT_TEAM_ROLES,
  getAllRoles,
  getAssignableRoles,
  getDefaultTeamPermissions,
  getPermissionsForRole,
  isValidRole,
  roleHasPermission,
  type TeamMember,
  // Types
  type TeamRole,
} from './teams';

// Type-safe factory functions
export * from './factory';
