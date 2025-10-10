/**
 * Opinionated Next.js route handler wrapper for Better Auth.
 */

import { logError } from '@repo/observability';
import { NextResponse } from 'next/server';

import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '../shared/auth';
import { isAuthEnabled } from '../shared/utils/feature-flags';

type EnabledPredicate = boolean | (() => boolean | Promise<boolean>);

type RouteHandler = (request: Request, context: any) => Promise<Response>;

export interface NextAuthRouteOptions {
  enabled?: EnabledPredicate;
  onDisabled?: (request: Request) => Response;
  onError?: (error: unknown, request: Request) => Response;
}

const defaultDisabledResponse = () =>
  NextResponse.json(
    {
      error: 'Not Found',
      message: 'Authentication endpoints are not available',
      code: 'AUTH_DISABLED',
    },
    { status: 404 },
  );

const defaultErrorResponse = () =>
  NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'Authentication service temporarily unavailable',
    },
    { status: 500 },
  );

const resolveEnabled = async (flag?: EnabledPredicate) => {
  if (typeof flag === 'boolean') return flag;
  if (typeof flag === 'function') {
    const result = await flag();
    if (typeof result === 'boolean') return result;
  }
  return isAuthEnabled();
};

const wrapHandler = (
  handler: RouteHandler | undefined,
  options: NextAuthRouteOptions,
  method: string,
): RouteHandler => {
  const methodHandler: RouteHandler =
    handler ?? (async () => NextResponse.json({}, { status: 405 }));

  return async (request: Request, context: any) => {
    const enabled = await resolveEnabled(options.enabled);
    if (!enabled) {
      return options.onDisabled?.(request) ?? defaultDisabledResponse();
    }

    try {
      return await methodHandler(request, context);
    } catch (error) {
      void logError(`[Auth Route] ${method} handler error`, {
        error,
        url: request.url,
        method,
      });
      return options.onError?.(error, request) ?? defaultErrorResponse();
    }
  };
};

export function createNextAuthRouteHandler(options: NextAuthRouteOptions = {}) {
  const handlers = toNextJsHandler(auth.handler) as Record<string, RouteHandler>;

  return {
    DELETE: wrapHandler(handlers.DELETE, options, 'DELETE'),
    GET: wrapHandler(handlers.GET, options, 'GET'),
    HEAD: wrapHandler(handlers.HEAD, options, 'HEAD'),
    OPTIONS: wrapHandler(handlers.OPTIONS, options, 'OPTIONS'),
    PATCH: wrapHandler(handlers.PATCH, options, 'PATCH'),
    POST: wrapHandler(handlers.POST, options, 'POST'),
    PUT: wrapHandler(handlers.PUT, options, 'PUT'),
  };
}
