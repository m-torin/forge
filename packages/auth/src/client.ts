/**
 * Client exports for browser environments (non-Next.js)
 */

// Import for destructuring
import { authClient } from './client/client';

('use client');

// Export configured client
export { authClient } from './client/client';

// Export key client methods
export const {
  signUp,
  signIn,
  signOut,
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
