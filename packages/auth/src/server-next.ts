/**
 * Next.js server exports
 */

export * from './server/next';

// Export all server actions for Next.js
// Re-export specific actions to avoid conflicts
export {
  // User Management
  getCurrentUserAction,
  updateUserAction,
  deleteUserAction,
  changePasswordAction,
  setPasswordAction,

  // Session Management
  getSessionAction,
  deleteSessionAction,
  listSessionsAction,

  // Account Management
  listAccountsAction,
  unlinkAccountAction,

  // Organization Management
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
  listUserOrganizationsAction,
  getActiveOrganizationAction,
  getOrganizationByIdAction,
  setActiveOrganizationAction,
  listOrganizationInvitationsAction,

  // API Key Management
  listApiKeysAction,
  createApiKeyAction,
  updateApiKeyAction,
  deleteApiKeyAction,
  getApiKeyAction,
  bulkCreateApiKeysAction,
  getApiKeyStatisticsAction,

  // Two-Factor Authentication
  getTwoFactorStatusAction,
  enableTwoFactorAction,
  disableTwoFactorAction,
  getTwoFactorBackupCodesAction,

  // Passkey Management
  listPasskeysAction,
  generatePasskeyRegistrationOptionsAction,
  deletePasskeyAction,

  // Admin Actions
  banUserAction,
  unbanUserAction,
  listUsersAction,
  impersonateUserAction,
  stopImpersonatingAction,
  bulkInviteUsersAction,
} from './server-actions';
