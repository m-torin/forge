/**
 * Client-side authentication methods with input validation
 */

'use client';

import { AuthValidation, validateFields } from '../shared/validation';
import { authClient } from './client';
import { logger } from './utils/logger';

import type { AuthClientMethods } from '../shared/types';

// Basic authentication methods
/**
 * Signs in a user with email and password
 * @param credentials - Email and password credentials
 * @returns Promise with success status and optional error message
 */
export const signIn: AuthClientMethods['signIn'] = async credentials => {
  try {
    // Validate input
    const validation = validateFields(credentials as unknown as Record<string, unknown>, {
      email: AuthValidation.email,
      password: AuthValidation.password,
    });

    if (!validation.success) {
      return {
        error: validation.errors[0]?.message || 'Invalid input',
        success: false,
      };
    }

    if (!validation.data) {
      return {
        error: 'Validation failed',
        success: false,
      };
    }

    const validatedData = validation.data as { email: string; password: string };
    const response = await authClient.signIn.email({
      email: validatedData.email,
      password: validatedData.password,
      rememberMe: (credentials as any).rememberMe,
    });

    // Better Auth client returns a response object
    if (response.error) {
      return {
        error: response.error.message || 'Sign in failed',
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign in failed',
      success: false,
    };
  }
};

/**
 * Signs out the current user
 */
export const signOut = async () => {
  await authClient.signOut();
};

/**
 * Creates a new user account
 * @param data - User registration data including email, password, and optional name
 * @returns Promise with success status and optional error message
 */
export const signUp: AuthClientMethods['signUp'] = async data => {
  try {
    // Validate input
    const validation = validateFields(data as unknown as Record<string, unknown>, {
      email: AuthValidation.email,
      password: AuthValidation.password,
      ...(data.name && { name: AuthValidation.name }),
    });

    if (!validation.success) {
      return {
        error: validation.errors[0]?.message || 'Invalid input',
        success: false,
      };
    }

    if (!validation.data) {
      return {
        error: 'Validation failed',
        success: false,
      };
    }

    const validatedData = validation.data as { email: string; password: string; name?: string };
    const response = await authClient.signUp.email({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name || validatedData.email.split('@')[0],
    });

    if (response.error) {
      return {
        error: response.error.message || 'Sign up failed',
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign up failed',
      success: false,
    };
  }
};

export const forgotPassword: AuthClientMethods['forgotPassword'] = async email => {
  try {
    const response = await authClient.forgetPassword({ email });

    if (response.error) {
      return {
        error: response.error.message || 'Failed to send reset email',
        success: false,
      };
    }

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
    const response = await authClient.resetPassword({ newPassword: password, token });

    if (response.error) {
      return {
        error: response.error.message || 'Password reset failed',
        success: false,
      };
    }

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

export const verifyEmail: AuthClientMethods['verifyEmail'] = async token => {
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
export const signInWithGoogle = async () => {
  try {
    await authClient.signIn.social({ provider: 'google' });
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Google sign in failed',
      success: false,
    };
  }
};

export const signInWithGitHub = async () => {
  try {
    await authClient.signIn.social({ provider: 'github' });
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'GitHub sign in failed',
      success: false,
    };
  }
};

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
/**
 * Creates a new organization
 * @param data - Organization data including name, optional slug and logo
 * @returns Promise with organization creation result
 */
export const createOrganization = async (data: { name: string; slug?: string; logo?: string }) => {
  try {
    return await (authClient as any).organization.create({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      logo: data.logo,
    });
  } catch (error) {
    logger.error(
      'Create organization failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    return await (authClient as any).organization.update({
      organizationId: data.organizationId,
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        metadata: data.metadata,
      },
    });
  } catch (error) {
    logger.error(
      'Update organization failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const deleteOrganization = async (organizationId: string) => {
  try {
    return await (authClient as any).organization.delete({ organizationId });
  } catch (error) {
    logger.error(
      'Delete organization failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const checkSlug = async (slug: string) => {
  try {
    return await (authClient as any).organization.checkSlug({ slug });
  } catch (error) {
    logger.error('Check slug failed:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

/**
 * Invites a new member to an organization
 * @param data - Invitation data including email, role, and optional organizationId
 * @returns Promise with invitation result
 */
export const inviteMember = async (data: {
  email: string;
  role: 'member' | 'admin' | 'owner';
  organizationId?: string;
}) => {
  try {
    return await (authClient as any).organization.inviteMember(data);
  } catch (error) {
    logger.error(
      'Invite member failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const removeOrganizationMember = async (data: {
  memberIdOrEmail: string;
  organizationId?: string;
}) => {
  try {
    return await (authClient as any).organization.removeMember(data);
  } catch (error) {
    logger.error(
      'Remove member failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const updateMemberRole = async (data: {
  memberId: string;
  role: 'member' | 'admin' | 'owner';
}) => {
  try {
    return await (authClient as any).organization.updateMemberRole(data);
  } catch (error) {
    logger.error(
      'Update member role failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const leaveOrganization = async (organizationId?: string) => {
  try {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
    return await (authClient as any).organization.leave({ organizationId });
  } catch (error) {
    logger.error(
      'Leave organization failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const getOrganization = async (organizationId?: string) => {
  try {
    return await (authClient as any).organization.getFullOrganization({
      query: organizationId ? { organizationId } : {},
    });
  } catch (error) {
    logger.error(
      'Get organization failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const listOrganizations = async () => {
  try {
    return await (authClient as any).organization.list();
  } catch (error) {
    logger.error(
      'List organizations failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const listInvitations = async (organizationId?: string) => {
  try {
    return await (authClient as any).organization.listInvitations({
      query: organizationId ? { organizationId } : {},
    });
  } catch (error) {
    logger.error(
      'List invitations failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const getInvitation = async (invitationId: string) => {
  try {
    return await (authClient as any).organization.getInvitation({
      query: { id: invitationId },
    });
  } catch (error) {
    logger.error(
      'Get invitation failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const acceptInvitation = async (invitationId: string) => {
  try {
    return await (authClient as any).organization.acceptInvitation({ invitationId });
  } catch (error) {
    logger.error(
      'Accept invitation failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const rejectInvitation = async (invitationId: string) => {
  try {
    return await (authClient as any).organization.rejectInvitation({ invitationId });
  } catch (error) {
    logger.error(
      'Reject invitation failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const cancelInvitation = async (invitationId: string) => {
  try {
    return await (authClient as any).organization.cancelInvitation({ invitationId });
  } catch (error) {
    logger.error(
      'Cancel invitation failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const getActiveMember = async (organizationId?: string) => {
  try {
    return await (authClient as any).organization.getActiveMember({
      query: organizationId ? { organizationId } : {},
    });
  } catch (error) {
    logger.error(
      'Get active member failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const setActiveOrganization = async (organizationId: string) => {
  try {
    return await (authClient as any).organization.setActive({ organizationId });
  } catch (error) {
    logger.error(
      'Set active organization failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

// Team methods - handle optional chaining
export const createTeam = async (data: any) => {
  try {
    if (
      'organization' in (authClient as any) &&
      (authClient as any).organization &&
      'createTeam' in (authClient as any).organization
    ) {
      return await (authClient as any).organization.createTeam(data);
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('Create team failed:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

export const updateTeam = async (data: any) => {
  try {
    if (
      'organization' in (authClient as any) &&
      (authClient as any).organization &&
      'updateTeam' in (authClient as any).organization
    ) {
      return await (authClient as any).organization.updateTeam(data);
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('Update team failed:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

export const removeTeam = async (teamId: string) => {
  try {
    if (
      'organization' in (authClient as any) &&
      (authClient as any).organization &&
      'removeTeam' in (authClient as any).organization
    ) {
      return await (authClient as any).organization.removeTeam({ teamId });
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('Remove team failed:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

export const listTeams = async (organizationId?: string) => {
  try {
    if (
      'organization' in (authClient as any) &&
      (authClient as any).organization &&
      'listTeams' in (authClient as any).organization
    ) {
      return await (authClient as any).organization.listTeams({ organizationId });
    }
    throw new Error('Team management not available');
  } catch (error) {
    logger.error('List teams failed:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

// Permission methods
export const hasPermission = (authClient as any).organization?.hasPermission;
export const checkOrgRolePermission = (authClient as any).organization?.checkRolePermission;

// API Key methods - with proper type checking
export const createApiKey = (authClient as any).apiKey?.create;
export const updateApiKey = (authClient as any).apiKey?.update;
export const deleteApiKey = (authClient as any).apiKey?.delete;
export const listApiKeys = (authClient as any).apiKey?.list;

// Admin methods - with proper type checking
export const createUser = (authClient as any).admin?.createUser;
export const listUsers = (authClient as any).admin?.listUsers;
export const setUserRole = (authClient as any).admin?.setRole;
export const banUser = (authClient as any).admin?.banUser;
export const unbanUser = (authClient as any).admin?.unbanUser;
export const listUserSessions = (authClient as any).admin?.listUserSessions;
export const revokeUserSessions = (authClient as any).admin?.revokeUserSessions;
export const impersonateUser = (authClient as any).admin?.impersonateUser;
export const stopImpersonating = (authClient as any).admin?.stopImpersonating;
export const removeUser = (authClient as any).admin?.removeUser;
export const hasAdminPermission = (authClient as any).admin?.hasPermission;
export const checkRolePermission = (authClient as any).admin?.checkRolePermission;

// Two-factor authentication - Type-safe wrapper functions
/**
 * Enables two-factor authentication for the current user
 * @returns Promise with two-factor setup result
 */
export const enableTwoFactor = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).enable();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error(
      'Enable two-factor failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Disables two-factor authentication for the current user
 * @returns Promise with two-factor disable result
 */
export const disableTwoFactor = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).disable();
    }
    throw new Error('Two-factor authentication not available');
  } catch (error) {
    logger.error(
      'Disable two-factor failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logger.error(
      'Verify two-factor failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logger.error(
      'Get two-factor QR code failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logger.error(
      'Get two-factor status failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logger.error(
      'Get two-factor backup codes failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logger.error(
      'Regenerate two-factor backup codes failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

// OTP Email methods for Two-Factor Authentication
export const sendTwoFactorOTP = async () => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).sendOtp();
    }
    throw new Error('Two-factor OTP not available');
  } catch (error) {
    logger.error(
      'Send two-factor OTP failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const verifyTwoFactorOTP = async (code: string) => {
  try {
    if ('twoFactor' in authClient && authClient.twoFactor) {
      return await (authClient.twoFactor as any).verifyOtp({ code });
    }
    throw new Error('Two-factor OTP not available');
  } catch (error) {
    logger.error(
      'Verify two-factor OTP failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

// Passkey authentication - Type-safe wrapper functions
/**
 * Adds a new passkey for the current user
 * @param data - Optional passkey configuration including name
 * @returns Promise with passkey creation result
 */
export const addPasskey = async (data?: { name?: string }) => {
  try {
    return await (authClient as any).passkey?.addPasskey(data || {});
  } catch (error) {
    logger.error('Add passkey failed:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

export const listPasskeys = async () => {
  try {
    return await (authClient as any).passkey?.listUserPasskeys();
  } catch (error) {
    logger.error(
      'List passkeys failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const deletePasskey = async (passkeyId: string) => {
  try {
    return await (authClient as any).passkey?.deletePasskey({ id: passkeyId });
  } catch (error) {
    logger.error(
      'Delete passkey failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Signs in using passkey authentication
 * @param options - Optional signin options including autoFill and email
 * @returns Promise with passkey signin result
 */
export const signInWithPasskey = async (options?: { autoFill?: boolean; email?: string }) => {
  try {
    return await (authClient as any).signIn?.passkey(options);
  } catch (error) {
    logger.error(
      'Sign in with passkey failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const signUpWithPasskey = async (data: any) => {
  try {
    // First sign up with email/password, then add passkey
    const signUpResult = await authClient.signUp.email(data);
    if (signUpResult.error) {
      throw new Error(signUpResult.error.message);
    }
    // Then add passkey after successful signup
    return await (authClient as any).passkey?.addPasskey({
      name: data.passkeyName || 'Default Passkey',
    });
  } catch (error) {
    logger.error(
      'Sign up with passkey failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logger.error(
      'Revoke session failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

// Enhanced Session Management for Advanced Dashboard
export const getUserSessions = async () => {
  try {
    if ('multiSession' in authClient && authClient.multiSession) {
      return await (authClient.multiSession as any).listSessions();
    }
    throw new Error('Multi-session not available');
  } catch (error) {
    logger.error(
      'Get user sessions failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const bulkRevokeSessions = async (sessionIds: string[]) => {
  try {
    const results = await Promise.allSettled(
      sessionIds.map(sessionId => revokeUserSession(sessionId)),
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      succeeded,
      failed,
      total: sessionIds.length,
    };
  } catch (error) {
    logger.error(
      'Bulk revoke sessions failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const revokeAllOtherSessions = async () => {
  try {
    const sessions = await getUserSessions();
    if (sessions.data) {
      const otherSessions = sessions.data.filter((s: any) => !s.isCurrent);
      const sessionIds = otherSessions.map((s: any) => s.id);
      return await bulkRevokeSessions(sessionIds);
    }
    return { success: true, succeeded: 0, failed: 0, total: 0 };
  } catch (error) {
    logger.error(
      'Revoke all other sessions failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const getSessionStats = async () => {
  try {
    const sessions = await getUserSessions();
    if (!sessions.data) {
      return { success: false, error: 'No session data available' };
    }

    // Calculate basic stats from session data
    const total = sessions.data.length;
    const active = sessions.data.filter((s: any) => s.isActive).length;
    const inactive = total - active;

    const byDevice = sessions.data.reduce(
      (acc: any, session: any) => {
        const deviceType = session.device?.type || 'unknown';
        acc[deviceType] = (acc[deviceType] || 0) + 1;
        return acc;
      },
      { desktop: 0, mobile: 0, tablet: 0, unknown: 0 },
    );

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        byDevice,
        byLocation: [], // Would need geo data
        byRiskLevel: { low: 0, medium: 0, high: 0, critical: 0 }, // Would need risk scoring
        averageDuration: 0, // Would need duration tracking
        totalDataTransferred: 0, // Would need metrics tracking
      },
    };
  } catch (error) {
    logger.error(
      'Get session stats failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

// ========================
// NEW AUTHENTICATION METHODS
// ========================

/**
 * Creates an anonymous session for guest users
 * @returns Promise with anonymous session result
 */
export const createAnonymousSession = async () => {
  try {
    return await (authClient as any).anonymous?.signIn();
  } catch (error) {
    logger.error(
      'Create anonymous session failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Links an anonymous session to a permanent account
 * @param credentials - Email and password for the account
 * @returns Promise with account linking result
 */
export const linkAnonymousAccount = async (credentials: { email: string; password: string }) => {
  try {
    return await (authClient as any).anonymous?.linkAccount(credentials);
  } catch (error) {
    logger.error(
      'Link anonymous account failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Signs in using a phone number
 * @param phoneNumber - The phone number to send OTP to
 * @returns Promise with OTP sending result
 */
export const signInWithPhoneNumber = async (phoneNumber: string) => {
  try {
    return await (authClient as any).signIn?.phoneNumber({ phoneNumber });
  } catch (error) {
    logger.error(
      'Sign in with phone number failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Verifies phone number OTP and completes sign in
 * @param data - Phone number and OTP code
 * @returns Promise with verification result
 */
export const verifyPhoneOTP = async (data: { phoneNumber: string; otp: string }) => {
  try {
    return await (authClient as any).verifyOtp(data);
  } catch (error) {
    logger.error(
      'Verify phone OTP failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Adds a phone number to the current user account
 * @param phoneNumber - The phone number to add
 * @returns Promise with phone number addition result
 */
export const addPhoneNumber = async (phoneNumber: string) => {
  try {
    return await (authClient as any).phoneNumber?.addPhoneNumber({ phoneNumber });
  } catch (error) {
    logger.error(
      'Add phone number failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Verifies a phone number for the current user
 * @param data - Phone number and OTP code
 * @returns Promise with verification result
 */
export const verifyPhoneNumber = async (data: { phoneNumber: string; otp: string }) => {
  try {
    return await (authClient as any).phoneNumber?.verifyPhoneNumber(data);
  } catch (error) {
    logger.error(
      'Verify phone number failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Sends an email OTP for verification
 * @param email - The email address to send OTP to
 * @param type - The type of verification (sign-in, sign-up, etc.)
 * @returns Promise with OTP sending result
 */
export const sendEmailOTP = async (email: string, type?: string) => {
  try {
    return await (authClient as any).emailOTP?.sendVerificationOTP({ email, type });
  } catch (error) {
    logger.error(
      'Send email OTP failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Verifies an email OTP
 * @param data - Email and OTP code
 * @returns Promise with verification result
 */
export const verifyEmailOTP = async (data: { email: string; otp: string }) => {
  try {
    return await (authClient as any).emailOTP?.verifyOTP(data);
  } catch (error) {
    logger.error(
      'Verify email OTP failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

/**
 * Signs in using email OTP instead of password
 * @param email - The email address
 * @returns Promise with OTP sending result
 */
export const signInWithEmailOTP = async (email: string) => {
  try {
    return await (authClient as any).signIn?.emailOTP({ email });
  } catch (error) {
    logger.error(
      'Sign in with email OTP failed:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};
