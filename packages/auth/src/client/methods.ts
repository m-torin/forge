/**
 * Client-side authentication methods
 */

'use client';

import { logger } from './utils/logger';
import { authClient } from './client.config';

import type { AuthClientMethods } from '../shared/types';

// Basic authentication methods
export const signIn: AuthClientMethods['signIn'] = async (credentials) => {
  try {
    await authClient.signIn.email(credentials);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign in failed',
      success: false,
    };
  }
};

export const signOut = async () => {
  await authClient.signOut();
};

export const signUp: AuthClientMethods['signUp'] = async (data) => {
  try {
    await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name || data.email.split('@')[0],
    });
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign up failed',
      success: false,
    };
  }
};

export const forgotPassword: AuthClientMethods['forgotPassword'] = async (email) => {
  try {
    await authClient.forgetPassword({ email });
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send reset email',
      success: false,
    };
  }
};

export const resetPassword: AuthClientMethods['resetPassword'] = async (token, password) => {
  try {
    await authClient.resetPassword({ newPassword: password, token });
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Password reset failed',
      success: false,
    };
  }
};

// Change password for authenticated users using better-auth native method
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) => {
  try {
    // Check if changePassword method exists on authClient
    if ('changePassword' in authClient && typeof authClient.changePassword === 'function') {
      await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions ?? true,
      });
    } else {
      // Fallback - use server action or throw error
      throw new Error('changePassword method not available on client - use server action instead');
    }
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Password change failed',
      success: false,
    };
  }
};

// Set password for accounts without existing passwords (e.g., social login accounts)
export const setPassword = async (newPassword: string) => {
  try {
    // Check if setPassword method exists on authClient
    if ('setPassword' in authClient && typeof authClient.setPassword === 'function') {
      await authClient.setPassword({ newPassword });
    } else {
      // Fallback - use server action or throw error
      throw new Error('setPassword method not available on client - use server action instead');
    }
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Set password failed',
      success: false,
    };
  }
};

export const verifyEmail: AuthClientMethods['verifyEmail'] = async (token) => {
  try {
    await authClient.verifyEmail({
      query: { token },
    });
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Email verification failed',
      success: false,
    };
  }
};

// Social authentication
export const signInWithGoogle = () => authClient.signIn.social({ provider: 'google' });
export const signInWithGitHub = () => authClient.signIn.social({ provider: 'github' });

// Magic link authentication
export const sendMagicLink = async (email: string) => {
  try {
    if ('magicLink' in authClient && authClient.magicLink) {
      await (authClient.magicLink as any).sendMagicLink({ email });
    } else {
      throw new Error('Magic link not available');
    }
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send magic link',
      success: false,
    };
  }
};

export const verifyMagicLink = async (token: string) => {
  try {
    if ('magicLink' in authClient && authClient.magicLink) {
      await (authClient.magicLink as any).verifyMagicLink({ token });
    } else {
      throw new Error('Magic link not available');
    }
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Magic link verification failed',
      success: false,
    };
  }
};

// Organization methods - proper wrapper functions for better error handling
export const createOrganization = async (data: { name: string; slug?: string; logo?: string }) => {
  try {
    return await authClient.organization.create({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      logo: data.logo,
    });
  } catch (error) {
    logger.error('Create organization failed:', error);
    throw error;
  }
};

export const updateOrganization = async (data: {
  organizationId?: string;
  name?: string;
  slug?: string;
  logo?: string;
  metadata?: any;
}) => {
  try {
    return await authClient.organization.update({
      organizationId: data.organizationId,
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        metadata: data.metadata,
      },
    });
  } catch (error) {
    logger.error('Update organization failed:', error);
    throw error;
  }
};

export const deleteOrganization = async (organizationId: string) => {
  try {
    return await authClient.organization.delete({ organizationId });
  } catch (error) {
    logger.error('Delete organization failed:', error);
    throw error;
  }
};

export const checkSlug = async (slug: string) => {
  try {
    return await authClient.organization.checkSlug({ slug });
  } catch (error) {
    logger.error('Check slug failed:', error);
    throw error;
  }
};

export const inviteMember = async (data: {
  email: string;
  role: 'member' | 'admin' | 'owner';
  organizationId?: string;
}) => {
  try {
    return await authClient.organization.inviteMember(data);
  } catch (error) {
    logger.error('Invite member failed:', error);
    throw error;
  }
};

export const removeOrganizationMember = async (data: {
  memberIdOrEmail: string;
  organizationId?: string;
}) => {
  try {
    return await authClient.organization.removeMember(data);
  } catch (error) {
    logger.error('Remove member failed:', error);
    throw error;
  }
};

export const updateMemberRole = async (data: {
  memberId: string;
  role: 'member' | 'admin' | 'owner';
}) => {
  try {
    return await authClient.organization.updateMemberRole(data);
  } catch (error) {
    logger.error('Update member role failed:', error);
    throw error;
  }
};

export const leaveOrganization = async (organizationId?: string) => {
  try {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
    return await authClient.organization.leave({ organizationId });
  } catch (error) {
    logger.error('Leave organization failed:', error);
    throw error;
  }
};

export const getOrganization = async (organizationId?: string) => {
  try {
    return await authClient.organization.getFullOrganization({
      query: organizationId ? { organizationId } : {},
    });
  } catch (error) {
    logger.error('Get organization failed:', error);
    throw error;
  }
};

export const listOrganizations = async () => {
  try {
    return await authClient.organization.list();
  } catch (error) {
    logger.error('List organizations failed:', error);
    throw error;
  }
};

export const listInvitations = async (organizationId?: string) => {
  try {
    return await authClient.organization.listInvitations({
      query: organizationId ? { organizationId } : {},
    });
  } catch (error) {
    logger.error('List invitations failed:', error);
    throw error;
  }
};

export const getInvitation = async (invitationId: string) => {
  try {
    return await authClient.organization.getInvitation({
      query: { id: invitationId },
    });
  } catch (error) {
    logger.error('Get invitation failed:', error);
    throw error;
  }
};

export const acceptInvitation = async (invitationId: string) => {
  try {
    return await authClient.organization.acceptInvitation({ invitationId });
  } catch (error) {
    logger.error('Accept invitation failed:', error);
    throw error;
  }
};

export const rejectInvitation = async (invitationId: string) => {
  try {
    return await authClient.organization.rejectInvitation({ invitationId });
  } catch (error) {
    logger.error('Reject invitation failed:', error);
    throw error;
  }
};

export const cancelInvitation = async (invitationId: string) => {
  try {
    return await authClient.organization.cancelInvitation({ invitationId });
  } catch (error) {
    logger.error('Cancel invitation failed:', error);
    throw error;
  }
};

export const getActiveMember = async (organizationId?: string) => {
  try {
    return await authClient.organization.getActiveMember({
      query: organizationId ? { organizationId } : {},
    });
  } catch (error) {
    logger.error('Get active member failed:', error);
    throw error;
  }
};

export const setActiveOrganization = async (organizationId: string) => {
  try {
    return await authClient.organization.setActive({ organizationId });
  } catch (error) {
    logger.error('Set active organization failed:', error);
    throw error;
  }
};

// Team methods - handle optional chaining
export const createTeam = async (data: any) => {
  try {
    if (
      'organization' in authClient &&
      authClient.organization &&
      'createTeam' in authClient.organization
    ) {
      return await (authClient.organization as any).createTeam(data);
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('Create team failed:', error);
    throw error;
  }
};

export const updateTeam = async (data: any) => {
  try {
    if (
      'organization' in authClient &&
      authClient.organization &&
      'updateTeam' in authClient.organization
    ) {
      return await (authClient.organization as any).updateTeam(data);
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('Update team failed:', error);
    throw error;
  }
};

export const removeTeam = async (teamId: string) => {
  try {
    if (
      'organization' in authClient &&
      authClient.organization &&
      'removeTeam' in authClient.organization
    ) {
      return await (authClient.organization as any).removeTeam({ teamId });
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('Remove team failed:', error);
    throw error;
  }
};

export const listTeams = async (organizationId?: string) => {
  try {
    if (
      'organization' in authClient &&
      authClient.organization &&
      'listTeams' in authClient.organization
    ) {
      return await (authClient.organization as any).listTeams({ organizationId });
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('List teams failed:', error);
    throw error;
  }
};

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
export const revokeUserSessions = authClient.admin?.revokeUserSessions;
export const impersonateUser = authClient.admin?.impersonateUser;
export const stopImpersonating = authClient.admin?.stopImpersonating;
export const removeUser = authClient.admin?.removeUser;
export const hasAdminPermission = authClient.admin?.hasPermission;
export const checkRolePermission = authClient.admin?.checkRolePermission;

// Two-factor authentication - Type-safe wrapper functions
export const enableTwoFactor = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).enable();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error('Enable two-factor failed:', error);
    throw error;
  }
};

export const disableTwoFactor = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).disable();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error('Disable two-factor failed:', error);
    throw error;
  }
};

export const verifyTwoFactor = async (code: string) => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).verify({ code });
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error('Verify two-factor failed:', error);
    throw error;
  }
};

export const getTwoFactorQRCode = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).getQRCode();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error('Get two-factor QR code failed:', error);
    throw error;
  }
};

export const getTwoFactorStatus = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).getStatus();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error('Get two-factor status failed:', error);
    throw error;
  }
};

export const getTwoFactorBackupCodes = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).getBackupCodes();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error('Get two-factor backup codes failed:', error);
    throw error;
  }
};

export const regenerateTwoFactorBackupCodes = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).regenerateBackupCodes();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error('Regenerate two-factor backup codes failed:', error);
    throw error;
  }
};

// Passkey authentication - Type-safe wrapper functions
export const addPasskey = async (data?: any) => {
  try {
    if ('passkey' in authClient && authClient.passkey) {
      return await (authClient.passkey as any).addPasskey(data);
    }
    throw new Error('Passkey authentication not available');
  } catch (error) {
    logger.error('Add passkey failed:', error);
    throw error;
  }
};

export const listPasskeys = async () => {
  try {
    if ('passkey' in authClient && authClient.passkey) {
      return await (authClient.passkey as any).listPasskeys();
    }
    throw new Error('Passkey authentication not available');
  } catch (error) {
    logger.error('List passkeys failed:', error);
    throw error;
  }
};

export const deletePasskey = async (passkeyId: string) => {
  try {
    if ('passkey' in authClient && authClient.passkey) {
      return await (authClient.passkey as any).deletePasskey({ passkeyId });
    }
    throw new Error('Passkey authentication not available');
  } catch (error) {
    logger.error('Delete passkey failed:', error);
    throw error;
  }
};

export const signInWithPasskey = async () => {
  try {
    if ('passkey' in authClient && authClient.passkey) {
      return await (authClient.passkey as any).signIn();
    }
    throw new Error('Passkey authentication not available');
  } catch (error) {
    logger.error('Sign in with passkey failed:', error);
    throw error;
  }
};

export const signUpWithPasskey = async (data: any) => {
  try {
    if ('passkey' in authClient && authClient.passkey) {
      return await (authClient.passkey as any).signUp(data);
    }
    throw new Error('Passkey authentication not available');
  } catch (error) {
    logger.error('Sign up with passkey failed:', error);
    throw error;
  }
};

export const getSession = async () => {
  return authClient.getSession();
};

// Session management
export const revokeUserSession = async (sessionId: string) => {
  try {
    if ('session' in authClient && authClient.session) {
      return await (authClient.session as any).revoke({ sessionId });
    }
    throw new Error('Session management not available');
  } catch (error) {
    logger.error('Revoke session failed:', error);
    throw error;
  }
};
