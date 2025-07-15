'use client';

/**
 * Client exports for browser environments (non-Next.js)
 */

// Import for destructuring
import { authClient } from './client/client';

/**
 * Configured auth client instance for browser environments
 */
export { authClient } from './client/client';

/**
 * Core authentication methods destructured from authClient
 * @returns Authentication methods for sign up, sign in, sign out, and session management
 */
export const { signUp, signIn, signOut, useSession } = authClient;

/**
 * Organization management methods with fallback for plugin availability
 */
export const organization = (authClient as any).organization || {};

/**
 * Hook for listing user organizations
 * @returns React hook for fetching organization list
 */
export const useListOrganizations = (authClient as any).useListOrganizations;

/**
 * Hook for managing active organization
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
 * Authentication hooks for React components
 */
export { useAuth, useAuthGuard, useIsAuthenticated, useRequireAuth, useUser } from './client/hooks';

/**
 * All authentication types and interfaces
 */
export type * from './types';

/**
 * Additional client authentication methods
 */
export {
  addPasskey,
  changePassword,
  deletePasskey,
  disableTwoFactor,
  enableTwoFactor,
  forgotPassword,
  getSession,
  getTwoFactorBackupCodes,
  getTwoFactorQRCode,
  getTwoFactorStatus,
  listPasskeys,
  regenerateTwoFactorBackupCodes,
  resetPassword,
  revokeUserSession,
  sendMagicLink,
  setPassword,
  signInWithGitHub,
  signInWithGoogle,
  signInWithPasskey,
  signUpWithPasskey,
  verifyEmail,
  verifyMagicLink,
  verifyTwoFactor,
} from './client/methods';
