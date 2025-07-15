/**
 * Re-export auth actions from the auth package
 * All server actions for authentication flows
 */

// Re-export all actions from the auth package
export {
  adminDeleteUserAction,
  bulkInviteUsersAction,
  // Password management
  changePasswordFormAction,
  // API Keys
  createAPIKeyAction,
  // Organization management
  createOrganizationAction,
  // Passkey management
  createPasskeyAction,
  // Admin actions
  createUserAction,
  deleteOrganizationAction,
  deletePasskeyAction,
  // Device/session management
  deleteUserAction,
  disableTwoFactorAction,
  // Two-factor authentication
  enableTwoFactorAction,
  // User management
  impersonateUserAction,
  inviteMembersAction,
  listUsersAction,
  refreshSessionsAction,
  removeMemberAction,
  requestEmailVerificationAction,
  // Magic link
  requestMagicLinkAction,
  resendMagicLinkAction,
  resendVerificationEmailAction,
  resetPasswordFormAction,
  revokeAPIKeyAction,
  revokeAllOtherSessionsAction,
  // Session management
  revokeSessionAction,
  sendPasswordResetFormAction,
  // Core auth actions
  signInAction,
  signUpAction,
  socialSignInAction,
  stopImpersonatingAction,
  switchOrganizationAction,
  updateMemberRoleAction,
  updateOrganizationAction,
  // Profile management
  updateProfileAction,
  // Email verification
  verifyEmailAction,
  verifyTwoFactorAction,
  verifyTwoFactorSetupAction,
} from '@repo/auth/server-actions';
