/**
 * Admin management functions for server-side use
 * Complete implementation using Better Auth admin features
 */

import 'server-only';
import { headers } from 'next/headers';

import { auth } from './auth';

import type { AuthSession, User } from '../shared/types';

/**
 * List all API keys (admin function)
 */
export async function listApiKeys(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const result = await auth.api.listApiKeys();

    if (!result.success) {
      return {
        error: result.error?.message || 'Failed to list API keys',
        success: false,
      };
    }

    return {
      data: result.apiKeys || [],
      success: true,
    };
  } catch (error) {
    console.error('Failed to list API keys:', error);
    return {
      error: 'Failed to list API keys',
      success: false,
    };
  }
}

/**
 * Delete a user session (admin function)
 */
export async function deleteSession(sessionId?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // If no sessionId provided, delete current session
    if (!sessionId) {
      const result = await auth.api.signOut();
      return {
        error: result.error?.message,
        success: result.success,
      };
    }

    // TODO: Implement session deletion by ID when Better Auth supports it
    throw new Error(
      'Session deletion by ID not implemented yet - requires Better Auth admin features',
    );
  } catch (error) {
    console.error('Failed to delete session:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete session',
      success: false,
    };
  }
}

/**
 * Create a new user (admin function)
 */
export async function createUser(data: {
  email: string;
  name: string;
  password?: string;
  role?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.createUser({
      body: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || 'user',
      },
      headers: await headers(),
    });

    return {
      data: result.user,
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to create user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create user',
      success: false,
    };
  }
}

/**
 * Delete a user (admin function)
 */
export async function deleteUser(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.removeUser({
      body: { userId },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete user',
      success: false,
    };
  }
}

/**
 * List all users (admin function)
 */
export async function listUsers(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{
  success: boolean;
  data?: User[];
  error?: string;
}> {
  try {
    const result = await auth.api.listUsers({
      headers: await headers(),
      query: {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        ...(options?.search && { search: options.search }),
      },
    });

    return {
      data: result.users,
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to list users:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to list users',
      success: false,
    };
  }
}

/**
 * List all sessions (admin function)
 */
export async function listSessions(options?: {
  limit?: number;
  offset?: number;
  userId?: string;
}): Promise<{
  success: boolean;
  data?: AuthSession[];
  error?: string;
}> {
  try {
    const result = await auth.api.listSessions({
      headers: await headers(),
      query: {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        ...(options?.userId && { userId: options.userId }),
      },
    });

    return {
      data: result.sessions,
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to list sessions:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to list sessions',
      success: false,
    };
  }
}

/**
 * Impersonate a user (admin function)
 */
export async function impersonateUser(userId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.impersonateUser({
      body: { userId },
      headers: await headers(),
    });

    return {
      data: result.session,
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to impersonate user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to impersonate user',
      success: false,
    };
  }
}

/**
 * Stop impersonating a user (admin function)
 */
export async function stopImpersonating(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.stopImpersonating({
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to stop impersonating:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to stop impersonating',
      success: false,
    };
  }
}

/**
 * Ban a user (admin function)
 */
export async function banUser(
  userId: string,
  reason?: string,
  expiresAt?: Date,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.banUser({
      body: { 
        userId,
        ...(reason && { reason }),
        ...(expiresAt && { expiresAt: expiresAt.toISOString() }),
      },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to ban user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to ban user',
      success: false,
    };
  }
}

/**
 * Unban a user (admin function)
 */
export async function unbanUser(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to unban user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to unban user',
      success: false,
    };
  }
}

/**
 * Set user role (admin function)
 */
export async function setUserRole(
  userId: string,
  role: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.setRole({
      body: { userId, role },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to set user role:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to set user role',
      success: false,
    };
  }
}

/**
 * Revoke user sessions (admin function)
 */
export async function revokeUserSessions(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.revokeUserSessions({
      body: { userId },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Failed to revoke user sessions:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to revoke user sessions',
      success: false,
    };
  }
}
