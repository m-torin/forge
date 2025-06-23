/**
 * Next.js client exports
 */

'use client';

// Export Next.js specific features
export { AuthProvider, useAuthContext } from './client/auth-provider';
export { useAuth, useUser, useIsAuthenticated, useRequireAuth, useAuthGuard } from './client/hooks';

// Export navigation helpers
export { useAuthRedirect } from './client/navigation';

// Export safe client methods only - these don't import server actions
export {
  signIn,
  signOut,
  signUp,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  setPassword,
  sendMagicLink,
  verifyMagicLink,
  getSession,
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
  revokeUserSession,
  signInWithGoogle,
  signInWithGitHub,
} from './client/methods';
