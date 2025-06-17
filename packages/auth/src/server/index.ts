/**
 * Server-side authentication exports
 */

export { auth, getCurrentUser, getSession } from './auth';
export * from './utils';

// Server-side API key functionality
export * from './api-keys';

// Server-side team functionality - specific exports to avoid conflicts
export * from './teams/actions';
export * from './teams/permissions';
export { inviteToTeam, listTeamInvitations, respondToInvitation } from './teams/invitations';

// Server-side organization functionality
export * from './organizations';

// Actions - only export what actually exists
export {
  getActiveOrganization,
  updateUser,
  changePassword,
  setPassword,
  listAccounts,
  unlinkAccount,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  listAllOrganizations,
} from './actions';

// Admin management functions
export {
  banUser,
  deleteSession,
  deleteUser,
  getApiKey,
  getOrganization,
  getUser,
  getUserById,
  impersonateUser,
  listApiKeys,
  listSessions,
  listUsers,
  unbanUser,
} from './admin-management';

// Types and permissions
export * from '../shared/types';
export * from '../shared/permissions';
export * from '../shared/admin-permissions';

// Configuration
export { createAuthConfig } from '../shared/config';

// Note: For client-side functionality, use:
// - '@repo/auth/client' for client utilities
// - '@repo/auth/api-keys/client' for client API key management
// - '@repo/auth/teams/client' for client team management
// - '@repo/auth/middleware' for middleware variants
