/**
 * Server exports for Node.js environments (non-Next.js)
 */

import 'server-only';

// Export configured auth instance
export { auth } from '../shared/auth';

// Export types
export type { AuthInstance } from '../shared/auth';
export type * from '../types';

// Export server utilities
export { createAuthMiddleware } from 'better-auth/api';

// Export server modules - use explicit exports to avoid conflicts
export {
  getCurrentUser as getServerCurrentUser,
  getSession,
  requireAuth as requireServerAuth,
} from './session';

export * from './actions';
export * from './user-actions';

// API Keys
export * from './api-keys';
export { validateApiKeyAction as validateServerApiKey } from './api-keys';

// Teams - avoid cancelInvitation conflict
export {
  // Aliases
  addTeamMemberAction,
  archiveTeamAction,
  createTeamAction,
  deleteTeamAction,
  getTeamAction,
  getTeamByIdAction,
  getTeamMembersAction,
  getTeamStatisticsAction,
  getTeamStatsAction,
  getUserTeamsAction,
  listTeamsAction,
  removeTeamMemberAction,
  restoreTeamAction,
  transferTeamOwnershipAction,
  updateTeamAction,
  updateTeamMemberAction,
  updateTeamMemberRoleAction,
} from './teams';

// Team invitations - explicit exports to avoid conflicts
export {
  cancelInvitationAction as cancelTeamInvitationAction,
  getUserPendingInvitationsAction,
  inviteToTeamAction,
  listTeamInvitationsAction,
  respondToInvitationAction,
} from './teams';

export * from './organizations';

// Admin management functions - explicit exports to avoid conflicts
export {
  deleteSessionAction as adminDeleteSessionAction,
  // Aliases to avoid conflicts with existing exports
  deleteUserAction as adminDeleteUserAction,
  getApiKeyAction as adminGetApiKeyAction,
  listApiKeysAction as adminListApiKeysAction,
  banUserAction,
  createUserAction,
  forceDeleteOrganizationAction,
  getOrganizationAction,
  getSystemStatsAction,
  getUserAction,
  getUserByIdAction,
  impersonateUserAction,
  listOrganizationsAction,
  listSessionsAction,
  listUsersAction,
  revokeUserSessionsAction,
  setUserRoleAction,
  stopImpersonatingAction,
  unbanUserAction,
} from './admin-management';
