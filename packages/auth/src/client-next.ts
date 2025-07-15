'use client';

/**
 * Next.js client exports
 */

// Export key client methods following BetterAuth demo patterns
// Import and re-export the specific methods we need
import { authClient } from './client/client-next';

/**
 * Next.js specific authentication provider and context
 */
export { AuthProvider, useAuthContext } from './client/auth-provider';

/**
 * Authentication hooks optimized for Next.js
 */
export {
  useAuth,
  useAuthGuard,
  useSession as useAuthSession,
  useIsAuthenticated,
  useRequireAuth,
  useUser,
} from './client/hooks';

/**
 * Next.js optimized auth client instance
 */
export { authClient } from './client/client-next';

/**
 * Session management hook from auth client
 */
export const { useSession } = authClient;

/**
 * Organization management methods with fallback for plugin availability
 */
export const organization = (authClient as any).organization || {};

/**
 * Hook for listing user organizations in Next.js
 * @returns React hook for fetching organization list
 */
export const useListOrganizations = (authClient as any).useListOrganizations;

/**
 * Hook for managing active organization in Next.js
 * @returns React hook for active organization state
 */
export const useActiveOrganization = (authClient as any).useActiveOrganization;

/**
 * Two-factor authentication methods with fallback
 */
export const twoFactor = (authClient as any).twoFactor || {};

/**
 * Admin management methods with fallback
 */
export const admin = (authClient as any).admin || {};

/**
 * API key management methods with fallback
 */
export const apiKey = (authClient as any).apiKey || {};

/**
 * Passkey authentication methods with fallback
 */
export const passkey = (authClient as any).passkey || {};

/**
 * Anonymous session methods with fallback
 */
export const anonymous = (authClient as any).anonymous || {};

/**
 * Phone number authentication methods with fallback
 */
export const phoneNumber = (authClient as any).phoneNumber || {};

/**
 * Email OTP authentication methods with fallback
 */
export const emailOTP = (authClient as any).emailOTP || {};

/**
 * Navigation utilities for authenticated routes
 */
export { useAuthRedirect } from './client/navigation';

/**
 * Client-side authentication methods safe for Next.js
 */
export {
  acceptInvitation,
  addPasskey,
  // New authentication methods
  addPhoneNumber,
  bulkRevokeSessions,
  changePassword,
  createAnonymousSession,
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
  linkAnonymousAccount,
  listInvitations,
  listPasskeys,
  regenerateTwoFactorBackupCodes,
  rejectInvitation,
  resetPassword,
  revokeAllOtherSessions,
  revokeUserSession,
  sendEmailOTP,
  sendMagicLink,
  sendTwoFactorOTP,
  setPassword,
  signIn,
  signInWithEmailOTP,
  signInWithGitHub,
  signInWithGoogle,
  signInWithPasskey,
  signInWithPhoneNumber,
  signOut,
  // Core auth methods - wrapped functions that properly call authClient.signUp.email(), etc.
  signUp,
  signUpWithPasskey,
  verifyEmail,
  verifyEmailOTP,
  verifyMagicLink,
  verifyPhoneNumber,
  verifyPhoneOTP,
  verifyTwoFactor,
  verifyTwoFactorOTP,
} from './client/methods';
