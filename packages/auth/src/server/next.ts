/**
 * Next.js server exports
 */

import 'server-only';

// Export core auth instance for Next.js
export { auth } from '../shared/auth';

// Export Next.js handler for API routes
export { toNextJsHandler } from 'better-auth/next-js';

// Export essential server utilities
export { getCurrentUser, getSession, requireAuth } from './session';

// Export server actions (grouped by feature)
export {
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
  getOrganizationByIdAction,
  // Session actions
  getSessionAction,
  getTwoFactorBackupCodesAction,
  getTwoFactorStatusAction,
  impersonateUserAction,
  listAccountsAction,
  listApiKeysAction,
  listOrganizationInvitationsAction,
  listPasskeysAction,
  listSessionsAction,
  listUserOrganizationsAction,
  listUsersAction,
  setActiveOrganizationAction,
  setPasswordAction,
  stopImpersonatingAction,
  unbanUserAction,
  // Account management
  unlinkAccountAction,
  updateApiKeyAction,
  updateOrganizationAction,
  updateUserAction,
} from '../server-actions';

// Export middleware helpers
export { withAuth, withOrgAuth } from './middleware';

// Export auth helpers
export { createAuthHelpers } from './helpers';
