'use client';

/**
 * Next.js client exports
 */

// Export key client methods following BetterAuth demo patterns
// Import and re-export the specific methods we need
import { authClient } from './client/client-next';

// Export Next.js specific features
export { AuthProvider, useAuthContext } from './client/auth-provider';
export {
  useAuth,
  useAuthGuard,
  useSession as useAuthSession,
  useIsAuthenticated,
  useRequireAuth,
  useUser,
} from './client/hooks';

// Export auth client for direct access (Next.js specific)
export { authClient } from './client/client-next';

// Export key client methods following BetterAuth demo patterns
export const {
  useSession,
  // Organization methods
  organization,
  useListOrganizations,
  useActiveOrganization,
  // Two-Factor Authentication methods
  twoFactor,
  // Admin methods
  admin,
  // API Key methods
  apiKey,
  // Passkey methods
  passkey,
} = authClient;

// Export navigation helpers
export { useAuthRedirect } from './client/navigation';

// Export safe client methods only - these don't import server actions
export {
  acceptInvitation,
  addPasskey,
  bulkRevokeSessions,
  changePassword,
  deletePasskey,
  disableTwoFactor,
  enableTwoFactor,
  forgotPassword,
  getInvitation,
  getSession,
  getSessionStats,
  getTwoFactorBackupCodes,
  getTwoFactorQRCode,
  getTwoFactorStatus,
  getUserSessions,
  listInvitations,
  listPasskeys,
  regenerateTwoFactorBackupCodes,
  rejectInvitation,
  resetPassword,
  revokeAllOtherSessions,
  revokeUserSession,
  sendMagicLink,
  sendTwoFactorOTP,
  setPassword,
  signIn,
  signInWithGitHub,
  signInWithGoogle,
  signInWithPasskey,
  signOut,
  // Core auth methods - wrapped functions that properly call authClient.signUp.email(), etc.
  signUp,
  signUpWithPasskey,
  verifyEmail,
  verifyMagicLink,
  verifyTwoFactor,
  verifyTwoFactorOTP,
} from './client/methods';
