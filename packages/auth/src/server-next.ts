/**
 * Next.js server exports
 */

import 'server-only';

// Export core auth instance for Next.js
export { auth } from './shared/auth';

// Export Next.js handler for API routes
export { toNextJsHandler } from 'better-auth/next-js';

// Export essential server utilities
export { getCurrentUser, getSession, requireAuth } from './server/session';

// Export server actions (grouped by feature)
export {
  adminDeleteUserAction,
  // Admin actions (when enabled)
  banUserAction,
  // Bulk operations
  bulkCreateApiKeysAction,
  bulkInviteUsersAction,
  changePasswordAction,
  // API Key actions
  createApiKeyAction,
  // Organization actions
  createOrganizationAction,
  createUserAction,
  deleteApiKeyAction,
  deleteOrganizationAction,
  deletePasskeyAction,
  deleteSessionAction,
  deleteUserAction,
  disableTwoFactorAction,
  // Two-Factor actions
  enableTwoFactorAction,
  // Passkey actions
  generatePasskeyRegistrationOptionsAction,
  getActiveOrganizationAction,
  getApiKeyAction,
  getApiKeyStatisticsAction,
  // User actions
  getCurrentUserAction,
  getOrganizationAction,
  getOrganizationByIdAction,
  // Session actions
  getSessionAction,
  getTwoFactorBackupCodesAction,
  getTwoFactorStatusAction,
  impersonateUserAction,
  listAccountsAction,
  listApiKeysAction,
  listOrganizationInvitationsAction,
  // Organization admin actions
  listOrganizationsAction,
  listPasskeysAction,
  listSessionsAction,
  listUserOrganizationsAction,
  listUsersAction,
  revokeUserSessionsAction,
  setActiveOrganizationAction,
  setPasswordAction,
  setUserRoleAction,
  stopImpersonatingAction,
  unbanUserAction,
  // Account management
  unlinkAccountAction,
  updateApiKeyAction,
  updateOrganizationAction,
  updateUserAction,
} from './server-actions';
