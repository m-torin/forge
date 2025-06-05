/**
 * Client-side authentication methods
 */

'use client';

import { authClient } from './auth-client';
import type { AuthClientMethods } from '../shared/types';

// Basic authentication methods
export const signIn: AuthClientMethods['signIn'] = async (credentials) => {
  try {
    await authClient.signIn.email(credentials);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sign in failed' 
    };
  }
};

export const signOut = async () => {
  await authClient.signOut();
};

export const signUp: AuthClientMethods['signUp'] = async (data) => {
  try {
    await authClient.signUp.email(data);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sign up failed' 
    };
  }
};

export const forgotPassword: AuthClientMethods['forgotPassword'] = async (email) => {
  try {
    await authClient.forgetPassword({ email });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send reset email' 
    };
  }
};

export const resetPassword: AuthClientMethods['resetPassword'] = async (token, password) => {
  try {
    await authClient.resetPassword({ token, password });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Password reset failed' 
    };
  }
};

export const verifyEmail: AuthClientMethods['verifyEmail'] = async (token) => {
  try {
    await authClient.verifyEmail({ token });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Email verification failed' 
    };
  }
};

// Social authentication
export const signInWithGoogle = () => authClient.signIn.social({ provider: 'google' });
export const signInWithGitHub = () => authClient.signIn.social({ provider: 'github' });

// Magic link authentication
export const sendMagicLink = async (email: string) => {
  try {
    await authClient.magicLink?.sendMagicLink({ email });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send magic link' 
    };
  }
};

export const verifyMagicLink = async (token: string) => {
  try {
    await authClient.magicLink?.verifyMagicLink({ token });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Magic link verification failed' 
    };
  }
};

// Organization methods
export const createOrganization = authClient.organization?.create;
export const updateOrganization = authClient.organization?.update;
export const deleteOrganization = authClient.organization?.delete;
export const checkSlug = authClient.organization?.checkSlug;
export const inviteMember = authClient.organization?.inviteMember;
export const removeOrganizationMember = authClient.organization?.removeMember;
export const updateMemberRole = authClient.organization?.updateMemberRole;
export const leaveOrganization = authClient.organization?.leave;
export const getOrganization = authClient.organization?.getFullOrganization;
export const listOrganizations = authClient.organization?.list;
export const listInvitations = authClient.organization?.listInvitations;
export const getInvitation = authClient.organization?.getInvitation;
export const acceptInvitation = authClient.organization?.acceptInvitation;
export const rejectInvitation = authClient.organization?.rejectInvitation;
export const cancelInvitation = authClient.organization?.cancelInvitation;
export const getActiveMember = authClient.organization?.getActiveMember;
export const setActiveOrganization = authClient.organization?.setActive;

// Team methods
export const createTeam = authClient.organization?.createTeam;
export const updateTeam = authClient.organization?.updateTeam;
export const removeTeam = authClient.organization?.removeTeam;
export const listTeams = authClient.organization?.listTeams;

// Permission methods
export const hasPermission = authClient.organization?.hasPermission;
export const checkOrgRolePermission = authClient.organization?.checkRolePermission;

// API Key methods
export const createApiKey = authClient.apiKey?.create;
export const updateApiKey = authClient.apiKey?.update;
export const deleteApiKey = authClient.apiKey?.delete;
export const listApiKeys = authClient.apiKey?.list;

// Admin methods
export const createUser = authClient.admin?.createUser;
export const listUsers = authClient.admin?.listUsers;
export const setUserRole = authClient.admin?.setRole;
export const banUser = authClient.admin?.banUser;
export const unbanUser = authClient.admin?.unbanUser;
export const listUserSessions = authClient.admin?.listUserSessions;
export const revokeUserSession = authClient.admin?.revokeUserSession;
export const revokeUserSessions = authClient.admin?.revokeUserSessions;
export const impersonateUser = authClient.admin?.impersonateUser;
export const stopImpersonating = authClient.admin?.stopImpersonating;
export const removeUser = authClient.admin?.removeUser;
export const hasAdminPermission = authClient.admin?.hasPermission;
export const checkRolePermission = authClient.admin?.checkRolePermission;

// Two-factor authentication - Optional chaining for type safety
export const enableTwoFactor = (authClient as any).twoFactor?.enable;
export const disableTwoFactor = (authClient as any).twoFactor?.disable;
export const verifyTwoFactor = (authClient as any).twoFactor?.verify;
export const getTwoFactorQRCode = (authClient as any).twoFactor?.getQRCode;
export const getTwoFactorStatus = (authClient as any).twoFactor?.getStatus;
export const getTwoFactorBackupCodes = (authClient as any).twoFactor?.getBackupCodes;
export const regenerateTwoFactorBackupCodes = (authClient as any).twoFactor?.regenerateBackupCodes;

// Passkey authentication - Optional chaining for type safety
export const addPasskey = (authClient as any).passkey?.addPasskey;
export const listPasskeys = (authClient as any).passkey?.listPasskeys;
export const deletePasskey = (authClient as any).passkey?.deletePasskey;
export const signInWithPasskey = (authClient as any).passkey?.signIn;
export const signUpWithPasskey = (authClient as any).passkey?.signUp;