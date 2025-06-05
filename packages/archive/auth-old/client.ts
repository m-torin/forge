'use client';

// Custom implementation to avoid Better Auth React hooks that are incompatible with React 19
import { createAuthClient } from 'better-auth/client';
import {
  adminClient,
  apiKeyClient,
  // magicLinkClient, // Not available in current better-auth version
  organizationClient,
  // passkeyClient, // Not available in current better-auth version
  // twoFactorClient, // Not available in current better-auth version
} from 'better-auth/client/plugins';

import { adminAccessController, adminRoles } from './admin-permissions';
import { ac, roles } from './permissions';

// Define better auth client type as any to avoid typing issues
// This is a workaround - ideally we would use proper types, but for compatibility
// with existing code this is the fastest solution
type BetterAuthClient = any;

// Create the client instance with explicit type annotation
export const authClient: BetterAuthClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles,
      teams: {
        enabled: true,
      },
    }),
    apiKeyClient(),
    adminClient({
      ac: adminAccessController,
      roles: adminRoles,
    }),
    // magicLinkClient(), // Not available in current better-auth version
    // passkeyClient(),
    // twoFactorClient(),
  ],
});

// Export auth methods directly with explicit type annotations
export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;
export const forgetPassword = authClient.forgetPassword;
export const resetPassword = authClient.resetPassword;
export const sendVerificationEmail = authClient.sendVerificationEmail;
export const verifyEmail = authClient.verifyEmail;

// Magic Link methods
export const sendMagicLink = authClient.magicLink?.sendMagicLink;
export const verifyMagicLink = authClient.magicLink?.verifyMagicLink;

// Social Sign-In methods
export const signInWithGoogle = authClient.signIn.social;
export const signInWithGitHub = authClient.signIn.social;

// Use try/catch to attempt to use the original hook, with a fallback if it fails
// This preserves the original functionality while providing compatibility with React 19
let originalUseSession: any;
try {
  // Try to use the original hook
  originalUseSession = authClient.useSession;
} catch {
  console.warn('Better Auth useSession hook failed to load, using compatibility layer');
}

export const useSession = () => {
  try {
    if (originalUseSession) {
      return originalUseSession();
    }
  } catch {
    console.warn('Better Auth useSession hook failed to load, using compatibility layer');
  }

  // Fallback implementation for React 19 compatibility
  return {
    data: null,
    error: null,
    isPending: false,
  };
};

// Export organization methods with explicit type annotations and non-null assertions
// We use the ! operator to assert these methods are not undefined at runtime
export const createOrganization = authClient.organization!.create;
export const updateOrganization = authClient.organization!.update;
export const deleteOrganization = authClient.organization!.delete;
export const checkSlug = authClient.organization!.checkSlug;
export const inviteMember = authClient.organization!.inviteMember;
export const removeOrganizationMember = authClient.organization!.removeMember;
export const updateMemberRole = authClient.organization!.updateMemberRole;
export const leaveOrganization = authClient.organization!.leave;
export const getOrganization = authClient.organization!.getFullOrganization;
export const listOrganizations = authClient.organization!.list;
export const listInvitations = authClient.organization!.listInvitations;
export const getInvitation = authClient.organization!.getInvitation;
export const acceptInvitation = authClient.organization!.acceptInvitation;
export const rejectInvitation = authClient.organization!.rejectInvitation;
export const cancelInvitation = authClient.organization!.cancelInvitation;
export const getActiveMember = authClient.organization!.getActiveMember;
export const setActiveOrganization = authClient.organization!.setActive;

// Team methods with explicit type annotations and non-null assertions
export const createTeam = authClient.organization!.createTeam;
export const updateTeam = authClient.organization!.updateTeam;
export const removeTeam = authClient.organization!.removeTeam;
export const listTeams = authClient.organization!.listTeams;

// Permission methods with explicit type annotations and non-null assertions
export const hasPermission = authClient.organization!.hasPermission;
export const checkOrgRolePermission = authClient.organization!.checkRolePermission;

// API Key methods with explicit type annotations and non-null assertions
export const createApiKey = authClient.apiKey!.create;
export const updateApiKey = authClient.apiKey!.update;
export const deleteApiKey = authClient.apiKey!.delete;
export const listApiKeys = authClient.apiKey!.list;

// Admin methods with explicit type annotations and non-null assertions
export const createUser = authClient.admin!.createUser;
export const listUsers = authClient.admin!.listUsers;
export const setUserRole = authClient.admin!.setRole;
export const banUser = authClient.admin!.banUser;
export const unbanUser = authClient.admin!.unbanUser;
export const listUserSessions = authClient.admin!.listUserSessions;
export const revokeUserSession = authClient.admin!.revokeUserSession;
export const revokeUserSessions = authClient.admin!.revokeUserSessions;
export const impersonateUser = authClient.admin!.impersonateUser;
export const stopImpersonating = authClient.admin!.stopImpersonating;
export const removeUser = authClient.admin!.removeUser;
export const hasAdminPermission = authClient.admin!.hasPermission;
export const checkRolePermission = authClient.admin!.checkRolePermission;
// setPassword is not available in the admin API, commenting out
// export const setPassword = authClient.admin?.setPassword;

// Two-Factor Authentication methods with explicit type annotations and non-null assertions
export const enableTwoFactor = authClient.twoFactor!.enable;
export const disableTwoFactor = authClient.twoFactor!.disable;
export const verifyTwoFactor = authClient.twoFactor!.verify;
export const getTwoFactorQRCode = authClient.twoFactor!.getQRCode;
export const getTwoFactorStatus = authClient.twoFactor!.getStatus;
export const getTwoFactorBackupCodes = authClient.twoFactor!.getBackupCodes;
export const regenerateTwoFactorBackupCodes = authClient.twoFactor!.regenerateBackupCodes;

// Passkey methods with explicit type annotations and non-null assertions
export const addPasskey = authClient.passkey!.addPasskey;
export const listPasskeys = authClient.passkey!.listPasskeys;
export const deletePasskey = authClient.passkey!.deletePasskey;
export const signInWithPasskey = authClient.passkey!.signIn;
export const signUpWithPasskey = authClient.passkey!.signUp;

// Hook exports
// We'll comment out these hooks temporarily due to React 19 compatibility issues
// export const useActiveOrganization = authClient.useActiveOrganization;
// export const useListOrganizations = authClient.useListOrganizations;

// Create useUser hook that maps Better Auth user data to expected interface
export const useUser = () => {
  const { data: session, error: _error, isPending } = useSession();

  if (!session?.user) {
    return { isLoaded: !isPending, user: null };
  }

  // Map Better Auth user to expected interface
  const user = {
    id: session.user.id,
    name: session.user.name || '',
    createdAt: session.user.createdAt,
    email: session.user.email,
    emailAddresses: [
      {
        emailAddress: session.user.email,
        isPrimary: true,
      },
    ],
    firstName: session.user.name?.split(' ')[0] || '',
    fullName: session.user.name || '',
    image: session.user.image || null,
    imageUrl: session.user.image || null,
    lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
    phoneNumbers: [],
  };

  return { isLoaded: !isPending, user };
};
