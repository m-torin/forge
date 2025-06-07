/**
 * Admin management functions for server-side use
 * These are stubs that need to be implemented when Better Auth admin features are finalized
 */

import 'server-only';

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
 * Delete a user (admin function)
 */
export async function deleteUser(userId?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // TODO: Implement user deletion when Better Auth admin features are finalized
    throw new Error('User deletion not implemented yet - requires Better Auth admin features');
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
export async function listUsers(): Promise<{
  success: boolean;
  data?: User[];
  error?: string;
}> {
  try {
    // TODO: Implement user listing when Better Auth admin features are finalized
    throw new Error('User listing not implemented yet - requires Better Auth admin features');
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
export async function listSessions(): Promise<{
  success: boolean;
  data?: AuthSession[];
  error?: string;
}> {
  try {
    // TODO: Implement session listing when Better Auth admin features are finalized
    throw new Error('Session listing not implemented yet - requires Better Auth admin features');
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
  error?: string;
}> {
  try {
    // TODO: Implement user impersonation when Better Auth admin features are finalized
    throw new Error('User impersonation not implemented yet - requires Better Auth admin features');
  } catch (error) {
    console.error('Failed to impersonate user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to impersonate user',
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
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // TODO: Implement user banning when Better Auth admin features are finalized
    throw new Error('User banning not implemented yet - requires Better Auth admin features');
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
    // TODO: Implement user unbanning when Better Auth admin features are finalized
    throw new Error('User unbanning not implemented yet - requires Better Auth admin features');
  } catch (error) {
    console.error('Failed to unban user:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to unban user',
      success: false,
    };
  }
}
