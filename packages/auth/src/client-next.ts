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

// Export key client methods - use safe property access for plugin methods
export const { useSession } = authClient;

// Export plugin methods safely with fallbacks
export const organization = (authClient as any).organization || {};
export const useListOrganizations = (authClient as any).useListOrganizations;
export const useActiveOrganization = (authClient as any).useActiveOrganization;
export const twoFactor = (authClient as any).twoFactor || {};
export const admin = (authClient as any).admin || {};
export const apiKey = (authClient as any).apiKey || {};
export const passkey = (authClient as any).passkey || {};

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
