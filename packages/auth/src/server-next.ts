/**
 * Next.js server exports
 */

import 'server-only';

/**
 * Core auth instance configured for Next.js server environments
 */
export { auth } from './shared/auth';

/**
 * Next.js API route handler for Better Auth
 * @returns Handler function for Next.js API routes
 */
export { toNextJsHandler } from 'better-auth/next-js';

/**
 * Essential server utilities for Next.js server components
 */
export { getCurrentUser, getSession, requireAuth } from './server/session';

/**
 * Rate limiting and analytics utilities
 */
export {
  AnalyticsUtils,
  AuthFlowUtils,
  RateLimitPresets,
  RateLimitUtils,
  authAnalytics,
  rateLimiter,
} from './server/auth-utils';

/**
 * Server actions grouped by feature for Next.js server components
 */
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
