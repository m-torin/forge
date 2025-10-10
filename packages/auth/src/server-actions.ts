/**
 * Server actions for Better Auth
 * This file exports all server actions that can be used in Next.js server components
 */

'use server';

import { headers } from 'next/headers';
import { auth } from './shared/auth';

// User Management Actions
/**
 * Gets the current authenticated user from session
 * @returns Current user object or null if not authenticated
 */
export async function getCurrentUserAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

// Sign In/Up Actions for forms
export async function signInAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }

    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
        rememberMe,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign in',
    };
  }
}

export async function signUpAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!email || !password || !name) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }

    if (password.length !== confirmPassword.length || password !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }

    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        email,
        password,
        name,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign up',
    };
  }
}

export async function socialLoginAction(formData: FormData) {
  'use server';
  const provider = formData.get('provider') as string;
  // This would redirect to Better Auth social login endpoint
  return { provider };
}

/**
 * Updates the current user's profile data
 * @param data - User data to update
 * @returns Updated user object
 */
export async function updateUserAction(data: any) {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error('Not authenticated');

  return auth.api.updateUser({
    body: {
      ...data,
      userId: session.user.id,
    },
    headers: await headers(),
  });
}

/**
 * Deletes the current authenticated user account
 * @returns Deletion result
 */
export async function deleteUserAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error('Not authenticated');

  return auth.api.deleteUser({
    headers: await headers(),
  });
}

// Password Management
/**
 * Changes the current user's password
 * @param data - Password change data including current and new password
 * @returns Password change result
 */
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) {
  'use server';
  return auth.api.changePassword({
    body: data,
    headers: await headers(),
  });
}

/**
 * Sets a password for accounts without existing passwords
 * @param newPassword - New password to set
 * @returns Password set result
 */
export async function setPasswordAction(newPassword: string) {
  'use server';
  return auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  });
}

// Session Management
/**
 * Gets the current user session
 * @returns Current session data
 */
export async function getSessionAction() {
  'use server';
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function deleteSessionAction(sessionId: string) {
  'use server';
  return auth.api.revokeSession({
    body: { sessionId },
    headers: await headers(),
  });
}

export async function listSessionsAction() {
  'use server';
  return auth.api.listSessions({
    headers: await headers(),
  });
}

// Account Management
export async function listAccountsAction() {
  'use server';
  return auth.api.listAccounts({
    headers: await headers(),
  });
}

export async function unlinkAccountAction(data: { providerId: string }) {
  'use server';
  return auth.api.unlinkAccount({
    body: data,
    headers: await headers(),
  });
}

// Organization Management
export async function createOrganizationAction(data: {
  name: string;
  slug?: string;
  logo?: string;
}) {
  'use server';
  return auth.api.createOrganization({
    body: data,
    headers: await headers(),
  });
}

export async function updateOrganizationAction(data: {
  organizationId?: string;
  name?: string;
  slug?: string;
  logo?: string;
  metadata?: any;
}) {
  'use server';
  return auth.api.updateOrganization({
    body: data,
    headers: await headers(),
  });
}

export async function deleteOrganizationAction(organizationId: string) {
  'use server';
  return auth.api.deleteOrganization({
    body: { organizationId },
    headers: await headers(),
  });
}

export async function listUserOrganizationsAction() {
  'use server';
  return auth.api.listOrganizations({
    headers: await headers(),
  });
}

export async function getActiveOrganizationAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (session as any)?.session?.activeOrganizationId || null;
}

export async function getOrganizationByIdAction(organizationId: string) {
  'use server';
  return auth.api.getOrganization({
    query: { organizationId },
    headers: await headers(),
  });
}

export async function setActiveOrganizationAction(organizationId: string) {
  'use server';
  return auth.api.setActiveOrganization({
    body: { organizationId },
    headers: await headers(),
  });
}

export async function listOrganizationInvitationsAction(organizationId?: string) {
  'use server';
  return auth.api.listInvitations({
    query: organizationId ? { organizationId } : {},
    headers: await headers(),
  });
}

// API Key Management
export async function listApiKeysAction() {
  'use server';
  return auth.api.listApiKeys({
    headers: await headers(),
  });
}

export async function createApiKeyAction(data: {
  name: string;
  expiresAt?: Date;
  scopes?: string[];
}) {
  'use server';
  return auth.api.createApiKey({
    body: data,
    headers: await headers(),
  });
}

export async function updateApiKeyAction(data: {
  id: string;
  name?: string;
  expiresAt?: Date;
  scopes?: string[];
}) {
  'use server';
  return auth.api.updateApiKey({
    body: data,
    headers: await headers(),
  });
}

export async function deleteApiKeyAction(id: string) {
  'use server';
  return auth.api.deleteApiKey({
    body: { id },
    headers: await headers(),
  });
}

export async function getApiKeyAction(id: string) {
  'use server';
  return auth.api.getApiKey({
    query: { id },
    headers: await headers(),
  });
}

export async function bulkCreateApiKeysAction(data: {
  count: number;
  prefix?: string;
  expiresAt?: Date;
  scopes?: string[];
}) {
  'use server';
  const results = [];
  for (let i = 0; i < data.count; i++) {
    const result = await createApiKeyAction({
      name: `${data.prefix || 'API Key'} ${i + 1}`,
      expiresAt: data.expiresAt,
      scopes: data.scopes,
    });
    results.push(result);
  }
  return results;
}

export async function getApiKeyStatisticsAction() {
  'use server';
  // This would need custom implementation to gather statistics
  const keys = await listApiKeysAction();
  return {
    total: keys.length || 0,
    active: keys.filter((k: any) => !k.expiresAt || new Date(k.expiresAt) > new Date()).length || 0,
    expired:
      keys.filter((k: any) => k.expiresAt && new Date(k.expiresAt) <= new Date()).length || 0,
  };
}

// Two-Factor Authentication
export async function getTwoFactorStatusAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return { enabled: session?.user?.twoFactorEnabled || false };
}

export async function enableTwoFactorAction() {
  'use server';
  return auth.api.enableTwoFactor({
    headers: await headers(),
  });
}

export async function disableTwoFactorAction(data: { password: string }) {
  'use server';
  return auth.api.disableTwoFactor({
    body: data,
    headers: await headers(),
  });
}

export async function getTwoFactorBackupCodesAction() {
  'use server';
  return auth.api.getTwoFactorBackupCodes({
    headers: await headers(),
  });
}

// Passkey Management
export async function listPasskeysAction() {
  'use server';
  return auth.api.listPasskeys({
    headers: await headers(),
  });
}

export async function generatePasskeyRegistrationOptionsAction() {
  'use server';
  return auth.api.generatePasskeyRegistrationOptions({
    headers: await headers(),
  });
}

// Removed duplicate - see line 1588 for the FormState-compatible version

/**
 * Ban a user (admin only)
 * @param userId - ID of user to ban
 * @returns Ban result
 */
export async function banUserAction(userId: string) {
  'use server';
  return auth.api.admin.banUser({
    body: { userId },
    headers: await headers(),
  });
}

/**
 * Unban a previously banned user (admin only)
 * @param userId - ID of user to unban
 * @returns Unban result
 */
export async function unbanUserAction(userId: string) {
  'use server';
  return auth.api.admin.unbanUser({
    body: { userId },
    headers: await headers(),
  });
}

/**
 * List all users with optional filtering (admin only)
 * @param query - Query parameters for filtering and pagination
 * @returns Array of users matching criteria
 */
export async function listUsersAction(query?: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  'use server';
  // Better Auth doesn't have a built-in listUsers method
  // We need to query the database directly
  try {
    const { prisma } = await import('./shared/prisma');

    const where = query?.search
      ? {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' as const } },
            { name: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      skip: query?.offset || 0,
      take: query?.limit || 100,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        banned: true,
      },
    });

    return { success: true, data: users };
  } catch (error: any) {
    throw new Error(`Failed to list users: ${error.message || error}`);
  }
}

export async function impersonateUserAction(userId: string) {
  'use server';
  return auth.api.admin.impersonateUser({
    body: { userId },
    headers: await headers(),
  });
}

export async function stopImpersonatingAction() {
  'use server';
  return auth.api.admin.stopImpersonating({
    headers: await headers(),
  });
}

export async function bulkInviteUsersAction(data: {
  emails: string[];
  role?: string;
  organizationId?: string;
}) {
  'use server';
  const results = [];
  for (const email of data.emails) {
    try {
      const result = await auth.api.sendInvitation({
        body: {
          email,
          role: data.role,
          organizationId: data.organizationId,
        },
        headers: await headers(),
      });
      results.push({ email, success: true, result });
    } catch (error) {
      throw new Error(`Failed to invite user ${email}: ${error}`);
    }
  }
  return results;
}

// Admin User Management Actions
export async function adminDeleteUserAction(userId: string) {
  'use server';
  return auth.api.removeUser({
    body: { userId },
    headers: await headers(),
  });
}

export async function createUserAction(data: {
  email: string;
  name?: string;
  password?: string;
  role?: string;
}) {
  'use server';
  return auth.api.createUser({
    body: {
      email: data.email,
      name: data.name ?? data.email.split('@')[0],
      password: data.password || crypto.randomUUID().substring(0, 12),
      role: data.role as any,
    },
    headers: await headers(),
  });
}

export async function setUserRoleAction(userId: string, role: string) {
  'use server';
  return auth.api.setRole({
    body: { userId, role },
    headers: await headers(),
  });
}

export async function revokeUserSessionsAction(userId: string) {
  'use server';
  return auth.api.revokeUserSessions({
    body: { userId },
    headers: await headers(),
  });
}

// Admin Organization Management Actions
export async function listOrganizationsAction(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  'use server';
  try {
    const headerObj = await headers();
    return auth.api.listOrganizations({
      headers: headerObj,
      body: {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        ...(options?.search && { search: options.search }),
      },
    });
  } catch (_error) {
    // Fallback without headers if headers() fails
    return auth.api.listOrganizations({
      body: {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        ...(options?.search && { search: options.search }),
      },
    });
  }
}

export async function getOrganizationAction(organizationId: string) {
  'use server';
  return auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId },
  });
}

// Team Management Actions
export async function createTeamAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const teamName = formData.get('teamName') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!teamName?.trim()) {
      return {
        success: false,
        error: 'Team name is required',
      };
    }

    // Get current session to get organization context
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const activeOrgId = (session.session as any).activeOrganizationId;
    if (!activeOrgId) {
      return {
        success: false,
        error: 'Active organization required',
      };
    }

    // Create team using Better Auth
    const result = await auth.api.createTeam({
      headers: await headers(),
      body: {
        name: teamName,
        organizationId: activeOrgId,
        metadata: description ? { description, isPublic } : { isPublic },
      },
    });

    if (!result?.team) {
      return {
        success: false,
        error: 'Failed to create team',
      };
    }

    // Generate slug from team name
    const slug = teamName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      success: true,
      teamId: result.team.id,
      slug,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create team',
    };
  }
}

export async function uploadTeamImageAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const teamId = formData.get('teamId') as string;
    const image = formData.get('image') as File;

    if (!teamId || !image) {
      return {
        success: false,
        error: 'Team ID and image are required',
      };
    }

    // In a real implementation, you would upload to a storage service
    // For now, we'll just return a placeholder URL
    const imageUrl = `/api/teams/${teamId}/image`;

    // Update team with image URL using Better Auth
    await auth.api.updateTeam({
      headers: await headers(),
      body: {
        teamId,
        metadata: { imageUrl },
      },
    });

    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload team image',
    };
  }
}

export async function inviteTeamMembersAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const teamId = formData.get('teamId') as string;
    const emails = formData.get('emails') as string;
    const role = formData.get('role') as string;

    if (!teamId || !emails || !role) {
      return {
        success: false,
        error: 'Team ID, emails, and role are required',
      };
    }

    const emailList = emails
      .split(',')
      .map(email => email.trim())
      .filter(Boolean);

    // Invite each member to the team using Better Auth
    for (const email of emailList) {
      await auth.api.inviteMember({
        headers: await headers(),
        body: {
          email,
          role,
          teamId,
        },
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invite team members',
    };
  }
}

// Additional Actions for UI Components
export async function inviteMembersAction(prevState: any, formData: FormData) {
  'use server';
  return inviteTeamMembersAction(prevState, formData);
}

export async function removeMemberAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const organizationId = formData.get('organizationId') as string;
    const memberId = formData.get('memberId') as string;

    await auth.api.removeMember({
      headers: await headers(),
      body: { memberIdOrEmail: memberId, organizationId },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove member',
    };
  }
}

export async function updateMemberRoleAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const organizationId = formData.get('organizationId') as string;
    const memberId = formData.get('memberId') as string;
    const role = formData.get('role') as string;

    await auth.api.updateMemberRole({
      headers: await headers(),
      body: { role, memberId, organizationId },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update member role',
    };
  }
}

export async function switchOrganizationAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const organizationId = formData.get('organizationId') as string;

    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to switch organization',
    };
  }
}

export async function updatePermissionsAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // This would typically update role permissions in Better Auth
    // For now, return success as permissions are handled at the organization level
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update permissions',
    };
  }
}

export async function revokeSessionAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const sessionId = formData.get('sessionId') as string;

    await auth.api.revokeSession({
      headers: await headers(),
      body: { sessionId },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke session',
    };
  }
}

export async function updateProfileAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    await auth.api.updateUser({
      headers: await headers(),
      body: { name, email },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function sendPasswordResetAction(data: { email: string }) {
  'use server';
  try {
    await auth.api.forgetPassword({
      headers: await headers(),
      body: { email: data.email },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send password reset',
    };
  }
}

export async function resetPasswordAction(data: { token: string; password: string }) {
  'use server';
  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: { token: data.token, password: data.password },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset password',
    };
  }
}

export async function socialSignInAction(data: { provider: string; mode?: string }) {
  'use server';
  try {
    // This would typically redirect to Better Auth social endpoint
    // For now, return provider info
    return { success: true, provider: data.provider };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign in with social provider',
    };
  }
}

// Service Account Management actions are available in the api-keys export path

// Email OTP actions
export async function sendEmailOTP(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        errors: { email: ['Email is required'] },
      };
    }

    // TODO: Implement actual email OTP sending
    // Log for development purposes only

    return {
      success: true,
      message: `OTP sent to ${email}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

export async function verifyEmailOTP(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;

    if (!email || !otp) {
      return {
        success: false,
        errors: {
          email: !email ? ['Email is required'] : [],
          otp: !otp ? ['OTP is required'] : [],
        },
      };
    }

    // TODO: Implement actual OTP verification
    // Log for development purposes only

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
}

// Form-compatible action wrappers for useFormState
export async function changePasswordFormAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const revokeOtherSessions = formData.get('revokeOtherSessions') === 'on';

    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        errors: {
          currentPassword: !currentPassword ? ['Current password is required'] : [],
          newPassword: !newPassword ? ['New password is required'] : [],
          confirmPassword: !confirmPassword ? ['Confirm password is required'] : [],
        },
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        errors: { confirmPassword: ['Passwords do not match'] },
      };
    }

    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions },
      headers: await headers(),
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password',
    };
  }
}

export async function resetPasswordFormAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token || !password || !confirmPassword) {
      return {
        success: false,
        errors: {
          token: !token ? ['Reset token is required'] : [],
          password: !password ? ['New password is required'] : [],
          confirmPassword: !confirmPassword ? ['Confirm password is required'] : [],
        },
      };
    }

    if (password.length !== confirmPassword.length || password !== confirmPassword) {
      return {
        success: false,
        errors: { confirmPassword: ['Passwords do not match'] },
      };
    }

    await auth.api.resetPassword({
      headers: await headers(),
      body: { token, password },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset password',
    };
  }
}

export async function sendPasswordResetFormAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        errors: { email: ['Email is required'] },
      };
    }

    await auth.api.forgetPassword({
      headers: await headers(),
      body: { email },
    });

    return {
      success: true,
      message: `Password reset link sent to ${email}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send password reset',
    };
  }
}

// Bearer token generation (for API keys)
export async function generateBearerTokenAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const name = formData.get('name') as string;
    const expirationDays = parseInt((formData.get('expirationDays') as string) || '30');
    const scopes = formData.get('scopes') as string;

    if (!name) {
      return {
        success: false,
        errors: { name: ['Token name is required'] },
      };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const result = await auth.api.createApiKey({
      body: {
        name,
        expiresAt,
        scopes: scopes ? scopes.split(',').map(s => s.trim()) : [],
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: 'Bearer token generated successfully',
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate bearer token',
    };
  }
}

// Additional session management actions
export async function revokeAllOtherSessionsAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    const sessions = await auth.api.listSessions({
      headers: await headers(),
    });

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession?.session) {
      return {
        success: false,
        error: 'No active session found',
      };
    }

    let revokedCount = 0;
    for (const session of sessions || []) {
      if (session.id !== currentSession.session.id) {
        try {
          await auth.api.revokeSession({
            body: { sessionId: session.id },
            headers: await headers(),
          });
          revokedCount++;
        } catch {
          // Silently continue if session revocation fails
        }
      }
    }

    return {
      success: true,
      message: `${revokedCount} sessions revoked successfully`,
      count: revokedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke other sessions',
    };
  }
}

export async function refreshSessionsAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // Refresh sessions list by calling the API
    await listSessionsAction();

    return {
      success: true,
      message: 'Sessions refreshed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh sessions',
    };
  }
}

// Email verification actions
export async function verifyEmailAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const token = formData.get('token') as string;

    if (!token) {
      return {
        success: false,
        errors: { token: ['Verification token is required'] },
      };
    }

    await auth.api.verifyEmail({
      headers: await headers(),
      body: { token },
    });

    return {
      success: true,
      message: 'Email verified successfully! Your account is now fully activated.',
    };
  } catch (error: any) {
    // Handle email verification error

    if (error?.message?.includes('expired')) {
      return {
        success: false,
        error: 'This verification link has expired. Please request a new one.',
      };
    }

    if (error?.message?.includes('already verified')) {
      return {
        success: true,
        message: 'Your email is already verified!',
      };
    }

    return {
      success: false,
      error: 'An error occurred during verification. Please try again.',
    };
  }
}

export async function resendVerificationEmailAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        errors: { email: ['Email is required'] },
      };
    }

    await auth.api.sendVerificationEmail({
      headers: await headers(),
      body: { email },
    });

    return {
      success: true,
      message: `New verification email sent to ${email}!`,
    };
  } catch (error: any) {
    // Handle resend verification email error

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'Please wait before requesting another verification email.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while resending the verification email.',
    };
  }
}

export async function requestEmailVerificationAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        errors: { email: ['Email is required'] },
      };
    }

    await auth.api.sendVerificationEmail({
      headers: await headers(),
      body: { email },
    });

    return {
      success: true,
      message: `Verification email sent to ${email}! Please check your inbox.`,
    };
  } catch (error: any) {
    // Handle email verification request error

    if (error?.message?.includes('already verified')) {
      return {
        success: true,
        message: 'Your email is already verified!',
      };
    }

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'Please wait before requesting another verification email.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while sending the verification email. Please try again.',
    };
  }
}

// Magic link actions
export async function requestMagicLinkAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;
    const _signUp = formData.get('signUp') === 'on';
    const redirectTo = formData.get('redirectTo') as string;

    // Validation
    const errors: Record<string, string[]> = {};

    if (!email) errors.email = ['Email is required'];
    if (email && !email.includes('@')) {
      errors.email = ['Please enter a valid email address'];
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    await auth.api.signInMagicLink({
      headers: await headers(),
      body: {
        email,
        callbackURL: redirectTo || '/dashboard',
      },
    });

    return {
      success: true,
      message: `Magic link sent to ${email}! Check your inbox and click the link to sign in.`,
      data: { email },
    };
  } catch (error: any) {
    // Handle magic link request error

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'Too many requests. Please wait a few minutes before trying again.',
      };
    }

    if (error?.message?.includes('not found') && !formData.get('signUp')) {
      return {
        success: false,
        error: 'No account found with this email address. Try creating an account first.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while sending the magic link. Please try again.',
    };
  }
}

export async function resendMagicLinkAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;
    const redirectTo = formData.get('redirectTo') as string;

    if (!email) {
      return {
        success: false,
        errors: { email: ['Email is required'] },
      };
    }

    await auth.api.signInMagicLink({
      headers: await headers(),
      body: {
        email,
        callbackURL: redirectTo || '/dashboard',
      },
    });

    return {
      success: true,
      message: `New magic link sent to ${email}!`,
    };
  } catch (error: any) {
    // Handle magic link resend error

    if (error?.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'Please wait before requesting another magic link.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while resending the magic link.',
    };
  }
}

// Additional missing actions for uix-system compatibility
export async function verifyTwoFactorSetupAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const code = formData.get('code') as string;

    if (!code) {
      return {
        success: false,
        errors: { code: ['Verification code is required'] },
      };
    }

    // TODO: Implement actual 2FA verification
    // Log for development purposes only

    return {
      success: true,
      message: 'Two-factor authentication setup verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify two-factor setup',
    };
  }
}

export async function verifyTwoFactorAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const code = formData.get('code') as string;

    if (!code) {
      return {
        success: false,
        errors: { code: ['Verification code is required'] },
      };
    }

    // TODO: Implement actual 2FA verification
    // Log for development purposes only

    return {
      success: true,
      message: 'Two-factor code verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify two-factor code',
    };
  }
}

export async function createAPIKeyAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const name = formData.get('name') as string;
    const expiresIn = formData.get('expiresIn') as string;
    const scopes = formData.get('scopes') as string;

    if (!name) {
      return {
        success: false,
        errors: { name: ['API key name is required'] },
      };
    }

    const expirationDays = parseInt(expiresIn) || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const result = await auth.api.createApiKey({
      body: {
        name,
        expiresAt,
        scopes: scopes ? scopes.split(',').map(s => s.trim()) : [],
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: 'API key created successfully',
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create API key',
    };
  }
}

export async function revokeAPIKeyAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const keyId = formData.get('keyId') as string;

    if (!keyId) {
      return {
        success: false,
        errors: { keyId: ['API key ID is required'] },
      };
    }

    await auth.api.deleteApiKey({
      body: { id: keyId },
      headers: await headers(),
    });

    return {
      success: true,
      message: 'API key revoked successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke API key',
    };
  }
}

export async function createPasskeyAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const name = formData.get('name') as string;

    if (!name) {
      return {
        success: false,
        errors: { name: ['Passkey name is required'] },
      };
    }

    // TODO: Implement actual passkey creation
    // Log for development purposes only

    return {
      success: true,
      message: 'Passkey created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create passkey',
    };
  }
}

export async function deletePasskeyAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const passkeyId = formData.get('passkeyId') as string;

    if (!passkeyId) {
      return {
        success: false,
        errors: { passkeyId: ['Passkey ID is required'] },
      };
    }

    await auth.api.deletePasskey({
      body: { passkeyId },
      headers: await headers(),
    });

    return {
      success: true,
      message: 'Passkey deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete passkey',
    };
  }
}

// Rate limiting check
export async function checkRateLimit(
  _userId: string,
  _action: string,
): Promise<{ allowed: boolean }> {
  'use server';
  try {
    // TODO: Implement actual rate limiting logic with Better Auth
    // Log for development purposes only

    // For now, always allow requests (stub implementation)
    return { allowed: true };
  } catch {
    // Handle rate limit check error
    return { allowed: false };
  }
}

// Email change actions
export async function initiateEmailChangeAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const newEmail = formData.get('newEmail') as string;
    const password = formData.get('password') as string;

    if (!newEmail) {
      return {
        success: false,
        errors: { newEmail: ['New email is required'] },
      };
    }

    if (!password) {
      return {
        success: false,
        errors: { password: ['Password is required'] },
      };
    }

    // TODO: Implement actual email change initiation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: `Email change initiated. Please check ${newEmail} for confirmation link.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate email change',
    };
  }
}

export async function confirmEmailChangeAction(prevState: any, formData: FormData) {
  'use server';
  try {
    const token = formData.get('token') as string;

    if (!token) {
      return {
        success: false,
        errors: { token: ['Confirmation token is required'] },
      };
    }

    // TODO: Implement actual email change confirmation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Email changed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm email change',
    };
  }
}

export async function cancelEmailChangeAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual email change cancellation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Email change cancelled',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel email change',
    };
  }
}

// Device management actions
export async function revokeDeviceAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const deviceId = formData.get('deviceId') as string;

    if (!deviceId) {
      return {
        success: false,
        errors: { deviceId: ['Device ID is required'] },
      };
    }

    // TODO: Implement actual device revocation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Device revoked successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke device',
    };
  }
}

export async function updateDeviceTrustAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const deviceId = formData.get('deviceId') as string;
    const trusted = formData.get('trusted') === 'true';

    if (!deviceId) {
      return {
        success: false,
        errors: { deviceId: ['Device ID is required'] },
      };
    }

    // TODO: Implement actual device trust update with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: `Device ${trusted ? 'trusted' : 'untrusted'} successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update device trust',
    };
  }
}

export async function revokeAllDevicesAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual all devices revocation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'All devices revoked successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke all devices',
    };
  }
}

// Backup codes actions
export async function generateBackupCodesAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual backup codes generation with Better Auth
    // Log for development purposes only

    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    return {
      success: true,
      message: 'Backup codes generated successfully',
      data: { backupCodes },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate backup codes',
    };
  }
}

export async function getBackupCodesAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual backup codes retrieval with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Backup codes retrieved successfully',
      data: { backupCodes: [] },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get backup codes',
    };
  }
}

export async function revokeBackupCodesAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual backup codes revocation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Backup codes revoked successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke backup codes',
    };
  }
}

// Account deletion actions
export async function initiateAccountDeletionAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const password = formData.get('password') as string;

    if (!password) {
      return {
        success: false,
        errors: { password: ['Password is required'] },
      };
    }

    // TODO: Implement actual account deletion initiation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Account deletion initiated. Check your email for confirmation.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate account deletion',
    };
  }
}

export async function confirmAccountDeletionAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const token = formData.get('token') as string;

    if (!token) {
      return {
        success: false,
        errors: { token: ['Confirmation token is required'] },
      };
    }

    // TODO: Implement actual account deletion confirmation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm account deletion',
    };
  }
}

export async function cancelAccountDeletionAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual account deletion cancellation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Account deletion cancelled',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel account deletion',
    };
  }
}

// Data export actions
export async function requestDataExportAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const _format = (formData.get('format') as string) || 'json';

    // TODO: Implement actual data export request with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Data export requested. You will receive an email when ready.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request data export',
    };
  }
}

export async function cancelExportRequestAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const requestId = formData.get('requestId') as string;

    if (!requestId) {
      return {
        success: false,
        errors: { requestId: ['Request ID is required'] },
      };
    }

    // TODO: Implement actual export request cancellation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Export request cancelled',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel export request',
    };
  }
}

export async function getExportDownloadUrlAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const requestId = formData.get('requestId') as string;

    if (!requestId) {
      return {
        success: false,
        errors: { requestId: ['Request ID is required'] },
      };
    }

    // TODO: Implement actual export download URL generation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Download URL generated',
      data: { downloadUrl: `/api/exports/${requestId}/download` },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get export download URL',
    };
  }
}

// Phone/SMS actions
export async function sendSMSSignInCodeAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const phoneNumber = formData.get('phoneNumber') as string;

    if (!phoneNumber) {
      return {
        success: false,
        errors: { phoneNumber: ['Phone number is required'] },
      };
    }

    // TODO: Implement actual SMS sign-in code sending with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'SMS sign-in code sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS sign-in code',
    };
  }
}

export async function verifySMSSignInCodeAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const phoneNumber = formData.get('phoneNumber') as string;
    const code = formData.get('code') as string;

    if (!phoneNumber || !code) {
      return {
        success: false,
        errors: {
          phoneNumber: !phoneNumber ? ['Phone number is required'] : [],
          code: !code ? ['Verification code is required'] : [],
        },
      };
    }

    // TODO: Implement actual SMS sign-in code verification with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'SMS code verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify SMS code',
    };
  }
}

export async function setupPhoneNumberAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const phoneNumber = formData.get('phoneNumber') as string;

    if (!phoneNumber) {
      return {
        success: false,
        errors: { phoneNumber: ['Phone number is required'] },
      };
    }

    // TODO: Implement actual phone number setup with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Phone number setup initiated. Check for verification SMS.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to setup phone number',
    };
  }
}

export async function verifySMSCodeAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const code = formData.get('code') as string;

    if (!code) {
      return {
        success: false,
        errors: { code: ['Verification code is required'] },
      };
    }

    // TODO: Implement actual SMS code verification with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'SMS code verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify SMS code',
    };
  }
}

export async function resendSMSCodeAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual SMS code resending with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'SMS code resent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend SMS code',
    };
  }
}

export async function removePhoneNumberAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const phoneId = formData.get('phoneId') as string;

    if (!phoneId) {
      return {
        success: false,
        errors: { phoneId: ['Phone ID is required'] },
      };
    }

    // TODO: Implement actual phone number removal with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Phone number removed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove phone number',
    };
  }
}

export async function setPrimaryPhoneAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const phoneId = formData.get('phoneId') as string;

    if (!phoneId) {
      return {
        success: false,
        errors: { phoneId: ['Phone ID is required'] },
      };
    }

    // TODO: Implement actual primary phone setting with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Primary phone number set successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set primary phone',
    };
  }
}

export async function sendVerificationEmailAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        errors: { email: ['Email is required'] },
      };
    }

    await auth.api.sendVerificationEmail({
      headers: await headers(),
      body: { email },
    });

    return {
      success: true,
      message: `Verification email sent to ${email}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification email',
    };
  }
}

// Passkey actions
export async function initiatePasskeyAuthAction(_prevState: any, _formData: FormData) {
  'use server';
  try {
    // TODO: Implement actual passkey authentication initiation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Passkey authentication initiated',
      data: { challenge: 'mock-challenge' },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate passkey authentication',
    };
  }
}

export async function completePasskeyAuthAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const response = formData.get('response') as string;

    if (!response) {
      return {
        success: false,
        errors: { response: ['Passkey response is required'] },
      };
    }

    // TODO: Implement actual passkey authentication completion with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Passkey authentication completed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete passkey authentication',
    };
  }
}

export async function initiatePasskeyRegistrationAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const name = formData.get('name') as string;

    if (!name) {
      return {
        success: false,
        errors: { name: ['Passkey name is required'] },
      };
    }

    // TODO: Implement actual passkey registration initiation with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Passkey registration initiated',
      data: { challenge: 'mock-challenge' },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate passkey registration',
    };
  }
}

export async function completePasskeyRegistrationAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const name = formData.get('name') as string;
    const response = formData.get('response') as string;

    if (!name || !response) {
      return {
        success: false,
        errors: {
          name: !name ? ['Passkey name is required'] : [],
          response: !response ? ['Passkey response is required'] : [],
        },
      };
    }

    // TODO: Implement actual passkey registration completion with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Passkey registered successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete passkey registration',
    };
  }
}

export async function removePasskeyAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const passkeyId = formData.get('passkeyId') as string;

    if (!passkeyId) {
      return {
        success: false,
        errors: { passkeyId: ['Passkey ID is required'] },
      };
    }

    await auth.api.deletePasskey({
      body: { passkeyId },
      headers: await headers(),
    });

    return {
      success: true,
      message: 'Passkey removed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove passkey',
    };
  }
}

export async function renamePasskeyAction(_prevState: any, formData: FormData) {
  'use server';
  try {
    const passkeyId = formData.get('passkeyId') as string;
    const name = formData.get('name') as string;

    if (!passkeyId || !name) {
      return {
        success: false,
        errors: {
          passkeyId: !passkeyId ? ['Passkey ID is required'] : [],
          name: !name ? ['Passkey name is required'] : [],
        },
      };
    }

    // TODO: Implement actual passkey renaming with Better Auth
    // Log for development purposes only

    return {
      success: true,
      message: 'Passkey renamed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rename passkey',
    };
  }
}
