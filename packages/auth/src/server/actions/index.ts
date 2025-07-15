/**
 * React Server Actions for Better Auth
 * These are server actions that can be used directly in React components
 */

// User management actions
export {
  changeEmailAction,
  changePasswordAction,
  deleteUserAction,
  getCurrentUserAction,
  linkSocialAction,
  listUserAccountsAction,
  setPasswordAction,
  unlinkAccountAction,
  updateUserAction,
} from '../user-actions';

// Organization management actions
export {
  acceptInvitationAction,
  addMemberAction,
  bulkInviteUsersAction,
  bulkRemoveMembersAction,
  bulkUpdateMemberRolesAction,
  cancelInvitationAction,
  createOrganizationAction,
  declineInvitationAction,
  deleteOrganizationAction,
  getFullOrganizationAction,
  getOrganizationMembersAction,
  getOrganizationStatisticsAction,
  inviteUserAction,
  listInvitationsAction,
  removeMemberAction,
  setActiveOrganizationAction,
  updateMemberRoleAction,
  updateOrganizationAction,
} from '../organizations/management';

// Organization helpers
export {
  createDefaultOrganization,
  ensureActiveOrganization,
  getCurrentOrganization,
  getCurrentUserRole,
  getOrganizationById,
  getOrganizationBySlug,
  getOrganizationDetails,
  getOrganizationStats,
  getOrganizationWithMembers,
  getUserOrganizations,
  getUserRoleInOrganization,
  isOrganizationAdmin,
  isOrganizationOwner,
  switchOrganization,
} from '../organizations/helpers';

// Organization permissions
export {
  canActOnUser,
  canDeleteOrganization,
  canInviteMembers,
  canManageAPIKeys,
  canManageOrganization,
  canRemoveMembers,
  canUpdateBilling,
  canUpdateMemberRoles,
  canViewBilling,
  checkPermission,
  checkPermissions,
  getUserPermissions,
  hasOrganizationAccess,
  hasOrganizationRole,
} from '../organizations/permissions';

// Service account actions
export {
  createServiceAccountAction,
  getServiceAccountAction,
  listServiceAccountsAction,
  regenerateServiceAccountTokenAction,
  revokeServiceAccountAction,
  updateServiceAccountAction,
} from '../organizations/service-accounts';

// API Key actions
export {
  createApiKeyAction,
  getApiKeyAction,
  listApiKeysAction,
  regenerateApiKeyAction,
  revokeApiKeyAction,
  updateApiKeyAction,
  validateApiKeyAction,
} from '../api-keys/actions';

// Team actions
export {
  addTeamMemberAction,
  archiveTeamAction,
  createTeamAction,
  deleteTeamAction,
  getTeamByIdAction,
  getTeamMembersAction,
  getTeamStatisticsAction,
  getUserTeamsAction,
  removeTeamMemberAction,
  restoreTeamAction,
  transferTeamOwnershipAction,
  updateTeamAction,
  updateTeamMemberRoleAction,
} from '../teams/actions';

// Team invitations
export {
  cancelInvitationAction as cancelTeamInvitationAction,
  getUserPendingInvitationsAction,
  inviteToTeamAction,
  listTeamInvitationsAction,
  respondToInvitationAction,
} from '../teams/invitations';

// Team permissions
export {
  canDeleteTeam,
  canInviteTeamMembers,
  canManageTeam,
  canManageTeamBilling,
  canManageTeamMember,
  canManageTeamSettings,
  canRemoveTeamMembers,
  canUpdateTeamMemberRoles,
  canViewTeamMembers,
  checkTeamPermission,
  getUserTeamPermissions,
  hasTeamAccess,
  hasTeamRole,
  isTeamAdmin,
  isTeamOwner,
} from '../teams/permissions';

// Basic server actions (from the existing actions.ts)
export {
  changePasswordAction as changePasswordActionBasic,
  deleteSessionAction,
  getSessionAction,
  listAccountsAction,
  unlinkAccountAction as unlinkAccountActionBasic,
} from './basic';
