/**
 * Server exports for Node.js environments (non-Next.js)
 */

import 'server-only';

// Export configured auth instance
export { auth } from '../shared/auth.config';

// Export types
export type * from '../types';
export type { AuthInstance } from '../shared/auth.config';

// Export server utilities
export { createAuthMiddleware } from 'better-auth/api';

// Export server modules - use explicit exports to avoid conflicts
export {
  getSession,
  getCurrentUser as getServerCurrentUser,
  requireAuth as requireServerAuth,
} from './session';

export * from './actions';
export * from './user-actions';

// API Keys
export {
  validateApiKeyAction as validateServerApiKey,
  // Re-export others
} from './api-keys';
export * from './api-keys';

// Teams - avoid cancelInvitation conflict
export {
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
  getTeamAction,
  listTeamsAction,
  updateTeamMemberAction,
  removeTeamMemberAction,
  getTeamStatsAction,
  // Aliases
  addTeamMemberAction,
  updateTeamMemberRoleAction,
  getTeamMembersAction,
  getUserTeamsAction,
  getTeamByIdAction,
  transferTeamOwnershipAction,
  archiveTeamAction,
  restoreTeamAction,
  getTeamStatisticsAction,
} from './teams';

// Team invitations - explicit exports to avoid conflicts
export {
  inviteToTeamAction,
  listTeamInvitationsAction,
  respondToInvitationAction,
  cancelInvitationAction as cancelTeamInvitationAction,
  getUserPendingInvitationsAction,
} from './teams';

export * from './organizations';

// Admin management functions - explicit exports to avoid conflicts
export {
  listUsersAction,
  getUserByIdAction,
  getUserAction,
  listOrganizationsAction,
  getOrganizationAction,
  banUserAction,
  unbanUserAction,
  impersonateUserAction,
  stopImpersonatingAction,
  setUserRoleAction,
  revokeUserSessionsAction,
  listSessionsAction,
  createUserAction,
  getSystemStatsAction,
  forceDeleteOrganizationAction,
  // Aliases to avoid conflicts with existing exports
  deleteUserAction as adminDeleteUserAction,
  deleteSessionAction as adminDeleteSessionAction,
  listApiKeysAction as adminListApiKeysAction,
  getApiKeyAction as adminGetApiKeyAction,
} from './admin-management';
