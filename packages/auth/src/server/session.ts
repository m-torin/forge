/**
 * Server session utilities for Next.js
 */

import { headers } from 'next/headers';
import 'server-only';
import { auth } from '../shared/auth';
import type { AuthSession } from '../types';

/**
 * Get session in Next.js server components
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return null;

    return {
      user: session.user,
      session: session.session,
      activeOrganizationId: (session.session as any).activeOrganizationId,
    };
  } catch (error) {
    throw new Error(`Failed to get session: ${error}`);
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Require authentication
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}
