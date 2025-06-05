export * from './server';
export * from './keys';
export * from './helpers';

// Export middleware
export { authMiddleware } from './middleware';
export { nodeAuthMiddleware } from './middleware.node';
export { apiAuthMiddleware, createAuthMiddleware } from './middleware-api';

// Export Better Auth types
export type { Session, User } from 'better-auth';

// Export organization types from our database
export type { Invitation, Member, Organization, Team } from '@repo/database/prisma';

// Export API key types from our database
export type { ApiKey } from '@repo/database/prisma';

// Export permissions and access control
export { ac, roles } from './permissions';

// Export API key helpers
export { hasPermission, requireAuth, validateApiKey } from './api-key-helpers';

// Export specific server actions to avoid conflicts
export {
  banUser,
  cancelOrganizationInvitation,
  checkOrganizationSlug,
  createApiKey,
  createOrganization,
  createOrganizationTeam,
  deleteApiKey,
  deleteOrganization,
  deleteOrganizationById,
  deletePasskey,
  deleteSession,
  deleteUser,
  disableTwoFactor,
  enableTwoFactor,
  generatePasskeyRegistrationOptions,
  // Organization operations
  getActiveOrganization,
  getCurrentUser,
  getOrganizationById as getOrganizationByIdAction,
  getSession as getSessionAction,
  getTwoFactorBackupCodes,
  // Two-Factor Authentication
  getTwoFactorStatus,
  impersonateUser,
  inviteOrganizationMember,
  listAllOrganizations,
  // API Key management
  listApiKeys,
  listOrganizationInvitations,
  listOrganizationTeams,
  // Passkeys
  listPasskeys,
  listSessions,
  listUserOrganizations,
  // Admin operations
  listUsers,
  removeOrganizationMember,
  removeOrganizationTeam,
  stopImpersonating,
  unbanUser,
  updateApiKey,
  updateOrganization,
  updateOrganizationById,
  updateOrganizationMemberRole,
  updateOrganizationTeam,
  updateUser,
} from './actions/server';
