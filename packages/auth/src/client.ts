/**
 * Client exports for browser environments (non-Next.js)
 */

// Import for destructuring
import { authClient } from './client/client';

('use client');

// Export configured client
export { authClient } from './client/client';

// Export key client methods
export const { signUp, signIn, signOut, useSession } = authClient;

// Export plugin methods safely with fallbacks
export const organization = (authClient as any).organization || {};
export const useListOrganizations = (authClient as any).useListOrganizations;
export const useActiveOrganization = (authClient as any).useActiveOrganization;
export const twoFactor = (authClient as any).twoFactor || {};
export const admin = (authClient as any).admin || {};
export const apiKey = (authClient as any).apiKey || {};
export const passkey = (authClient as any).passkey || {};

// Export additional hooks
export { useAuth, useAuthGuard, useIsAuthenticated, useRequireAuth, useUser } from './client/hooks';

// Export types
export type * from './types';

// Export additional client utilities
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
