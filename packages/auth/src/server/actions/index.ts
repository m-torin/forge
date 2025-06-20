/**
 * React Server Actions for Better Auth
 * These are server actions that can be used directly in React components
 */

// User management actions
export {
  updateUserAction,
  changeEmailAction,
  changePasswordAction,
  setPasswordAction,
  deleteUserAction,
  listUserAccountsAction,
  linkSocialAction,
  unlinkAccountAction,
  getCurrentUserAction,
} from '../user-actions';

// Organization management actions
export {
  setActiveOrganizationAction,
  getFullOrganizationAction,
  addMemberAction,
  removeMemberAction,
  updateMemberRoleAction,
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
  inviteUserAction,
  cancelInvitationAction,
  acceptInvitationAction,
  declineInvitationAction,
  listInvitationsAction,
  getOrganizationMembersAction,
  bulkInviteUsersAction,
  bulkRemoveMembersAction,
  bulkUpdateMemberRolesAction,
  getOrganizationStatisticsAction,
} from '../organizations/management';

// Organization helpers
export {
  getCurrentOrganization,
  getOrganizationById,
  getOrganizationBySlug,
  getUserOrganizations,
  getOrganizationWithMembers,
  getUserRoleInOrganization,
  getCurrentUserRole,
  isOrganizationOwner,
  isOrganizationAdmin,
  getOrganizationStats,
  switchOrganization,
  createDefaultOrganization,
  ensureActiveOrganization,
  getOrganizationDetails,
} from '../organizations/helpers';

// Organization permissions
export {
  checkPermission,
  checkPermissions,
  canActOnUser,
  getUserPermissions,
  canInviteMembers,
  canRemoveMembers,
  canUpdateMemberRoles,
  canManageOrganization,
  canDeleteOrganization,
  canManageAPIKeys,
  canUpdateBilling,
  canViewBilling,
  hasOrganizationAccess,
  hasOrganizationRole,
} from '../organizations/permissions';

// Service account actions
export {
  createServiceAccountAction,
  listServiceAccountsAction,
  updateServiceAccountAction,
  revokeServiceAccountAction,
  getServiceAccountAction,
  regenerateServiceAccountTokenAction,
} from '../organizations/service-accounts';

// API Key actions
export {
  createApiKeyAction,
  listApiKeysAction,
  revokeApiKeyAction,
  validateApiKeyAction,
  getApiKeyAction,
  updateApiKeyAction,
  regenerateApiKeyAction,
} from '../api-keys/actions';

// Team actions
export {
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
  addTeamMemberAction,
  removeTeamMemberAction,
  updateTeamMemberRoleAction,
  getTeamMembersAction,
  getUserTeamsAction,
  getTeamByIdAction,
  transferTeamOwnershipAction,
  archiveTeamAction,
  restoreTeamAction,
  getTeamStatisticsAction,
} from '../teams/actions';

// Team invitations
export {
  inviteToTeamAction,
  listTeamInvitationsAction,
  respondToInvitationAction,
  cancelInvitationAction as cancelTeamInvitationAction,
  getUserPendingInvitationsAction,
} from '../teams/invitations';

// Team permissions
export {
  checkTeamPermission,
  canManageTeamMember,
  getUserTeamPermissions,
  isTeamOwner,
  isTeamAdmin,
  canViewTeamMembers,
  canInviteTeamMembers,
  canRemoveTeamMembers,
  canUpdateTeamMemberRoles,
  canManageTeam,
  canDeleteTeam,
  canManageTeamSettings,
  canManageTeamBilling,
  hasTeamAccess,
  hasTeamRole,
} from '../teams/permissions';

// Basic server actions (from the existing actions.ts)
export {
  getSessionAction,
  deleteSessionAction,
  changePasswordAction as changePasswordActionBasic,
  listAccountsAction,
  unlinkAccountAction as unlinkAccountActionBasic,
} from './basic';
