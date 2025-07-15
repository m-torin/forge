/**
 * Server Actions for Tailwind v4 RSC Auth Components
 * Real Better Auth integration for core forms
 */

'use server';

// Import all server actions from the auth package
export {
  adminDeleteUserAction,
  banUserAction,
  bulkInviteUsersAction,
  // Password management
  changePasswordFormAction as changePasswordAction,
  // API Key management
  createAPIKeyAction,
  // Organization management
  createOrganizationAction,
  // Passkey management
  createPasskeyAction,
  createUserAction,
  deleteOrganizationAction,
  deletePasskeyAction,
  // Two-factor authentication
  enableTwoFactorAction,
  sendPasswordResetFormAction as forgotPasswordAction,
  generateBearerTokenAction,
  // User management
  impersonateUserAction,
  inviteMembersAction,
  listUsersAction,
  refreshSessionsAction,
  removeMemberAction,
  requestEmailVerificationAction,
  // Magic links
  requestMagicLinkAction,
  resendMagicLinkAction,
  resendVerificationEmailAction,
  resetPasswordFormAction as resetPasswordAction,
  revokeAllOtherSessionsAction,
  revokeAPIKeyAction,
  // Session management
  revokeSessionAction,
  revokeUserSessionsAction,
  // Email OTP
  sendEmailOTP,
  setUserRoleAction,
  // Core auth actions
  signInAction,
  signUpAction,
  // Social login
  socialSignInAction as socialLoginAction,
  stopImpersonatingAction,
  switchOrganizationAction,
  unbanUserAction,
  updateMemberRoleAction,
  updateOrganizationAction,
  updatePermissionsAction,
  // Profile management
  updateProfileAction,
  updateUserAction,
  // Email verification
  verifyEmailAction,
  verifyEmailOTP,
  verifyTwoFactorAction,
  verifyTwoFactorSetupAction,
} from '@repo/auth/server-actions';
