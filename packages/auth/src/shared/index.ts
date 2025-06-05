/**
 * Shared authentication utilities and types
 */

export * from './types';
export * from './config';
export * from './permissions';
export * from './admin-permissions';
export * from './email';

// Shared API key types and utilities - explicit exports
export {
  // Permissions
  validateApiKeyPermissions,
  hasApiKeyPermission,
  parsePermissionString,
  
  // Types
  type ApiKeyPermissions,
  type ApiKeyValidationResult,
  type CreateApiKeyData,
  type CreateApiKeyResult,
  type ApiKeyListItem,
  type ListApiKeysResult,
  type RevokeApiKeyResult,
  type UpdateApiKeyData,
  type UpdateApiKeyResult,
  type PermissionCheck,
  type ServiceAuthOptions,
  type ServiceAuthResult,
  type ApiKeyRateLimit,
  type RateLimitResult,
} from './api-keys';

// Shared team types and utilities - explicit exports
export {
  // Permissions
  DEFAULT_TEAM_ROLES,
  roleHasPermission,
  getPermissionsForRole,
  isValidRole,
  
  // Types
  type TeamRole,
  type TeamWithMembers,
  type CreateTeamData,
  type CreateTeamResult,
  type UpdateTeamData,
  type UpdateTeamResult,
  type DeleteTeamResult,
  type GetTeamResult,
  type ListTeamsResult,
  type InviteToTeamData,
  type InviteToTeamResult,
  type ListTeamInvitationsResult,
  type RespondToInvitationData,
  type RespondToInvitationResult,
  type UpdateTeamMemberData,
  type UpdateTeamMemberResult,
  type RemoveTeamMemberResult,
  type TeamStats,
  type GetTeamStatsResult,
} from './teams';

// Type-safe factory functions
export * from './factory';
