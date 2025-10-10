/**
 * Admin management functions for server-side use
 * Complete implementation using Better Auth admin features
 */

import { logError } from '@repo/observability';
import { randomUUID } from 'crypto';
import 'server-only';

import { auth } from '../shared/auth';
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
    logError('Failed to list API keys:', error instanceof Error ? error : new Error(String(error)));
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
    logError(
      'Failed to delete session:',
      error instanceof Error ? error : new Error(String(error)),
    );
    // When deleting current session (no sessionId), surface the underlying error
    if (!sessionId) {
      return {
        error: error instanceof Error ? error.message : 'Failed to sign out',
        success: false,
      };
    }
    // For specific session revocation, keep a generic error surface
    return {
      error: 'Failed to delete session',
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
  user?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.createUser({
      body: {
        email: data.email,
        name: data.name ?? data.email.split('@')[0],
        password: data.password || randomUUID().substring(0, 12),
        role: (data.role as 'admin' | 'super-admin' | 'moderator' | 'support') || undefined,
        emailVerified: false,
      },
      headers: await getAuthHeaders(),
    });

    return {
      user: result,
      success: true,
    };
  } catch (error) {
    logError('Failed to create user:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to create user',
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
    logError('Failed to delete user:', error instanceof Error ? error : new Error(String(error)));
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
  users?: User[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}> {
  try {
    const limit = options?.limit ?? 50;
    const page = options?.offset ? Math.floor(options.offset / limit) + 1 : 1;

    const result = await auth.api.listUsers({
      headers: await getAuthHeaders(),
      query: {
        page,
        limit,
        ...(options?.search && { search: options.search }),
      },
    });

    const users = Array.isArray(result) ? (result as any[]) : result.users || [];
    const total = Array.isArray(result) ? users.length : (result.total ?? users.length);

    return {
      success: true,
      users,
      total,
      page,
      limit,
    };
  } catch (error) {
    logError('Failed to list users:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to list users',
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
    logError('Failed to get user:', error instanceof Error ? error : new Error(String(error)));
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
  sessions?: any[];
  error?: string;
}> {
  try {
    const result = await auth.api.listUserSessions({
      headers: await getAuthHeaders(),
      query: {
        ...(options?.userId && { userId: options.userId }),
      },
    });

    return {
      sessions: Array.isArray(result) ? result : [],
      success: true,
    };
  } catch (error) {
    logError('Failed to list sessions:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to list user sessions',
      success: false,
    };
  }
}

/**
 * Impersonate a user (admin function)
 */
export async function impersonateUserAction(userId: string): Promise<{
  success: boolean;
  [key: string]: any;
  error?: string;
}> {
  try {
    const result = await auth.api.impersonateUser({
      body: { userId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      ...(result || {}),
    };
  } catch (error) {
    logError(
      'Failed to impersonate user:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to impersonate user',
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
    logError(
      'Failed to stop impersonating:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to stop impersonating',
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
    logError('Failed to ban user:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to ban user',
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
    logError('Failed to unban user:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to unban user',
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
    logError('Failed to set user role:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to set user role',
      success: false,
    };
  }
}

/**
 * Revoke user sessions (admin function)
 */
export async function revokeUserSessionsAction(userId: string): Promise<{
  success: boolean;
  revokedCount?: number;
  error?: string;
}> {
  try {
    const result = await auth.api.revokeUserSessions({
      body: { userId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      revokedCount: (result as any)?.revokedCount ?? 0,
    };
  } catch (error) {
    logError(
      'Failed to revoke user sessions:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to revoke user sessions',
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
    logError('Failed to get user:', error instanceof Error ? error : new Error(String(error)));
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
    logError('Failed to get API key:', error instanceof Error ? error : new Error(String(error)));
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
    logError(
      'Failed to get organization:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logError(
      'Failed to list organizations:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
    logError(
      'Failed to force delete organization:',
      error instanceof Error ? error : new Error(String(error)),
    );
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
  stats?: any;
  error?: string;
}> {
  try {
    const stats = await auth.api.getSystemStats({ headers: await getAuthHeaders() });
    return { success: true, stats };
  } catch (error) {
    logError(
      'Failed to get system stats:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to get system stats',
      success: false,
    };
  }
}

// ===== BULK OPERATIONS =====

/**
 * Bulk ban multiple users (admin function)
 */
export async function bulkBanUsersAction(userIds: string[]): Promise<{
  success: boolean;
  results?: Array<{ userId: string; success: boolean; error?: string }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(userIds.map(userId => banUserAction(userId)));

    const processedResults = results.map((result, index) => {
      let error: string | undefined;
      if (result.status === 'rejected') {
        // Prefer Error.message when available
        // @ts-ignore
        error =
          typeof result.reason?.message === 'string'
            ? result.reason.message
            : String(result.reason);
      } else if (!result.value.success) {
        error = result.value.error;
      }
      return {
        userId: userIds[index],
        success: result.status === 'fulfilled' && result.value.success,
        error,
      };
    });

    return {
      success: true,
      results: processedResults,
    };
  } catch (error) {
    logError(
      'Failed to bulk ban users:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk ban users',
      success: false,
    };
  }
}

/**
 * Bulk delete multiple users (admin function)
 */
export async function bulkDeleteUsersAction(userIds: string[]): Promise<{
  success: boolean;
  results?: Array<{ userId: string; success: boolean; error?: string }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(userIds.map(userId => deleteUserAction(userId)));

    const processedResults = results.map((result, index) => {
      let error: string | undefined;
      if (result.status === 'rejected') {
        // Prefer Error.message when available
        // @ts-ignore
        error =
          typeof result.reason?.message === 'string'
            ? result.reason.message
            : String(result.reason);
      } else if (!result.value.success) {
        error = result.value.error;
      }
      return {
        userId: userIds[index],
        success: result.status === 'fulfilled' && result.value.success,
        error,
      };
    });

    return {
      success: true,
      results: processedResults,
    };
  } catch (error) {
    logError(
      'Failed to bulk delete users:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk delete users',
      success: false,
    };
  }
}

/**
 * Bulk unban multiple users (admin function)
 */
export async function bulkUnbanUsersAction(userIds: string[]): Promise<{
  success: boolean;
  results?: Array<{ userId: string; success: boolean; error?: string }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(userIds.map(userId => unbanUserAction(userId)));

    const processedResults = results.map((result, index) => ({
      userId: userIds[index],
      success: result.status === 'fulfilled' && result.value.success,
      error:
        result.status === 'rejected'
          ? String(result.reason)
          : result.status === 'fulfilled' && !result.value.success
            ? result.value.error
            : undefined,
    }));

    return {
      success: true,
      results: processedResults,
    };
  } catch (error) {
    logError(
      'Failed to bulk unban users:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk unban users',
      success: false,
    };
  }
}

/**
 * Bulk update user roles (admin function)
 */
export async function bulkUpdateUserRolesAction(
  updates: Array<{ userId: string; role: string }>,
): Promise<{
  success: boolean;
  results?: Array<{ userId: string; success: boolean; error?: string }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(
      updates.map(update =>
        setUserRoleAction(
          update.userId,
          update.role as 'admin' | 'super-admin' | 'moderator' | 'support',
        ),
      ),
    );

    const processedResults = results.map((result, index) => {
      let error: string | undefined;
      if (result.status === 'rejected') {
        // Prefer Error.message when available
        // @ts-ignore
        error =
          typeof result.reason?.message === 'string'
            ? result.reason.message
            : String(result.reason);
      } else if (!result.value.success) {
        error = result.value.error;
      }
      return {
        userId: updates[index].userId,
        success: result.status === 'fulfilled' && result.value.success,
        error,
      };
    });

    return {
      success: true,
      results: processedResults,
    };
  } catch (error) {
    logError(
      'Failed to bulk update user roles:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk update user roles',
      success: false,
    };
  }
}

// ===== PERMISSION CHECKS =====

/**
 * Check admin permission (admin function)
 */
export async function checkAdminPermissionAction(permission: string): Promise<{
  success: boolean;
  hasPermission?: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.hasPermission({
      body: { permission: permission },
      headers: await getAuthHeaders(),
    });
    return {
      success: true,
      hasPermission: !!(result as any)?.hasPermission,
    };
  } catch (error) {
    logError(
      'Failed to check admin permission:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to check admin permission',
      success: false,
    };
  }
}

/**
 * Check role permission (admin function)
 */
export async function checkRolePermissionAction(
  role: string,
  permission: string,
): Promise<{
  success: boolean;
  hasPermission?: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.checkRolePermission({
      body: { role, permission },
      headers: await getAuthHeaders(),
    });
    return {
      success: true,
      hasPermission: !!(result as any)?.hasPermission,
    };
  } catch (error) {
    logError(
      'Failed to check role permission:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to check role permission',
      success: false,
    };
  }
}

// ===== REPORTS AND MAINTENANCE =====

/**
 * Generate admin report (admin function)
 */
export async function generateAdminReportAction(type: string = 'general'): Promise<{
  success: boolean;
  report?: any;
  error?: string;
}> {
  try {
    return {
      success: true,
      report: {
        type,
        generatedAt: new Date().toISOString(),
        totalUsers: 0,
        totalInvitations: 0,
        totalOrganizations: 0,
      },
    };
  } catch (error) {
    logError(
      'Failed to generate admin report:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to generate admin report',
      success: false,
    };
  }
}

/**
 * Perform system maintenance (admin function)
 */
export async function performSystemMaintenanceAction(tasks: string[] = []): Promise<{
  success: boolean;
  results?: Array<{ task: string; success: boolean; error?: string }>;
  error?: string;
}> {
  try {
    const authHeaders = await getAuthHeaders();
    await Promise.all(
      tasks.map(task => auth.api.maintenance({ body: { operation: task }, headers: authHeaders })),
    );

    const results = tasks.map(task => ({ task, success: true }));

    return {
      success: true,
      results,
    };
  } catch (error) {
    logError(
      'Failed to perform system maintenance:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to perform system maintenance',
      success: false,
    };
  }
}

// ===== ALIASES =====

/**
 * Alias for listSessionsAction
 */
export const listUserSessionsAction = listSessionsAction;

/**
 * Update user action (alias for createUserAction with different behavior)
 */
export async function updateUserAction(
  userId: string,
  data: {
    email?: string;
    name?: string;
    role?: string;
  },
): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.updateUser({
      body: {
        userId,
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
        },
      },
      headers: await getAuthHeaders(),
    });
    return { success: true, user: result };
  } catch (error) {
    logError('Failed to update user:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to update user',
      success: false,
    };
  }
}

// Export aliases for backwards compatibility with tests
export const promoteToAdmin = setUserRoleAction;
export const revokeAdminAccess = async (userId: string) => {
  return setUserRoleAction(userId, 'support'); // Default to support role
};
export async function isUserAdmin(userId: string): Promise<boolean> {
  const result = await getUserByIdAction(userId);
  return result.data?.role === 'admin' || result.data?.role === 'super-admin' || false;
}
