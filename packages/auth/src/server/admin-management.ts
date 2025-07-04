/**
 * Admin management functions for server-side use
 * Complete implementation using Better Auth admin features
 */

import 'server-only';
import { syncLogger as logger } from '../shared/utils/logger';
import { randomUUID } from 'crypto';

import { auth } from '../shared/auth.config';
import { getAuthHeaders } from './get-headers';

import type { User } from '../shared/types';

/**
 * List all API keys (admin function)
 */
export async function listApiKeysAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const result = await auth.api.listApiKeys({
      headers: await getAuthHeaders(),
    });

    return {
      data: Array.isArray(result) ? result : [],
      success: true,
    };
  } catch (error) {
    logger.error('Failed to list API keys:', error);
    return {
      error: 'Failed to list API keys',
      success: false,
    };
  }
}

/**
 * Delete a user session (admin function)
 */
export async function deleteSessionAction(sessionId?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // If no sessionId provided, delete current session
    if (!sessionId) {
      await auth.api.signOut({ headers: await getAuthHeaders() });
      return {
        success: true,
      };
    }

    // Use Better Auth admin function to revoke session by ID
    await auth.api.revokeSession({
      body: { sessionId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to delete session:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete session',
      success: false,
    };
  }
}

/**
 * Create a new user (admin function)
 */
export async function createUserAction(data: {
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
      headers: await getAuthHeaders(),
    });

    return {
      data: result.user,
      success: true,
    };
  } catch (error) {
    logger.error('Failed to create user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create user',
      success: false,
    };
  }
}

/**
 * Delete a user (admin function)
 */
export async function deleteUserAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await auth.api.removeUser({
      body: { userId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to delete user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete user',
      success: false,
    };
  }
}

/**
 * List all users (admin function)
 */
export async function listUsersAction(options?: {
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
      headers: await getAuthHeaders(),
      query: {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        ...(options?.search && { search: options.search }),
      },
    });

    return {
      data: result.users || [],
      success: true,
    };
  } catch (error) {
    logger.error('Failed to list users:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to list users',
      success: false,
    };
  }
}

/**
 * Get a specific user by ID (admin function)
 */
export async function getUserByIdAction(userId: string): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  try {
    // Better Auth doesn't have a direct getUserById admin API,
    // so we'll use listUsers with a search
    const result = await auth.api.listUsers({
      headers: await getAuthHeaders(),
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
      success: true,
    };
  } catch (error) {
    logger.error('Failed to get user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get user',
      success: false,
    };
  }
}

/**
 * List all sessions (admin function)
 */
export async function listSessionsAction(options?: {
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
      headers: await getAuthHeaders(),
      query: {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        ...(options?.userId && { userId: options.userId }),
      },
    });

    return {
      data: Array.isArray(result) ? result : [],
      success: true,
    };
  } catch (error) {
    logger.error('Failed to list sessions:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to list sessions',
      success: false,
    };
  }
}

/**
 * Impersonate a user (admin function)
 */
export async function impersonateUserAction(userId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.impersonateUser({
      body: { userId },
      headers: await getAuthHeaders(),
    });

    return {
      data: result.session,
      success: true,
    };
  } catch (error) {
    logger.error('Failed to impersonate user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to impersonate user',
      success: false,
    };
  }
}

/**
 * Stop impersonating a user (admin function)
 */
export async function stopImpersonatingAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await auth.api.stopImpersonating({
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to stop impersonating:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to stop impersonating',
      success: false,
    };
  }
}

/**
 * Ban a user (admin function)
 */
export async function banUserAction(
  userId: string,
  reason?: string,
  expiresAt?: Date,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await auth.api.banUser({
      body: {
        userId,
        ...(reason && { reason }),
        ...(expiresAt && { expiresAt: expiresAt.toISOString() }),
      },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to ban user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to ban user',
      success: false,
    };
  }
}

/**
 * Unban a user (admin function)
 */
export async function unbanUserAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await auth.api.unbanUser({
      body: { userId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to unban user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to unban user',
      success: false,
    };
  }
}

/**
 * Set user role (admin function)
 */
export async function setUserRoleAction(
  userId: string,
  role: 'admin' | 'super-admin' | 'moderator' | 'support',
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await auth.api.setRole({
      body: { userId, role },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to set user role:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to set user role',
      success: false,
    };
  }
}

/**
 * Revoke user sessions (admin function)
 */
export async function revokeUserSessionsAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await auth.api.revokeUserSessions({
      body: { userId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to revoke user sessions:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to revoke user sessions',
      success: false,
    };
  }
}

/**
 * Get a single user by ID (admin function)
 */
export async function getUserAction(userId: string): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  try {
    // List users and find the one with matching ID
    const result = await auth.api.listUsers({
      headers: await getAuthHeaders(),
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
      success: true,
    };
  } catch (error) {
    logger.error('Failed to get user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get user',
      success: false,
    };
  }
}

/**
 * Get a single API key by ID (admin function)
 */
export async function getApiKeyAction(apiKeyId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // List API keys and find the one with matching ID
    const result = await auth.api.listApiKeys({
      headers: await getAuthHeaders(),
    });

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
      success: true,
    };
  } catch (error) {
    logger.error('Failed to get API key:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get API key',
      success: false,
    };
  }
}

/**
 * Get a single organization by ID (admin function)
 */
export async function getOrganizationAction(organizationId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.getFullOrganization({
      headers: await getAuthHeaders(),
      query: { organizationId },
    });

    return {
      data: result,
      success: true,
    };
  } catch (error) {
    logger.error('Failed to get organization:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get organization',
      success: false,
    };
  }
}

/**
 * List all organizations (admin function)
 */
export async function listOrganizationsAction(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const result = await auth.api.listOrganizations({
      headers: await getAuthHeaders(),
      body: {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        ...(options?.search && { search: options.search }),
      },
    });

    return {
      data: result.organizations || [],
      success: true,
    };
  } catch (error) {
    logger.error('Failed to list organizations:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to list organizations',
      success: false,
    };
  }
}

/**
 * Force delete organization (admin function)
 */
export async function forceDeleteOrganizationAction(organizationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await auth.api.deleteOrganization({
      body: { organizationId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to force delete organization:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to force delete organization',
      success: false,
    };
  }
}

/**
 * Get system statistics (admin function)
 */
export async function getSystemStatsAction(): Promise<{
  success: boolean;
  data?: {
    totalUsers: number;
    totalOrganizations: number;
    totalApiKeys: number;
    totalSessions: number;
  };
  error?: string;
}> {
  try {
    // Get all the data in parallel
    const [usersResult, orgsResult, apiKeysResult, sessionsResult] = await Promise.allSettled([
      auth.api.listUsers({
        headers: await getAuthHeaders(),
        query: { limit: 10000 }, // High limit to get total count
      }),
      auth.api.listOrganizations({
        headers: await getAuthHeaders(),
        body: { limit: 10000 },
      }),
      auth.api.listApiKeys({
        headers: await getAuthHeaders(),
      }),
      auth.api.listSessions({
        headers: await getAuthHeaders(),
        query: { limit: 10000 },
      }),
    ]);

    const totalUsers =
      usersResult.status === 'fulfilled' ? usersResult.value.users?.length || 0 : 0;
    const totalOrganizations =
      orgsResult.status === 'fulfilled' ? orgsResult.value.organizations?.length || 0 : 0;
    const totalApiKeys =
      apiKeysResult.status === 'fulfilled'
        ? Array.isArray(apiKeysResult.value)
          ? apiKeysResult.value.length
          : 0
        : 0;
    const totalSessions =
      sessionsResult.status === 'fulfilled'
        ? Array.isArray(sessionsResult.value)
          ? sessionsResult.value.length
          : 0
        : 0;

    return {
      success: true,
      data: {
        totalUsers,
        totalOrganizations,
        totalApiKeys,
        totalSessions,
      },
    };
  } catch (error) {
    logger.error('Failed to get system stats:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get system stats',
      success: false,
    };
  }
}
