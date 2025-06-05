/**
 * Client-side authentication exports
 */

// Core client and hooks
export { authClient as default } from './auth-client';
export { useAuth, useOrganization, useSession, useUser } from './hooks';

// Authentication methods - explicit exports to avoid ambiguity
export {
  // Basic auth methods
  signIn,
  signOut,
  signUp,
  forgotPassword,
  resetPassword,
  verifyEmail,
  
  // Social auth
  signInWithGoogle,
  signInWithGitHub,
  
  // Magic link
  sendMagicLink,
  verifyMagicLink,
  
  // Organization methods
  createOrganization,
  updateOrganization,
  deleteOrganization,
  checkSlug,
  inviteMember,
  removeOrganizationMember,
  updateMemberRole,
  leaveOrganization,
  getOrganization,
  listOrganizations,
  listInvitations,
  getInvitation,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation as cancelOrganizationInvitation,
  getActiveMember,
  setActiveOrganization,
  
  // Team methods from ./methods (organization.* methods)
  createTeam as createTeamFromOrg,
  updateTeam as updateTeamFromOrg,
  removeTeam,
  listTeams as listTeamsFromOrg,
  
  // Permission methods
  hasPermission,
  checkOrgRolePermission,
  
  // API Key methods
  createApiKey,
  updateApiKey,
  deleteApiKey,
  listApiKeys,
  
  // Admin methods
  createUser,
  listUsers,
  setUserRole,
  banUser,
  unbanUser,
  listUserSessions,
  revokeUserSession,
  revokeUserSessions,
  impersonateUser,
  stopImpersonating,
  removeUser,
  hasAdminPermission,
  checkRolePermission,
  
  // Two-factor authentication
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
  getTwoFactorQRCode,
  getTwoFactorStatus,
  getTwoFactorBackupCodes,
  regenerateTwoFactorBackupCodes,
  
  // Passkey authentication
  addPasskey,
  listPasskeys,
  deletePasskey,
  signInWithPasskey,
  signUpWithPasskey,
} from './methods';

// Client-side API key functionality
export * from './api-keys';

// Client-side team functionality - explicit exports to avoid ambiguity
export {
  // Team hooks
  useTeams,
  useTeam,
  useTeamInvitations,
  useTeamStats,
  
  // Team methods (standalone functions)
  createTeam,
  updateTeam,
  deleteTeam,
  getTeam,
  listTeams,
  inviteToTeam,
  listTeamInvitations,
  respondToInvitation,
  cancelInvitation,
  updateTeamMember,
  removeTeamMember,
  getTeamStats,
  getUserPendingInvitations,
  leaveTeam,
} from './teams';

// Types
export * from '../shared/types';

// Note: For server-side functionality, use:
// - '@repo/auth/server' for server utilities
// - '@repo/auth/api-keys/server' for server API key management
// - '@repo/auth/teams/server' for server team management
// - '@repo/auth/organizations' for organization helpers
