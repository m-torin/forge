/**
 * Opinionated Next.js middleware helper wired to auth feature flags.
 */

import { logError } from '@repo/observability';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import type { MiddlewareOptions } from '../shared/types';
import { isAuthEnabled } from '../shared/utils/feature-flags';
import { createWebMiddleware } from './middleware/index';

type EnabledPredicate = boolean | (() => boolean | Promise<boolean>);

export interface NextAuthMiddlewareOptions
  extends Omit<MiddlewareOptions, 'publicPaths' | 'redirectTo' | 'enabled'> {
  enabled?: EnabledPredicate;
  publicPaths?: string[];
  protectedPaths?: string[];
  redirectTo?: string;
  onDisabled?: (request: NextRequest) => NextResponse | Response;
  onError?: (error: unknown, request: NextRequest) => NextResponse | Response;
}

const resolveEnabled = async (flag?: EnabledPredicate): Promise<boolean> => {
  if (typeof flag === 'boolean') return flag;
  if (typeof flag === 'function') {
    try {
      const result = await flag();
      if (typeof result === 'boolean') {
        return result;
      }
    } catch (error) {
      logError('Auth middleware enabled predicate failed', error as Error);
    }
  }
  return isAuthEnabled();
};

export function createNextAuthMiddleware(options: NextAuthMiddlewareOptions = {}) {
  const {
    enabled,
    onDisabled,
    onError,
    protectedPaths,
    publicPaths,
    redirectTo,
    ...middlewareOptions
  } = options;

  const webMiddleware = createWebMiddleware({
    ...middlewareOptions,
    protectedPaths,
    publicPaths,
    redirectTo,
  });

  return async function nextAuthMiddleware(request: NextRequest) {
    const active = await resolveEnabled(enabled);

    if (!active) {
      const disabledResponse = onDisabled?.(request) ?? NextResponse.next();
      disabledResponse.headers.set('x-auth-enabled', 'false');
      return disabledResponse;
    }

    try {
      const response = await webMiddleware(request);
      response.headers.set('x-auth-enabled', 'true');
      return response;
    } catch (error) {
      logError('Auth middleware execution failed', error as Error);
      if (onError) {
        return onError(error, request);
      }
      const fallback = NextResponse.next();
      fallback.headers.set('x-auth-enabled', 'false');
      fallback.headers.set('x-auth-error', 'middleware-failed');
      return fallback;
    }
  };
}
