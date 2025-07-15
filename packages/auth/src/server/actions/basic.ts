/**
 * Basic server actions for auth operations
 */

'use server';

import { headers } from 'next/headers';
import { auth } from '../../shared/auth';
import type { AuthResponse, Session, User } from '../../types';

// Session Management
export async function getSessionAction(): Promise<AuthResponse<Session>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return { data: session, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function deleteSessionAction(): Promise<AuthResponse> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { data: { message: 'Signed out' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// User Management
export async function getCurrentUserAction(): Promise<AuthResponse<User>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { data: null, error: 'Not authenticated', success: false };
    }
    return { data: session.user, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function updateUserAction(data: {
  name?: string;
  email?: string;
  bio?: string;
  locale?: string;
  timezone?: string;
}): Promise<AuthResponse<{ message: string }>> {
  try {
    await auth.api.updateUser({
      body: data,
      headers: await headers(),
    });
    return { data: { message: 'User updated successfully' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}): Promise<AuthResponse> {
  try {
    const result = await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions ?? true,
      },
      headers: await headers(),
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function listAccountsAction(): Promise<AuthResponse> {
  try {
    const result = await auth.api.listUserAccounts({
      headers: await headers(),
    });
    return { data: result || [], success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function unlinkAccountAction(provider: string): Promise<AuthResponse> {
  try {
    const result = await auth.api.unlinkAccount({
      body: { providerId: provider },
      headers: await headers(),
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}
