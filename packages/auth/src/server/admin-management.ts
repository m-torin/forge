/**
 * Admin management functions for server-side use
 * Complete implementation using Better Auth admin features
 */

import 'server-only';

import { randomUUID } from 'crypto';

import { headers } from 'next/headers';

import { auth } from './auth';

import type { User } from '../shared/types';

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

    return {
      data: Array.isArray(result) ? result : [],
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
      const result = await auth.api.signOut({ headers: await headers() });
      return {
        error: undefined,
        success: true,
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
  name?: string;
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
        name: data.name ?? data.email.split('@')[0],
        password: data.password || randomUUID().substring(0, 12),
        role: (data.role as 'admin' | 'super-admin' | 'moderator' | 'support') || undefined,
      },
      headers: await headers(),
    });

    return {
      data: result.user,
      error: undefined,
      success: true,
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
      error: undefined,
      success: true,
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
      data: result.users || [],
      error: undefined,
      success: true,
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
 * Get a specific user by ID (admin function)
 */
export async function getUserById(userId: string): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  try {
    // Better Auth doesn't have a direct getUserById admin API,
    // so we'll use listUsers with a search
    const result = await auth.api.listUsers({
      headers: await headers(),
      query: {
        limit: 100,
        offset: 0,
      },
    });

    const user = result.users?.find((u: any) => u.id === userId);

    if (!user) {
      return {
        error: 'User not found',
        success: false,
      };
    }

    return {
      data: user,
      error: undefined,
      success: true,
    };
  } catch (error) {
    console.error('Failed to get user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get user',
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
  data?: any[];
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
      data: Array.isArray(result) ? result : [],
      error: undefined,
      success: true,
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
      error: undefined,
      success: true,
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
      error: undefined,
      success: true,
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
      error: undefined,
      success: true,
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
      error: undefined,
      success: true,
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
  role: 'admin' | 'super-admin' | 'moderator' | 'support',
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
      error: undefined,
      success: true,
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
      error: undefined,
      success: true,
    };
  } catch (error) {
    console.error('Failed to revoke user sessions:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to revoke user sessions',
      success: false,
    };
  }
}

/**
 * Get a single user by ID (admin function)
 */
export async function getUser(userId: string): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  try {
    // List users and find the one with matching ID
    const result = await auth.api.listUsers({
      headers: await headers(),
      query: {
        limit: 1000, // High limit to ensure we find the user
      },
    });

    const user = result.users?.find((u: any) => u.id === userId);

    if (!user) {
      return {
        error: 'User not found',
        success: false,
      };
    }

    return {
      data: user,
      error: undefined,
      success: true,
    };
  } catch (error) {
    console.error('Failed to get user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get user',
      success: false,
    };
  }
}

/**
 * Get a single API key by ID (admin function)
 */
export async function getApiKey(apiKeyId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // List API keys and find the one with matching ID
    const result = await auth.api.listApiKeys();

    const apiKey = Array.isArray(result)
      ? result.find((key: any) => key.id === apiKeyId)
      : undefined;

    if (!apiKey) {
      return {
        error: 'API key not found',
        success: false,
      };
    }

    return {
      data: apiKey,
      error: undefined,
      success: true,
    };
  } catch (error) {
    console.error('Failed to get API key:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get API key',
      success: false,
    };
  }
}

/**
 * Get a single organization by ID (admin function)
 */
export async function getOrganization(organizationId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId },
    });

    return {
      data: result,
      error: undefined,
      success: true,
    };
  } catch (error) {
    console.error('Failed to get organization:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get organization',
      success: false,
    };
  }
}
