/**
 * User management server actions
 */

import 'server-only';

import { syncLogger as logger } from '../shared/utils/logger';
import { auth } from '../shared/auth.config';
import { getAuthHeaders } from './get-headers';

import type {
  UpdateUserData,
  ChangeEmailData,
  ChangePasswordData,
  SetPasswordData,
  DeleteUserData,
  LinkSocialData,
  UnlinkAccountData,
  AuthResponse,
  Account,
} from '../types';

/**
 * Updates user information using better-auth native method
 */
export async function updateUserAction(
  data: UpdateUserData,
): Promise<AuthResponse<{ message: string }>> {
  try {
    await auth.api.updateUser({
      body: data,
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      data: { message: 'User updated successfully' },
    };
  } catch (error) {
    logger.error('Update user error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to update user',
    };
  }
}

/**
 * Changes user email using better-auth native method
 */
export async function changeEmailAction(
  data: ChangeEmailData,
): Promise<AuthResponse<{ message: string }>> {
  try {
    await auth.api.changeEmail({
      body: data,
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      data: { message: 'Email change initiated. Please check your email for verification.' },
    };
  } catch (error) {
    logger.error('Change email error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to change email',
    };
  }
}

/**
 * Changes user password using better-auth native method
 */
export async function changePasswordAction(
  data: ChangePasswordData,
): Promise<AuthResponse<{ message: string }>> {
  try {
    await auth.api.changePassword({
      body: data,
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      data: { message: 'Password changed successfully' },
    };
  } catch (error) {
    logger.error('Change password error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to change password',
    };
  }
}

/**
 * Sets password for user (server-only for security)
 */
export async function setPasswordAction(
  data: SetPasswordData,
): Promise<AuthResponse<{ message: string }>> {
  try {
    await auth.api.setPassword({
      body: data,
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      data: { message: 'Password set successfully' },
    };
  } catch (error) {
    logger.error('Set password error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to set password',
    };
  }
}

/**
 * Deletes user account using better-auth native method
 */
export async function deleteUserAction(
  data?: DeleteUserData,
): Promise<AuthResponse<{ message: string }>> {
  try {
    await auth.api.deleteUser({
      body: data || {},
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      data: { message: 'User account deleted successfully' },
    };
  } catch (error) {
    logger.error('Delete user error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to delete user account',
    };
  }
}

/**
 * Lists user accounts using better-auth native method
 */
export async function listUserAccountsAction(): Promise<AuthResponse<Account[]>> {
  try {
    const accounts = await auth.api.listAccounts({
      headers: await getAuthHeaders(),
    });

    // Convert better-auth account format to our Account interface
    const formattedAccounts: Account[] = (accounts || []).map((account: any) => ({
      id: account.id,
      accountId: account.accountId,
      providerId: account.providerId,
      userId: account.userId,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      idToken: account.idToken,
      accessTokenExpiresAt: account.accessTokenExpiresAt
        ? new Date(account.accessTokenExpiresAt)
        : undefined,
      refreshTokenExpiresAt: account.refreshTokenExpiresAt
        ? new Date(account.refreshTokenExpiresAt)
        : undefined,
      scope: account.scope,
      password: account.password,
      createdAt: new Date(account.createdAt),
      updatedAt: new Date(account.updatedAt),
    }));

    return {
      success: true,
      data: formattedAccounts,
    };
  } catch (error) {
    logger.error('List user accounts error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to list user accounts',
    };
  }
}

/**
 * Links a social account using better-auth native method
 */
export async function linkSocialAction(
  data: LinkSocialData,
): Promise<AuthResponse<{ url: string }>> {
  try {
    const result = await auth.api.linkSocial({
      body: data,
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      data: { url: result.url || data.callbackURL || '/' },
    };
  } catch (error) {
    logger.error('Link social error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to link social account',
    };
  }
}

/**
 * Unlinks an account using better-auth native method
 */
export async function unlinkAccountAction(
  data: UnlinkAccountData,
): Promise<AuthResponse<{ message: string }>> {
  try {
    await auth.api.unlinkAccount({
      body: data,
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      data: { message: 'Account unlinked successfully' },
    };
  } catch (error) {
    logger.error('Unlink account error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to unlink account',
    };
  }
}

/**
 * Gets current user session with full information
 */
export async function getCurrentUserAction(): Promise<AuthResponse<any>> {
  try {
    const session = await auth.api.getSession({
      headers: await getAuthHeaders(),
    });

    if (!session) {
      return {
        success: false,
        data: null,
        error: 'No active session',
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    logger.error('Get current user error:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to get current user',
    };
  }
}
