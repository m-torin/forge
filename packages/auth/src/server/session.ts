/**
 * Server session utilities for Next.js
 */

import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import 'server-only';

import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

import { auth } from '../shared/auth';
import type { AuthSession } from '../types';

type HeadersInit = Headers | ReadonlyHeaders | Record<string, string>;

export interface FetchSessionOptions {
  enabled?: boolean;
  headers?: HeadersInit;
  request?: NextRequest | Request;
  throwOnMissing?: boolean;
}

const normalizeHeaders = async (
  options: FetchSessionOptions,
): Promise<Headers | ReadonlyHeaders | Record<string, string>> => {
  if (options.headers) return options.headers;
  if (options.request) {
    return options.request.headers as Headers;
  }
  return await headers();
};

const toAuthSession = (session: any): AuthSession => ({
  user: session.user,
  session: session.session,
  activeOrganizationId: (session.session as any)?.activeOrganizationId ?? null,
});

/**
 * Fetches the Better Auth session for the current request context.
 */
export async function fetchSession(options: FetchSessionOptions = {}): Promise<AuthSession | null> {
  if (options.enabled === false) return null;

  try {
    const session = await auth.api.getSession({
      headers: await normalizeHeaders(options),
    });

    if (!session) {
      if (options.throwOnMissing) {
        throw new Error('Authentication required');
      }
      return null;
    }

    return toAuthSession(session);
  } catch (error) {
    if (options.throwOnMissing) {
      throw error instanceof Error ? error : new Error(String(error));
    }
    throw new Error(`Failed to get session: ${error}`);
  }
}

/**
 * Get session in Next.js server components
 */
export async function getSession(options: FetchSessionOptions = {}): Promise<AuthSession | null> {
  return fetchSession(options);
}

/**
 * Get current user
 */
export async function getCurrentUser(options: FetchSessionOptions = {}) {
  const session = await fetchSession(options);
  return session?.user || null;
}

/**
 * Require authentication
 */
export async function requireAuth(options: FetchSessionOptions = {}): Promise<AuthSession> {
  const session = await fetchSession({ ...options, throwOnMissing: true });

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}
