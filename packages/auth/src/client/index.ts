/**
 * Client-side authentication exports
 */

// Core client and hooks
export { authClient as default } from './auth-client';
export { useAuth, useOrganization, useSession, useUser } from './hooks';

// Authentication methods - explicit exports to avoid ambiguity
export {
  acceptInvitation,
  // Passkey authentication
  addPasskey,
  banUser,
  cancelInvitation as cancelOrganizationInvitation,
  checkOrgRolePermission,
  checkRolePermission,
  checkSlug,
  // API Key methods
  createApiKey,

  // Organization methods
  createOrganization,
  // Team methods from ./methods (organization.* methods)
  createTeam as createTeamFromOrg,

  // Admin methods
  createUser,
  deleteApiKey,
  deleteOrganization,
  deletePasskey,
  disableTwoFactor,
  // Two-factor authentication
  enableTwoFactor,
  forgotPassword,
  // Password management
  changePassword,
  setPassword,
  getActiveMember,
  getInvitation,
  getOrganization,
  getTwoFactorBackupCodes,
  getTwoFactorQRCode,
  getTwoFactorStatus,
  hasAdminPermission,
  // Permission methods
  hasPermission,
  impersonateUser,
  inviteMember,
  leaveOrganization,
  listApiKeys,
  listInvitations,
  listOrganizations,
  listPasskeys,
  listTeams as listTeamsFromOrg,
  listUsers,
  listUserSessions,
  regenerateTwoFactorBackupCodes,
  rejectInvitation,
  removeOrganizationMember,
  removeTeam,
  removeUser,
  resetPassword,
  revokeUserSession,
  revokeUserSessions,
  // Magic link
  sendMagicLink,
  setActiveOrganization,
  setUserRole,
  // Basic auth methods
  signIn,
  signInWithGitHub,
  // Social auth
  signInWithGoogle,
  signInWithPasskey,
  signOut,
  signUp,
  signUpWithPasskey,
  stopImpersonating,
  unbanUser,
  updateApiKey,
  updateMemberRole,
  updateOrganization,
  updateTeam as updateTeamFromOrg,
  verifyEmail,
  verifyMagicLink,
  verifyTwoFactor,
} from './methods';

// Client-side API key functionality
export * from './api-keys';

// Client-side team functionality - explicit exports to avoid ambiguity
export {
  cancelInvitation,
  // Team methods (standalone functions)
  createTeam,
  deleteTeam,
  getTeam,
  getTeamStats,
  getUserPendingInvitations,
  inviteToTeam,
  leaveTeam,
  listTeamInvitations,
  listTeams,
  removeTeamMember,
  respondToInvitation,
  updateTeam,
  updateTeamMember,
  useTeam,
  useTeamInvitations,
  // Team hooks
  useTeams,
  useTeamStats,
} from './teams';

// Types
export * from '../shared/types';

// Note: For server-side functionality, use:
// - '@repo/auth/server' for server utilities
// - '@repo/auth/api-keys/server' for server API key management
// - '@repo/auth/teams/server' for server team management
// - '@repo/auth/organizations' for organization helpers
