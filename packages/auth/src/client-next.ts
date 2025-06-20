/**
 * Next.js client exports
 */

'use client';

// Re-export everything from client
export * from './client';

// Export Next.js specific features
export { AuthProvider, useAuthContext } from './client/auth-provider';
export { useAuth, useUser, useIsAuthenticated, useRequireAuth, useAuthGuard } from './client/hooks';

// Export navigation helpers
export { useAuthRedirect } from './client/navigation';

// Re-export specific client methods that might not be included in the wildcard export
export {
  sendMagicLink,
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
  getTwoFactorQRCode,
  getTwoFactorStatus,
  getTwoFactorBackupCodes,
  regenerateTwoFactorBackupCodes,
  addPasskey,
  listPasskeys,
  deletePasskey,
  signInWithPasskey,
  signUpWithPasskey,
  changePassword,
  setPassword,
  verifyMagicLink,
  revokeUserSession,
} from './client/methods';
